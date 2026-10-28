// The Eden Daily as data for the Command Center (Kev, 28 Oct 2026). Spec: projects/virtual-office/daily-schema.md.
//   npm run daily -- build <YYYY-MM-DD> --in <paper-data.json> [--out <dir>] [--version <n>] [--existing <doc.json>] [--by radar] [--now ISO]
//       Builds the day's document from the paper's data (the stand-up build dumps it), scrubs it, checks it, and writes
//       <out>/docs/daily--<date>.json and <out>/writes-1.json: the one-write `writes` array for one ArtifactData batch.
//       --version  the version of an existing daily/<date> (a rebuild or Kev's re-run); omit for a new day.
//       --existing a saved ArtifactData get of that document ({data, version} or the bare document): its non-blank habits survive the rebuild.
//   npm run daily -- check <doc.json>      runs the safety check on a finished document (exit 1 with the reasons if it fails)
// Kev's live ticks live in daily/<date>/ticks/<key> and are never written here.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertSafe, buildDaily, InputError, writesFor, type DailyDoc, type PaperInput } from "../core/daily.ts";

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Map<string, string>();
const pos: string[] = [];
for (let i = 0; i < rest.length; i++) {
  const a = rest[i]!;
  if (a.startsWith("--")) flags.set(a.slice(2), rest[++i] ?? ""); else pos.push(a);
}
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;
const fail = (msg: string): never => { console.error(msg); process.exit(1); };
const USAGE = "usage: npm run daily -- build <YYYY-MM-DD> --in <paper-data.json> [--out dir] [--version n] [--existing doc.json] [--by radar]\n       npm run daily -- check <doc.json>";

try {
  if (cmd === "build") {
    const date = pos[0], inFile = flags.get("in");
    if (!date || !inFile) fail(USAGE);
    const input = readJson<PaperInput>(inFile!);
    let existing: Partial<DailyDoc> | null = null, version = flags.has("version") ? Number(flags.get("version")) : undefined;
    if (flags.has("existing")) {
      const x = readJson<{ data?: Partial<DailyDoc>; version?: number } & Partial<DailyDoc>>(flags.get("existing")!);
      existing = x.data ?? x;
      if (version === undefined && typeof x.version === "number") version = x.version;
    }
    if (version !== undefined && (!Number.isInteger(version) || version < 1)) fail(`--version must be a whole number from 1, got "${flags.get("version")}"`);
    const now = flags.has("now") ? new Date(flags.get("now")!) : new Date();
    const { doc, redactions, warnings } = buildDaily(date!, input, { now, builtBy: flags.get("by") ?? "radar", existing });
    const out = flags.get("out") ?? join(tmpdir(), "eden-daily", date!);
    mkdirSync(join(out, "docs"), { recursive: true });
    for (const n of readdirSync(out).filter((f) => /^writes-\d+\.json$/.test(f))) rmSync(join(out, n));
    const file = join(out, "docs", `daily--${date}.json`);
    writeFileSync(file, JSON.stringify(doc) + "\n");
    writeFileSync(join(out, "writes-1.json"), JSON.stringify(writesFor(date!, file, version), null, 2) + "\n");
    const leads = doc.sheets.reduce((n, s) => n + s.leads.length, 0);
    console.log(`daily/${date} (${doc.label}, pillar ${String(doc.pillar.n).padStart(2, "0")} ${doc.pillar.name}): ${doc.run.length} run, ${doc.must.length} must, ${doc.decisions.length} decisions, ${doc.qc.length} qc, ${doc.sheets.length} sheet(s) with ${leads} leads, study ${doc.study ? doc.study.ref : "none"}.`);
    console.log(`${redactions.length} redaction(s)${redactions.length ? ":\n  " + redactions.join("\n  ") : "."}`);
    for (const w of warnings) console.warn(`WARNING ${w}`);
    console.log(`Push ${join(out, "writes-1.json")} as one ArtifactData batch (${version !== undefined ? `pinned at version ${version}` : "new document, no if_version"}). Ticks (daily/${date}/ticks) are not touched.`);
  } else if (cmd === "check") {
    if (!pos[0]) fail(USAGE);
    assertSafe(readJson<unknown>(pos[0]!));
    console.log(`${pos[0]}: safe to write.`);
  } else fail(USAGE);
} catch (e) {
  if (e instanceof InputError) fail(e.message);
  throw e;
}
