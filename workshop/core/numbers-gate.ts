// The numbers gate: a second key on every figure that leaves the building.
// The preparer opens a gate with each claimed number and where it came from. The checker, a different employee,
// re-derives each number from the source without seeing the claim (blind view), then records what it got.
// The gate passes only when every item matches inside tolerance. File-based like QC: readable, diffable.
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import type { EmployeeSpec, ActionKind } from "./employee.ts";

export type Unit = "usd" | "count" | "pct" | "days";
export type GateStatus = "open" | "passed" | "failed" | "waived";

export type GateItem = {
  label: string;
  claimed: number;
  unit: Unit;
  /** Where the preparer got it: a file, a query, a report line, a contract clause. */
  source: string;
  /** What the checker derived on its own. */
  recomputed?: number;
  note?: string;
  ok?: boolean;
};

export type GateRecord = {
  id: string;
  subject: string;
  preparer: string;
  checker: string;
  status: GateStatus;
  items: GateItem[];
  createdAt: string;
  closedAt?: string;
  checkedBy?: string;
  waivedNote?: string;
};

/** Allowed difference between the claim and the re-derived number. Money to the dollar, counts and days exactly, percentages to a tenth of a point. */
export const TOLERANCE: Record<Unit, number> = { usd: 1, count: 0, pct: 0.1, days: 0 };

export function withinTolerance(unit: Unit, claimed: number, recomputed: number): boolean {
  return Math.abs(claimed - recomputed) <= TOLERANCE[unit] + 1e-9;
}

const file = (root: string, id: string) => join(root, `${id}.json`);

function save(root: string, rec: GateRecord) {
  mkdirSync(root, { recursive: true });
  writeFileSync(file(root, rec.id), JSON.stringify(rec, null, 2) + "\n");
}

export function load(root: string, id: string): GateRecord {
  if (!existsSync(file(root, id))) throw new Error(`No gate "${id}"`);
  return JSON.parse(readFileSync(file(root, id), "utf8")) as GateRecord;
}

export function list(root: string): GateRecord[] {
  if (!existsSync(root)) return [];
  return readdirSync(root).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(readFileSync(join(root, f), "utf8")) as GateRecord);
}

export type OpenInput = { subject: string; preparer: string; checker: string; items: { label: string; claimed: number; unit?: Unit; source: string }[] };

export function open(root: string, input: OpenInput): GateRecord {
  if (!input.subject.trim()) throw new Error("A gate needs a subject");
  if (!input.preparer || !input.checker) throw new Error("A gate needs a preparer and a checker");
  if (input.preparer === input.checker) throw new Error("The preparer cannot check its own numbers");
  if (!input.items.length) throw new Error("A gate needs at least one number");
  const labels = new Set<string>();
  const items = input.items.map((i) => {
    if (!i.label.trim()) throw new Error("Every number needs a label");
    if (labels.has(i.label)) throw new Error(`Duplicate label "${i.label}"`);
    labels.add(i.label);
    if (!Number.isFinite(i.claimed)) throw new Error(`"${i.label}": claimed value must be a number`);
    if (!i.source.trim()) throw new Error(`"${i.label}": every number needs a source (a file, query, report line or clause)`);
    return { label: i.label, claimed: i.claimed, unit: i.unit ?? "usd", source: i.source } as GateItem;
  });
  const createdAt = new Date().toISOString();
  const id = `${createdAt.slice(0, 10)}-${createHash("sha1").update(input.subject + createdAt + Math.random()).digest("hex").slice(0, 6)}`;
  const rec: GateRecord = { id, subject: input.subject, preparer: input.preparer, checker: input.checker, status: "open", items, createdAt };
  save(root, rec);
  return rec;
}

/** What the checker is allowed to see before it has done its own work: labels, units and sources, never the claims. */
export function blindView(rec: GateRecord) {
  return { id: rec.id, subject: rec.subject, preparer: rec.preparer, checker: rec.checker, items: rec.items.map((i) => ({ label: i.label, unit: i.unit, source: i.source, checked: i.recomputed !== undefined })) };
}

function settle(rec: GateRecord) {
  if (rec.status === "waived") return;
  if (rec.items.some((i) => i.recomputed === undefined)) { rec.status = "open"; return; }
  rec.status = rec.items.every((i) => i.ok) ? "passed" : "failed";
  rec.closedAt = new Date().toISOString();
}

export function verify(root: string, id: string, label: string, recomputed: number, by: string, note?: string): GateRecord {
  const rec = load(root, id);
  if (by !== rec.checker) throw new Error(`Only the checker (${rec.checker}) can verify; "${by}" cannot`);
  if (rec.status === "waived") throw new Error("This gate was waived; it is closed");
  const item = rec.items.find((i) => i.label === label);
  if (!item) throw new Error(`No number "${label}" in gate ${id}`);
  if (!Number.isFinite(recomputed)) throw new Error("The re-derived value must be a number");
  item.recomputed = recomputed;
  item.ok = withinTolerance(item.unit, item.claimed, recomputed);
  if (note) item.note = note;
  rec.checkedBy = by;
  settle(rec);
  save(root, rec);
  return rec;
}

/** The preparer fixes a number the checker rejected. The check starts over for that number. */
export function revise(root: string, id: string, label: string, claimed: number, by: string, source?: string): GateRecord {
  const rec = load(root, id);
  if (by !== rec.preparer) throw new Error(`Only the preparer (${rec.preparer}) can revise; "${by}" cannot`);
  if (rec.status === "waived") throw new Error("This gate was waived; it is closed");
  const item = rec.items.find((i) => i.label === label);
  if (!item) throw new Error(`No number "${label}" in gate ${id}`);
  if (item.ok) throw new Error(`"${label}" already matched; only a number that failed can be revised`);
  item.claimed = claimed;
  if (source?.trim()) item.source = source;
  delete item.recomputed;
  delete item.ok;
  delete item.note;
  rec.status = "open";
  delete rec.closedAt;
  save(root, rec);
  return rec;
}

/** Only a person (Kev) waives a gate, with a reason on the record. Employees never call this. */
export function waive(root: string, id: string, note: string): GateRecord {
  if (!note.trim()) throw new Error("A waiver needs a reason");
  const rec = load(root, id);
  rec.status = "waived";
  rec.waivedNote = note;
  rec.closedAt = new Date().toISOString();
  save(root, rec);
  return rec;
}

export function isCleared(root: string, id: string): boolean {
  if (!existsSync(file(root, id))) return false;
  const s = load(root, id).status;
  return s === "passed" || s === "waived";
}

/** Gated outbound kinds for an employee whose agent.yaml says `numbers_gate: required`. */
export function gateRequired(spec: Pick<EmployeeSpec, "numbers_gate">, kind: ActionKind): boolean {
  return spec.numbers_gate === "required" && (kind === "send_message" || kind === "publish");
}

export function summary(rec: GateRecord): string {
  const done = rec.items.filter((i) => i.recomputed !== undefined).length;
  const bad = rec.items.filter((i) => i.ok === false).length;
  return `${rec.id}  ${rec.status.toUpperCase()}  ${rec.preparer} -> ${rec.checker}: ${rec.subject} (${done}/${rec.items.length} checked${bad ? `, ${bad} off` : ""})`;
}
