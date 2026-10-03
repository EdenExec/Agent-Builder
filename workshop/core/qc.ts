// QC touch points: anything gated is written to qc/pending/ and waits for a human decision.
// File-based on purpose: readable, diffable, works from a phone session and from the CLI.
import { mkdirSync, readdirSync, readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { policyFor, type ActionKind, type EmployeeSpec } from "./employee.ts";

export type QcStatus = "pending" | "approved" | "rejected";
export type QcItem = {
  id: string;
  employee: string;
  kind: ActionKind;
  /** One line a person can approve at a glance. */
  summary: string;
  /** Everything the person needs to judge it: draft text, amounts, recipients, sources. */
  detail: string;
  /** Dollar amount for spend items. */
  amountUsd?: number;
  /** Who would receive it, for send_message items. */
  recipients?: string[];
  status: QcStatus;
  createdAt: string;
  decidedAt?: string;
  note?: string;
};

const dirs = (root: string) => ({
  pending: join(root, "pending"),
  approved: join(root, "approved"),
  rejected: join(root, "rejected"),
});

function ensure(root: string) {
  for (const d of Object.values(dirs(root))) mkdirSync(d, { recursive: true });
}

export type Gate = { allowed: true } | { allowed: false; reason: string };

/** Check an action against the employee's autonomy and limits. "allowed" means it may run without a QC item. */
export function gate(spec: EmployeeSpec, kind: ActionKind, amountUsd = 0): Gate {
  if (kind === "spend" && amountUsd > spec.limits.maxSpendUsd) {
    return { allowed: false, reason: `$${amountUsd} exceeds the per-task limit of $${spec.limits.maxSpendUsd}; needs approval` };
  }
  if (policyFor(spec, kind) === "approve") return { allowed: false, reason: `${kind} requires a QC touch point` };
  return { allowed: true };
}

export function submit(root: string, input: Pick<QcItem, "employee" | "kind" | "summary" | "detail"> & Partial<Pick<QcItem, "amountUsd" | "recipients">>): QcItem {
  ensure(root);
  if (!input.summary.trim()) throw new Error("QC item needs a summary");
  if (input.kind === "send_message" && !input.recipients?.length) throw new Error("send_message items must list recipients");
  if (input.kind === "spend" && !(typeof input.amountUsd === "number" && input.amountUsd >= 0)) throw new Error("spend items must include amountUsd");
  const item: QcItem = {
    id: `${new Date().toISOString().slice(0, 10)}-${randomBytes(3).toString("hex")}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    ...input,
  };
  writeFileSync(join(dirs(root).pending, `${item.id}.json`), JSON.stringify(item, null, 2) + "\n");
  return item;
}

export function list(root: string, status: QcStatus = "pending"): QcItem[] {
  const d = dirs(root)[status];
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(readFileSync(join(d, f), "utf8")) as QcItem);
}

export function decide(root: string, id: string, decision: "approved" | "rejected", note?: string): QcItem {
  ensure(root);
  const from = join(dirs(root).pending, `${id}.json`);
  if (!existsSync(from)) throw new Error(`No pending QC item "${id}"`);
  const item = JSON.parse(readFileSync(from, "utf8")) as QcItem;
  item.status = decision;
  item.decidedAt = new Date().toISOString();
  if (note) item.note = note;
  writeFileSync(from, JSON.stringify(item, null, 2) + "\n");
  renameSync(from, join(dirs(root)[decision], `${id}.json`));
  return item;
}

/** True only if this exact item was approved. Agents must check this before acting on a gated item. */
export function isApproved(root: string, id: string): boolean {
  return existsSync(join(dirs(root).approved, `${id}.json`));
}
