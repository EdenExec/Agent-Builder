// The numbers gate: a second key on every figure that leaves the building.
// npm run gate -- open "<subject>" <preparer> <checker> <items.json> [--doc <path|url>] [--ask "<the decision Kev owes>"]
//     items: [{"label","claimed","unit":"usd|count|pct|days","source"}]. --doc is the write-up: the Office alert opens it when the gate passes.
// npm run gate -- attach <id> --doc <path|url> [--ask "..."]   point an existing gate at its write-up
// npm run gate -- blind <id>                               what the checker may see first (no claimed numbers)
// npm run gate -- verify <id> "<label>" <value> --by <checker> [--note "..."]
// npm run gate -- revise <id> "<label>" <value> --by <preparer> [--source "..."]
// npm run gate -- status [id]  |  list
// npm run gate -- waive <id> "<reason>"                    Kev only; employees never run this
import { readFileSync } from "node:fs";
import { open, attach, blindView, verify, revise, waive, load, list, summary, type Unit } from "../core/numbers-gate.ts";

const ROOT = "gates";
const [cmd = "list", ...rest] = process.argv.slice(2);
function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
}

try {
  if (cmd === "list") {
    const recs = list(ROOT);
    console.log(recs.length ? recs.map(summary).join("\n") : "No gates yet.");
  } else if (cmd === "open") {
    const doc = flag(rest, "--doc");
    const ask = flag(rest, "--ask");
    const [subject, preparer, checker, itemsFile] = rest;
    if (!subject || !preparer || !checker || !itemsFile) throw new Error('Usage: gate open "<subject>" <preparer> <checker> <items.json>');
    const items = JSON.parse(readFileSync(itemsFile, "utf8")) as { label: string; claimed: number; unit?: Unit; source: string }[];
    const rec = open(ROOT, { subject, preparer, checker, items, doc, ask });
    console.log(`opened: ${summary(rec)}\nHand ${checker} the id. It re-derives every number from the source before it sees yours: npm run gate -- blind ${rec.id}`);
  } else if (cmd === "attach") {
    const doc = flag(rest, "--doc");
    const ask = flag(rest, "--ask");
    if (!rest[0]) throw new Error('Usage: gate attach <id> --doc <path|url> [--ask "..."]');
    const rec = attach(ROOT, rest[0], { doc, ask });
    console.log(`${summary(rec)}\n  doc: ${rec.doc ?? "(none)"}\n  ask: ${rec.ask ?? "(none)"}`);
  } else if (cmd === "blind") {
    if (!rest[0]) throw new Error("Usage: gate blind <id>");
    console.log(JSON.stringify(blindView(load(ROOT, rest[0])), null, 2));
  } else if (cmd === "verify") {
    const by = flag(rest, "--by");
    const note = flag(rest, "--note");
    const [id, label, value] = rest;
    if (!id || !label || value === undefined || !by) throw new Error('Usage: gate verify <id> "<label>" <value> --by <checker> [--note "..."]');
    const rec = verify(ROOT, id, label, Number(value), by, note);
    const it = rec.items.find((i) => i.label === label)!;
    console.log(`${it.ok ? "match" : "MISMATCH"}: ${label} claimed ${it.claimed}, re-derived ${it.recomputed}\n${summary(rec)}`);
    if (!it.ok) process.exitCode = 2;
  } else if (cmd === "revise") {
    const by = flag(rest, "--by");
    const source = flag(rest, "--source");
    const [id, label, value] = rest;
    if (!id || !label || value === undefined || !by) throw new Error('Usage: gate revise <id> "<label>" <value> --by <preparer> [--source "..."]');
    console.log(summary(revise(ROOT, id, label, Number(value), by, source)));
  } else if (cmd === "status") {
    if (rest[0]) {
      const rec = load(ROOT, rest[0]);
      console.log(summary(rec));
      for (const i of rec.items) console.log(`  ${i.ok === undefined ? "pending " : i.ok ? "match   " : "MISMATCH"} ${i.label}: claimed ${i.claimed} ${i.unit}${i.recomputed !== undefined ? `, re-derived ${i.recomputed}` : ""}  [${i.source}]${i.note ? ` (${i.note})` : ""}`);
    } else console.log(list(ROOT).map(summary).join("\n") || "No gates yet.");
  } else if (cmd === "waive") {
    const [id, ...why] = rest;
    if (!id || !why.length) throw new Error('Usage: gate waive <id> "<reason>"');
    console.log(summary(waive(ROOT, id, why.join(" "))));
  } else {
    throw new Error(`Unknown command "${cmd}"`);
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
