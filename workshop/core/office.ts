// Eden Office status feed: turns repo state (QC queue, numbers gates, routines, each agent's now.json) plus a few
// inputs Radar gathers in a connector session (ledger view, inbox sweep, missed calls, routine runs, tickets) into the
// documents the Office page reads. Pure functions: no network, no writes. The CLI (workshop/office/office.ts) does the I/O.
// Spec: projects/virtual-office/research/q-architecture.md
import type { QcItem } from "./qc.ts";
import type { GateRecord } from "./numbers-gate.ts";

/** One light per desk. Priority (Radar's proposal, Kev to confirm): urgent > reply > review > blocked > working > idle. */
export type Light = "urgent" | "reply" | "review" | "blocked" | "working" | "idle";
export const PRIORITY: Light[] = ["urgent", "reply", "review", "blocked", "working", "idle"];
/** Every colour is paired with a word and a shape on the page (colour-blind safe). */
export const LIGHT_WORD: Record<Light, string> = {
  urgent: "Urgent", reply: "Reply", review: "Ready to review", blocked: "Waiting on you", working: "Working", idle: "Idle",
};

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;
/** A "working" glow is only believed if the agent was heard from this recently (Scout: a green glow on a dead agent is the worst lie). */
export const WORKING_FRESH_HOURS = 4;
/** A pending QC item older than this goes from amber/green to red. */
export const QC_OVERDUE_DAYS = 5;
/** A gate that passed this recently shows its preparer as "ready to review". */
export const GATE_RECENT_DAYS = 3;
/** How long after a quiet period an agent is called "silent" (hours). Radar runs daily; the rest are on demand. */
export const EXPECTED_EVERY_HOURS: Record<string, number> = { radar: 30 };
export const DEFAULT_EXPECTED_EVERY_HOURS = 96;

export type Desk = "centre" | "recruiting" | "finance" | "family" | "other";
export const DESKS: Record<string, Desk> = {
  radar: "centre", scout: "recruiting", q: "recruiting", dean: "recruiting", host: "recruiting",
  tally: "finance", docket: "finance", atlas: "family", "housing-architect": "family", keys: "family", hale: "family", jethro: "family", barnabas: "family",
};
/** Hidden or blanked under the Screen-share switch: finance, family and the coaching desk. */
export const SENSITIVE_AGENTS = new Set(["tally", "docket", "atlas", "housing-architect", "keys", "dean", "hale", "jethro", "barnabas"]);

export type AgentLite = { id: string; name: string; title?: string };
export type NowFile = { task?: string; since?: string; state?: "working" | "idle" | "blocked"; blockedOn?: string; updated?: string };
export type LedgerRow = { id?: string; item: string; owner: string; lane?: string; due?: string; status?: string; url?: string };
export type InboxItem = { agent?: string; title: string; kind?: "client" | "team" | "candidate"; raisedAt: string; url?: string };
export type CallItem = { who: string; company?: string; at: string; returned?: boolean };
export type RunResult = { routine: string; agent?: string; lastRunAt?: string; ok: boolean; note?: string };
export type TicketLite = { id: string; agent: string; status: string; pickedAt?: string; priority?: string };
export type RoutineLite = { id: string; name: string; agent: string; trigger_id: string | null; cron?: string };

export type SyncInput = {
  now: Date;
  agents: AgentLite[];
  qc: QcItem[];
  gates: GateRecord[];
  routines: RoutineLite[];
  nowFiles?: Record<string, NowFile>;
  /** ISO time each agent last produced anything (git log, memory write, QC item). Optional. */
  heard?: Record<string, string>;
  ledger?: LedgerRow[];
  inbox?: InboxItem[];
  calls?: CallItem[];
  runs?: RunResult[];
  tickets?: TicketLite[];
};

