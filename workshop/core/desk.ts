// The Desk: every time an employee needs the client, it posts one "ask" card. The client answers with one tap.
// Cards live in the Desk artifact's database (collection "asks"); this module defines and validates their shape.
import type { QcItem } from "./qc.ts";

export type AskKind = "decision" | "approval" | "review" | "info";
export type Urgency = "now" | "today" | "whenever";
export type Option = { id: string; label: string; detail?: string };

export type Ask = {
  id: string;
  employee: string;
  kind: AskKind;
  /** The question or request, one line. */
  title: string;
  /** Context in a few short lines. Decisions first, background second. */
  body?: string;
  options?: Option[];
  /** Option id Marlowe recommends. Shown first and highlighted. */
  recommended?: string;
  /** Plain words: what happens if the client does not answer, so silence is never a blocker. */
  defaultIfSilent?: string;
  allowText?: boolean;
  link?: { label: string; url: string };
  /** For approvals: the qc/ item this card decides. */
  qcId?: string;
  urgency: Urgency;
  status: "open" | "answered" | "dismissed";
  createdAt: string;
  answer?: { choice?: string; text?: string; at: string };
};

export const APPROVAL_OPTIONS: Option[] = [
  { id: "approve", label: "Approve" },
  { id: "reject", label: "Not yet" },
];
export const REVIEW_OPTIONS: Option[] = [
  { id: "good", label: "Looks good" },
  { id: "changes", label: "Needs changes" },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "ask";

export function newAskId(title: string, now = new Date()): string {
  const [d, t] = now.toISOString().slice(0, 16).replace(/[-:]/g, "").split("T");
  return `${d}-${t}-${slug(title)}`;
}

export type AskInput = Omit<Ask, "id" | "status" | "createdAt" | "urgency"> & { urgency?: Urgency };

/** Fill defaults, then validate. Throws one error listing every problem. */
export function buildAsk(input: AskInput, now = new Date()): Ask {
  const options =
    input.options ?? (input.kind === "approval" ? APPROVAL_OPTIONS : input.kind === "review" ? REVIEW_OPTIONS : input.kind === "info" ? [{ id: "ok", label: "Got it" }] : undefined);
  const ask: Ask = {
    ...input,
    options,
    id: newAskId(input.title, now),
    urgency: input.urgency ?? "today",
    status: "open",
    createdAt: now.toISOString(),
  };
  const problems = validateAsk(ask);
  if (problems.length) throw new Error(`Invalid ask:\n  - ${problems.join("\n  - ")}`);
  return ask;
}

export function validateAsk(a: Ask): string[] {
  const p: string[] = [];
  if (!a.employee) p.push("employee is required");
  if (!["decision", "approval", "review", "info"].includes(a.kind)) p.push("kind must be decision, approval, review or info");
  if (!a.title?.trim()) p.push("title is required");
  else if (a.title.length > 90) p.push("title must be 90 characters or fewer (one line a person can read at a glance)");
  if (a.body && a.body.length > 900) p.push("body must be 900 characters or fewer; put detail behind a link");
  if (!["now", "today", "whenever"].includes(a.urgency)) p.push("urgency must be now, today or whenever");
  const ids = a.options?.map((o) => o.id) ?? [];
  if (new Set(ids).size !== ids.length) p.push("option ids must be unique");
  if (a.options?.some((o) => !o.id || !o.label?.trim())) p.push("every option needs an id and a label");
  if (a.kind === "decision") {
    const n = a.options?.length ?? 0;
    if (n < 2 || n > 5) p.push("a decision needs 2 to 5 options (more than 5 is homework, not a decision)");
  }
  if (a.recommended && !ids.includes(a.recommended)) p.push(`recommended "${a.recommended}" is not one of the options`);
  if (a.kind === "approval" && !a.qcId) p.push("an approval must reference a qcId");
  if (a.kind === "review" && !a.link) p.push("a review needs a link to what is being reviewed");
  if (a.link && !/^https:\/\//i.test(a.link.url)) p.push("link.url must be https");
  if (a.link && !a.link.label?.trim()) p.push("link.label is required");
  if (a.kind === "decision" && !a.defaultIfSilent) p.push("a decision should say what happens if the client does not answer (defaultIfSilent)");
  return p;
}

/** Build an approval card from a QC item so the client sees exactly what they are approving. */
export function askFromQc(item: QcItem, now = new Date()): Ask {
  const money = item.amountUsd !== undefined ? `$${item.amountUsd}` : "";
  const to = item.recipients?.length ? `To: ${item.recipients.join(", ")}` : "";
  const body = [money && `Amount: ${money}`, to, item.detail].filter(Boolean).join("\n").slice(0, 900);
  return buildAsk({ employee: item.employee, kind: "approval", title: item.summary.slice(0, 90), body, qcId: item.id, allowText: true, urgency: item.kind === "spend" || item.kind === "send_message" ? "today" : "whenever" }, now);
}

/** Pull answered asks out of whatever ArtifactData wrote (a doc, a list, or a wrapper with `data`). */
export function parseAnswered(text: string): Ask[] {
  const raw = JSON.parse(text) as unknown;
  const out: Ask[] = [];
  const visit = (v: any) => {
    if (Array.isArray(v)) return v.forEach(visit);
    if (!v || typeof v !== "object") return;
    if (v.data && typeof v.data === "object" && !v.kind) return visit(v.data);
    if (v.documents) return visit(v.documents);
    if (v.kind && v.status === "answered" && v.answer) out.push(v as Ask);
  };
  visit(raw);
  return out;
}

export type Applied = {
  decided: { askId: string; qcId: string; decision: "approved" | "rejected" }[];
  /** Spend and messages are never applied from the Desk: the agent must confirm in chat. */
  needsChatConfirm: { askId: string; qcId: string; kind: string; choice: string }[];
  /** Approvals whose QC item is already decided or missing. */
  stale: { askId: string; qcId: string }[];
  /** Decisions, reviews and info the agent should act on and record in memory. */
  answers: { askId: string; title: string; choice?: string; label?: string; text?: string }[];
};

/**
 * Turn answered cards into outcomes. Approvals of ordinary actions are applied to the QC queue.
 * Approving money or outbound messages from the Desk is NOT applied here: the agent could write a
 * card answer itself, so those two kinds always get a one-tap confirmation in the conversation.
 */
export function applyAnswers(asks: Ask[], qcRoot: string, deps: { list: (root: string) => QcItem[]; decide: (root: string, id: string, d: "approved" | "rejected", note?: string) => unknown }): Applied {
  const out: Applied = { decided: [], needsChatConfirm: [], stale: [], answers: [] };
  const pending = new Map(deps.list(qcRoot).map((i) => [i.id, i]));
  for (const a of asks) {
    if (a.status !== "answered" || !a.answer) continue;
    const choice = a.answer.choice;
    if (a.kind === "approval" && a.qcId) {
      const item = pending.get(a.qcId);
      if (!item) { out.stale.push({ askId: a.id, qcId: a.qcId }); continue; }
      if (choice !== "approve" && choice !== "reject") continue;
      if (item.kind === "spend" || item.kind === "send_message") {
        out.needsChatConfirm.push({ askId: a.id, qcId: a.qcId, kind: item.kind, choice });
        continue;
      }
      deps.decide(qcRoot, a.qcId, choice === "approve" ? "approved" : "rejected", a.answer.text);
      pending.delete(a.qcId);
      out.decided.push({ askId: a.id, qcId: a.qcId, decision: choice === "approve" ? "approved" : "rejected" });
    } else {
      out.answers.push({ askId: a.id, title: a.title, choice, label: a.options?.find((o) => o.id === choice)?.label, text: a.answer.text });
    }
  }
  return out;
}
