// npm run leadplan -- <sheet.csv|sheet.xlsx ...> [--owner Evan] [--client Hoffman] [--jo "..."] [--date YYYY-MM-DD]
//                    [--limit 10] [--cloudtalk snapshot.json] [--crelate snapshot.json] [--sheet "Tab name"] [--out dir]
//
// DRY RUN ONLY. Reads lead sheets, writes a load plan, a no-phone list and the draft to Nida into --out
// (default deliverables/cloudtalk/, which git ignores because the plan holds phone numbers). Prints counts and names,
// never phone digits. Calls neither CloudTalk nor Crelate.
import "../lib/env.ts";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildPlan, readSheet, noPhoneCsv, nidaDraft, summaryText, type CloudTalkContact, type CrelateContact, type Options } from "./leadplan.ts";

const args = process.argv.slice(2);
const files: string[] = [];
const flag: Record<string, string> = {};
for (let i = 0; i < args.length; i++) {
  const a = args[i]!;
  if (a.startsWith("--")) {
    const v = args[i + 1];
    if (v === undefined || v.startsWith("--")) { console.error(`${a} needs a value`); process.exit(1); }
    flag[a.slice(2)] = v; i++;
  } else files.push(a);
}
if (!files.length) {
  console.error("usage: npm run leadplan -- <sheet.csv|xlsx ...> [--owner X] [--client X] [--jo X] [--date YYYY-MM-DD] [--limit N] [--cloudtalk f.json] [--crelate f.json] [--sheet tab] [--out dir]");
  process.exit(1);
}
const json = <T>(p: string | undefined) => (p ? (JSON.parse(readFileSync(p, "utf8")) as T) : undefined);
const opts: Options = {
  owner: flag.owner, client: flag.client, jo: flag.jo, date: flag.date,
  limit: flag.limit !== undefined ? Number(flag.limit) : undefined,
  cloudtalk: json<CloudTalkContact[]>(flag.cloudtalk),
  crelate: json<CrelateContact[]>(flag.crelate),
};
const sheets = files.map((f) => readSheet(f, flag.sheet));
const plan = buildPlan(sheets, opts);
const date = flag.date ?? plan.batches[0]?.date ?? new Date().toISOString().slice(0, 10);
const out = flag.out ?? "deliverables/cloudtalk";
mkdirSync(out, { recursive: true });
const planPath = join(out, `load-plan-${date}.json`);
writeFileSync(planPath, JSON.stringify(plan, null, 2));
writeFileSync(join(out, `no-phone-${date}.csv`), noPhoneCsv(plan));
const draft = nidaDraft(plan, date);
writeFileSync(join(out, `nida-draft-${date}.txt`), `Subject: ${draft.subject}\n\n${draft.body}\n`);
console.log("DRY RUN: nothing was sent to CloudTalk or Crelate.\n");
console.log(summaryText(plan));
console.log(`\nWrote ${planPath} (holds phone numbers; git ignores it), no-phone-${date}.csv and nida-draft-${date}.txt`);
