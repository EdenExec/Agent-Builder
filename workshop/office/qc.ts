// npm run qc                                    list pending items
// npm run qc -- show <id>
// npm run qc -- approve <id> [note]  |  reject <id> [note]   (people only; agents are denied these)
// npm run qc -- office-approve <id> --action <file>   record Kev's two-tap Approve from the Command Center. <file> is the actions/<key>
//     document saved straight from the Office (ArtifactData get with out_dir). Refused unless it is Kev's confirmed tap for this exact,
//     unchanged item. Agents never write an approve action themselves.
// npm run qc -- exact <id>    the one-line exact action and fingerprint to put on a gated ticket's `proposed`
// npm run qc -- submit <employee> <kind> "<summary>" "<detail>" [--amount N] [--to a@b.co,c@d.co] [--gate <id>]
//   Employees with `numbers_gate: required` in agent.yaml must pass --gate <id> (a cleared gate, see `npm run gate`) to send or publish.
import { list, decide, submit, officeApprove, qcExact, approvalHash, type QcItem } from "../core/qc.ts";
import type { ActionKind, EmployeeSpec } from "../core/employee.ts";
import { gateRequired, isCleared } from "../core/numbers-gate.ts";
import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";

const ROOT = "qc";
const [cmd = "list", ...rest] = process.argv.slice(2);
const KINDS: ActionKind[] = ["spend", "send_message", "publish", "modify_brief", "start_work", "delete", "write_external"];

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
  } else if (cmd === "office-approve") {
    const file = flag(rest, "--action");
    if (!rest[0] || !file) throw new Error("Usage: qc office-approve <id> --action <actions-doc.json>");
    const item = officeApprove(ROOT, rest[0], JSON.parse(readFileSync(file, "utf8")));
    console.log(`approved (Kev, Command Center): ${line(item)}\nCarry out exactly this action, once.`);
  } else if (cmd === "exact") {
    const item = list(ROOT).find((i) => i.id === rest[0]);
    if (!item) throw new Error(`No pending QC item "${rest[0]}"`);
    console.log(JSON.stringify({ kind: item.kind, exact: qcExact(item), hash: approvalHash(item), qc: item.id }));
  } else if (cmd === "submit") {
    const amount = flag(rest, "--amount");
    const to = flag(rest, "--to");
    const gateId = flag(rest, "--gate");
    const [employee, kind, summary, detail] = rest;
    if (!employee || !kind || !summary || !detail) throw new Error('Usage: qc submit <employee> <kind> "<summary>" "<detail>" [--amount N] [--to a@b.co,...]');
    if (!KINDS.includes(kind as ActionKind)) throw new Error(`kind must be one of ${KINDS.join(", ")}`);
    const specPath = `employees/${employee}/agent.yaml`;
    const spec = existsSync(specPath) ? (parse(readFileSync(specPath, "utf8")) as EmployeeSpec) : undefined;
    let fullDetail = detail;
    if (spec && gateRequired(spec, kind as ActionKind)) {
      if (!gateId) throw new Error(`${employee} must clear a numbers gate before it can ${kind}. Run \`npm run gate -- open ...\`, get the checker to verify every number, then pass --gate <id>.`);
      if (!isCleared("gates", gateId)) throw new Error(`Gate ${gateId} has not passed (open, failed or missing). Fix the numbers and have the checker verify again.`);
    }
    if (gateId) fullDetail = `${detail}\n\nNumbers gate: ${gateId} (cleared)`;
    const item = submit(ROOT, { employee, kind: kind as ActionKind, summary, detail: fullDetail, amountUsd: amount !== undefined ? Number(amount) : undefined, recipients: to?.split(",").map((s) => s.trim()).filter(Boolean) });
    console.log(`queued: ${line(item)}\nWaiting for approval. Do not proceed until it is approved.`);
  } else {
    throw new Error(`Unknown command "${cmd}"`);
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