export type Alert = {
  id: string;
  agent: string;
  light: Exclude<Light, "working" | "idle">;
  kind: "qc" | "gate" | "ledger" | "inbox" | "call" | "routine" | "blocked";
  title: string;
  source: string;
  raisedAt: string;
  /** True when Kev himself must act (feeds the ranked "Needs Kev" strip). */
  needsKev: boolean;
  /** Hidden under Screen-share. */
  sensitive: boolean;
  link?: string;
  /** send_message items: the draft to proof in the Office before opening Superhuman (phone numbers removed). */
  preview?: { to: string[]; text: string };
};

export type AgentDoc = {
  id: string; name: string; role: string; desk: Desk; sensitive: boolean;
  light: Light; counts: Record<Light, number>;
  task: string | null; taskSince: string | null;
  lastHeard: string | null; stale: boolean; silent: boolean; expectedEveryHours: number;
  openTickets: number; pendingQc: number;
  updated: string; source: string;
};

/** Strip what must never reach the Office: emails, phone numbers, long digit runs, dollar amounts (unless allowMoney). */
export function scrub(text: string, max = 90, allowMoney = false): string {
  let t = String(text ?? "")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/\(?\+?\d[\d\s().-]{8,}\d/g, "[number]");
  if (!allowMoney) t = t.replace(/\$\s?\d[\d,]*(\.\d+)?(?:[kKmM]\b)?/g, "[amount]");
  t = t.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

const ageMs = (iso: string | undefined, now: Date) => (iso ? now.getTime() - Date.parse(iso) : Infinity);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Ledger Owner names map to agent ids (Marlowe is housing-architect). */
function ownerToAgent(owner: string, agents: AgentLite[]): string | undefined {
  const o = owner.trim().toLowerCase();
  return agents.find((a) => a.id === o || a.name.toLowerCase() === o)?.id;
}

/** Superhuman's connector gives no per-draft link, so a ready draft opens Superhuman itself; the alert names the subject (Drafts: G then D). */
export const SUPERHUMAN_URL = "https://mail.superhuman.com/";

export function buildAlerts(input: SyncInput): Alert[] {
  const { now } = input;
  const out: Alert[] = [];
  const sens = (agent: string) => SENSITIVE_AGENTS.has(agent);
  const add = (a: Omit<Alert, "sensitive">) => out.push({ ...a, sensitive: sens(a.agent) });

  for (const q of input.qc) {
    if (q.status !== "pending") continue;
    const overdue = ageMs(q.createdAt, now) >= QC_OVERDUE_DAYS * DAY;
    // A drafted message is finished work to read; spend, publish, delete and write_external are waiting on a yes.
    const light = overdue ? "urgent" : q.kind === "send_message" ? "review" : "blocked";
    add({
      id: `sync-qc-${q.id}`, agent: q.employee, light, kind: "qc", needsKev: true, raisedAt: q.createdAt, source: `qc/${q.id}`,
      ...(q.draft ? { link: SUPERHUMAN_URL } : {}),
      ...(q.kind === "send_message" ? { preview: { to: q.recipients ?? [], text: String(q.detail ?? "").replace(/\(?\+?\d[\d\s().-]{8,}\d/g, "[number]").slice(0, 4000) } } : {}),
      title: q.draft ? `Draft ready in Superhuman${overdue ? " (waiting 5+ days)" : ""}: ${scrub(q.draft.subject ?? q.summary, 80)}` : `${q.kind.replace("_", " ")}${overdue ? " (waiting 5+ days)" : ""}: ${scrub(q.summary, 80, q.kind === "spend")}`,
    });
  }

  for (const g of input.gates) {
    if (g.status === "failed") {
      add({ id: `sync-gate-${g.id}`, agent: g.preparer, light: "urgent", kind: "gate", needsKev: false, raisedAt: g.closedAt ?? g.createdAt, source: `gates/${g.id}`, title: `Numbers gate failed: ${scrub(g.subject, 70)}` });
    } else if (g.status === "passed" && g.closedAt && ageMs(g.closedAt, now) <= GATE_RECENT_DAYS * DAY) {
      add({ id: `sync-gate-${g.id}`, agent: g.preparer, light: "review", kind: "gate", needsKev: true, raisedAt: g.closedAt, source: `gates/${g.id}`, title: `Cleared the gate, ready for you: ${scrub(g.subject, 70)}` });
    }
  }

  for (const r of input.routines) {
    if (r.trigger_id === null) {
      add({ id: `sync-routine-${r.agent}-${r.id}`, agent: r.agent, light: "blocked", kind: "routine", needsKev: true, raisedAt: input.now.toISOString(), source: "routines.yaml", title: `Routine "${scrub(r.name, 60)}" has no trigger yet; you create it with connectors attached` });
    }
  }
  for (const run of input.runs ?? []) {
    if (!run.ok) add({ id: `sync-run-${slug(run.routine)}`, agent: run.agent ?? "radar", light: "urgent", kind: "routine", needsKev: false, raisedAt: run.lastRunAt ?? now.toISOString(), source: `routine ${run.routine}`, title: `Routine failed: ${scrub(run.note ?? run.routine, 70)}` });
  }

  const today = isoDay(now);
  for (const row of input.ledger ?? []) {
    if (/^done$/i.test(row.status ?? "") || !row.due || row.due >= today) continue;
    const agent = /^kev$/i.test(row.owner) ? "radar" : ownerToAgent(row.owner, input.agents);
    if (!agent) continue;
    add({ id: `sync-ledger-${slug(row.id ?? row.item)}`, agent, light: "urgent", kind: "ledger", needsKev: /^kev$/i.test(row.owner), raisedAt: `${row.due}T00:00:00Z`, source: "ledger", link: row.url, title: `Overdue since ${row.due}: ${scrub(row.item, 70)}` });
  }

  for (const m of input.inbox ?? []) {
    add({ id: `sync-inbox-${slug(m.title)}-${isoDay(new Date(m.raisedAt))}`, agent: m.agent ?? "radar", light: "reply", kind: "inbox", needsKev: true, raisedAt: m.raisedAt, source: "inbox sweep", link: m.url, title: `Reply${m.kind ? ` (${m.kind})` : ""}: ${scrub(m.title, 70)}` });
  }
  for (const c of input.calls ?? []) {
    if (c.returned) continue;
    add({ id: `sync-call-${slug(c.who)}-${isoDay(new Date(c.at))}`, agent: "radar", light: "urgent", kind: "call", needsKev: true, raisedAt: c.at, source: "missed calls (CloudTalk / Google Voice)", title: `Missed call: ${scrub(c.who, 40)}${c.company ? ` (${scrub(c.company, 40)})` : ""}` });
  }

  for (const [agent, f] of Object.entries(input.nowFiles ?? {})) {
    if (f.state === "blocked") add({ id: `sync-blocked-${agent}`, agent, light: "blocked", kind: "blocked", needsKev: true, raisedAt: f.updated ?? f.since ?? now.toISOString(), source: `employees/${agent}/memory/live/now.json`, title: `Blocked: ${scrub(f.blockedOn ?? f.task ?? "needs a decision", 80)}` });
  }
  return out;
}

export function buildAgents(input: SyncInput, alerts: Alert[]): AgentDoc[] {
  const { now } = input;
  return input.agents.map((a) => {
    const mine = alerts.filter((x) => x.agent === a.id);
    const counts = Object.fromEntries(PRIORITY.map((l) => [l, 0])) as Record<Light, number>;
    for (const x of mine) counts[x.light]++;
    const nf = input.nowFiles?.[a.id];
    const heardCandidates = [input.heard?.[a.id], nf?.updated, ...input.qc.filter((q) => q.employee === a.id).map((q) => q.createdAt)].filter(Boolean) as string[];
    const lastHeard = heardCandidates.sort().at(-1) ?? null;
    const expected = EXPECTED_EVERY_HOURS[a.id] ?? DEFAULT_EXPECTED_EVERY_HOURS;
    const sinceHeard = ageMs(lastHeard ?? undefined, now);
    const fresh = sinceHeard <= WORKING_FRESH_HOURS * HOUR;
    const silent = sinceHeard > expected * HOUR;
    const myTickets = (input.tickets ?? []).filter((t) => t.agent === a.id);
    const ticketWorking = myTickets.some((t) => (t.status === "picked" || t.status === "working") && ageMs(t.pickedAt, now) <= 6 * HOUR);
    const claimsWorking = nf?.state === "working" || ticketWorking;
    // The staleness rule: working counts only when the agent was heard from within WORKING_FRESH_HOURS (a ticket Radar picked up counts as heard).
    if (claimsWorking && (fresh || ticketWorking)) counts.working = 1;
    const light = PRIORITY.find((l) => counts[l] > 0) ?? "idle";
    counts.idle = light === "idle" ? 1 : 0;
    return {
      id: a.id, name: a.name, role: a.title ? a.title.split(/[:(]/)[0]!.trim().slice(0, 70) : "", desk: DESKS[a.id] ?? "other", sensitive: SENSITIVE_AGENTS.has(a.id),
      light, counts, task: nf?.task ? scrub(nf.task, 100) : null, taskSince: nf?.since ?? null,
      lastHeard, stale: claimsWorking && !fresh && !ticketWorking, silent, expectedEveryHours: expected,
      openTickets: myTickets.filter((t) => ["open", "picked", "working", "blocked", "gated"].includes(t.status)).length,
      pendingQc: input.qc.filter((q) => q.employee === a.id && q.status === "pending").length,
      updated: now.toISOString(), source: "office sync",
    };
  });
}

// ---- What did we ship that we're not using? ----
export type Tool = { id: string; name: string; kind: "artifact" | "routine" | "script" | "doc" | "queue" | "agent"; owner: string; shippedAt?: string; url?: string; expectedEveryDays?: number; routineId?: string; qcId?: string; note?: string };
export type UnusedFinding = { id: string; name: string; owner: string; why: string; evidence: "office-clicks" | "activity" | "none"; lastUsed: string | null };

/** seen: map of `open-<toolId>` -> ISO time Kev last opened it from the Office. activity: tool id -> ISO time of the last write/read Radar saw. */
export function findUnused(tools: Tool[], routines: RoutineLite[], qc: QcItem[], seen: Record<string, string>, activity: Record<string, string>, now: Date): UnusedFinding[] {
  const out: UnusedFinding[] = [];
  for (const t of tools) {
    const every = t.expectedEveryDays ?? 14;
    const clicked = seen[`open-${t.id}`];
    const active = activity[t.id];
    const lastUsed = [clicked, active].filter(Boolean).sort().at(-1) ?? null;
    const evidence = lastUsed ? (lastUsed === clicked ? "office-clicks" : "activity") : "none";
    const r = t.routineId ? routines.find((x) => x.id === t.routineId) : undefined;
    const pendingQc = t.qcId ? qc.find((q) => q.id === t.qcId && q.status === "pending") : undefined;
    let why: string | null = null;
    if (r && r.trigger_id === null) why = "Built but never switched on: no trigger exists";
    else if (pendingQc) why = `Waiting on your yes (QC ${pendingQc.id})`;
    else if (lastUsed && ageMs(lastUsed, now) > 2 * every * DAY) why = `Quiet for ${Math.floor(ageMs(lastUsed, now) / DAY)} days (expected every ${every})`;
    else if (!lastUsed && !(t.shippedAt && ageMs(t.shippedAt, now) <= every * DAY)) why = t.shippedAt ? `No use recorded since shipped ${t.shippedAt.slice(0, 10)}` : "No use recorded yet (the Office only counts opens it saw)";
    if (why) out.push({ id: t.id, name: t.name, owner: t.owner, why, evidence, lastUsed });
  }
  return out;
}

// ---- Turning documents into ArtifactData writes ----
export type Op = { op: "set" | "delete"; collection: string; doc_id: string; data?: unknown; if_version?: number };
export type Existing = Record<string, { version: number; data?: unknown }>;

const strip = (v: unknown) => JSON.stringify(v, (k, x) => (k === "updated" || k === "syncedAt" ? undefined : x));

/**
 * docs: "collection/id" -> data. existing: what ArtifactData list returned ("collection/id" -> version, data).
 * Existing docs need if_version; unchanged docs are skipped; sync-owned alerts (id starts "sync-") that are no longer true are deleted
 * (they are derived mirror rows this script owns, never records of a system).
 */
export function planWrites(docs: Record<string, unknown>, existing: Existing = {}): Op[] {
  const ops: Op[] = [];
  for (const [path, data] of Object.entries(docs)) {
    const i = path.lastIndexOf("/");
    const collection = path.slice(0, i), doc_id = path.slice(i + 1);
    const ex = existing[path];
    if (ex) {
      if (ex.data !== undefined && strip(ex.data) === strip(data)) continue;
      ops.push({ op: "set", collection, doc_id, data, if_version: ex.version });
    } else ops.push({ op: "set", collection, doc_id, data });
  }
  for (const [path, ex] of Object.entries(existing)) {
    if (path.startsWith("alerts/sync-") && !(path in docs)) {
      const i = path.lastIndexOf("/");
      ops.push({ op: "delete", collection: path.slice(0, i), doc_id: path.slice(i + 1), if_version: ex.version });
    }
  }
  return ops;
}

/** ArtifactData batch takes at most 50 writes. */
export function chunk<T>(xs: T[], n = 50): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n));
  return out;
}

