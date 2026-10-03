// npm run qc                                    list pending items
// npm run qc -- show <id>
// npm run qc -- approve <id> [note]  |  reject <id> [note]
// npm run qc -- submit <employee> <kind> "<summary>" "<detail>" [--amount N] [--to a@b.co,c@d.co]
import { list, decide, submit, type QcItem } from "../core/qc.ts";
import type { ActionKind } from "../core/employee.ts";

const ROOT = "qc";
const [cmd = "list", ...rest] = process.argv.slice(2);
const KINDS: ActionKind[] = ["spend", "send_message", "publish", "modify_brief", "start_work", "delete"];

function line(i: QcItem) {
  const extra = i.amountUsd !== undefined ? ` $${i.amountUsd}` : i.recipients ? ` -> ${i.recipients.join(", ")}` : "";
  return `${i.id}  [${i.employee}] ${i.kind}${extra}: ${i.summary}`;
}
function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
}

try {
  if (cmd === "list") {
    const items = list(ROOT);
    console.log(items.length ? items.map(line).join("\n") : "Nothing waiting for you.");
  } else if (cmd === "show") {
    const all = [...list(ROOT), ...list(ROOT, "approved"), ...list(ROOT, "rejected")];
    const item = all.find((i) => i.id === rest[0]);
    if (!item) throw new Error(`No QC item "${rest[0]}"`);
    console.log(JSON.stringify(item, null, 2));
  } else if (cmd === "approve" || cmd === "reject") {
    if (!rest[0]) throw new Error(`Usage: qc ${cmd} <id> [note]`);
    const item = decide(ROOT, rest[0], cmd === "approve" ? "approved" : "rejected", rest.slice(1).join(" ") || undefined);
    console.log(`${item.status}: ${line(item)}`);
  } else if (cmd === "submit") {
    const amount = flag(rest, "--amount");
    const to = flag(rest, "--to");
    const [employee, kind, summary, detail] = rest;
    if (!employee || !kind || !summary || !detail) throw new Error('Usage: qc submit <employee> <kind> "<summary>" "<detail>" [--amount N] [--to a@b.co,...]');
    if (!KINDS.includes(kind as ActionKind)) throw new Error(`kind must be one of ${KINDS.join(", ")}`);
    const item = submit(ROOT, { employee, kind: kind as ActionKind, summary, detail, amountUsd: amount !== undefined ? Number(amount) : undefined, recipients: to?.split(",").map((s) => s.trim()).filter(Boolean) });
    console.log(`queued: ${line(item)}\nWaiting for approval. Do not proceed until it is approved.`);
  } else {
    throw new Error(`Unknown command "${cmd}"`);
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