export type Feed = { docs: Record<string, unknown>; alerts: Alert[]; agents: AgentDoc[]; unused: UnusedFinding[]; skipped: string[] };

export function buildFeed(input: SyncInput, tools: Tool[] = [], seen: Record<string, string> = {}, activity: Record<string, string> = {}): Feed {
  const alerts = buildAlerts(input);
  const agents = buildAgents(input, alerts);
  const unused = findUnused(tools, input.routines, input.qc, seen, activity, input.now);
  const skipped: string[] = [];
  if (!input.ledger) skipped.push("ledger (pass --ledger)");
  if (!input.inbox) skipped.push("inbox replies (pass --inbox)");
  if (!input.calls) skipped.push("missed calls (pass --calls)");
  if (!input.runs) skipped.push("routine runs (pass --runs)");
  if (!input.tickets) skipped.push("tickets (pass --tickets)");
  const docs: Record<string, unknown> = {};
  const at = input.now.toISOString();
  for (const a of agents) docs[`agents/${a.id}`] = a;
  for (const a of alerts) docs[`alerts/${a.id}`] = a;
  for (const t of tools) {
    const r = t.routineId ? input.routines.find((x) => x.id === t.routineId) : undefined;
    docs[`tools/${t.id}`] = { ...t, noTrigger: !!r && r.trigger_id === null, waitingOnKev: !!t.qcId && input.qc.some((q) => q.id === t.qcId && q.status === "pending"), lastActivity: activity[t.id] ?? null };
  }
  docs["reports/unused"] = { asOf: at, findings: unused, note: "Evidence is Office clicks plus any activity Radar supplied. 'none' means no use was recorded, not proof of no use." };
  const ledger = input.ledger ?? [];
  docs["meta/sync"] = {
    syncedAt: at, source: "npm run office -- sync", skipped,
    counts: { alerts: alerts.length, needsKev: alerts.filter((a) => a.needsKev).length, qcPending: input.qc.filter((q) => q.status === "pending").length, ledgerOpen: ledger.filter((r) => !/^done$/i.test(r.status ?? "")).length },
    note: "Mirror of repo state at syncedAt. Crelate, QuickBooks and the Notion ledger remain the systems of record.",
  };
  return { docs, alerts, agents, unused, skipped };
}
