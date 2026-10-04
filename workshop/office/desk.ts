// The client's Desk: one-tap asks, delivered where the client already is.
// npm run desk -- card --kind decision --title "..." --options "id=Label|id=Label" --default "what happens if no answer" [--body ...] [--recommend id] [--urgency now|today|whenever] [--text] [--link URL --link-label L]
// npm run desk -- card --kind review --title "..." --link URL --link-label "Open board"
// npm run desk -- from-qc <qcId>            card for a pending QC item
// npm run desk -- apply <answers.json>      apply answered cards (approvals go to qc/, the rest are printed for you to act on)
// npm run desk -- status                    what is open for the client right now (files only)
// Cards are written to .desk-outbox/<id>.json; post one with ArtifactData: action set, collection asks, doc_id <id>, file_path.
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { buildAsk, askFromQc, parseAnswered, applyAnswers, type AskInput, type AskKind, type Urgency } from "../core/desk.ts";
import * as qc from "../core/qc.ts";
import { missingFields, type Brief } from "../core/brief.ts";

const OUTBOX = ".desk-outbox";
const argv = process.argv.slice(2);
const cmd = argv[0];
const flags = new Map<string, string>();
const pos: string[] = [];
for (let i = 1; i < argv.length; i++) {
  const a = argv[i]!;
  if (a.startsWith("--")) {
    const n = argv[i + 1];
    if (n === undefined || n.startsWith("--")) flags.set(a.slice(2), "true");
    else { flags.set(a.slice(2), n); i++; }
  } else pos.push(a);
}

function write(ask: ReturnType<typeof buildAsk>) {
  mkdirSync(OUTBOX, { recursive: true });
  const path = join(OUTBOX, `${ask.id}.json`);
  writeFileSync(path, JSON.stringify(ask, null, 2) + "\n");
  console.log(`Card ready: ${path}\nPost it: ArtifactData set, collection "asks", doc_id "${ask.id}", file_path "${path}" (url from employees/<id>/desk.json)`);
}

try {
  if (cmd === "card") {
    const kind = flags.get("kind") as AskKind | undefined;
    if (!kind) throw new Error("--kind is required");
    const options = flags.get("options")?.split("|").map((s) => {
      const [id, ...rest] = s.split("=");
      const label = rest.join("=");
      const [lab, detail] = label.split("::");
      return { id: id!.trim(), label: (lab ?? "").trim(), detail: detail?.trim() };
    });
    const link = flags.get("link") ? { url: flags.get("link")!, label: flags.get("link-label") ?? "Open" } : undefined;
    const input: AskInput = {
      employee: flags.get("employee") ?? "housing-architect", kind, title: flags.get("title") ?? "", body: flags.get("body"), options,
      recommended: flags.get("recommend"), defaultIfSilent: flags.get("default"), allowText: flags.has("text") || undefined, link,
      qcId: flags.get("qc"), urgency: flags.get("urgency") as Urgency | undefined,
    };
    write(buildAsk(input));
  } else if (cmd === "from-qc") {
    const id = pos[0];
    const item = qc.list("qc").find((i) => i.id === id);
    if (!item) throw new Error(`No pending QC item "${id}". Run npm run qc.`);
    write(askFromQc(item));
  } else if (cmd === "apply") {
    if (!pos[0]) throw new Error("Usage: desk apply <answers.json>");
    const asks = parseAnswered(readFileSync(pos[0], "utf8"));
    const r = applyAnswers(asks, "qc", qc);
    console.log(`${asks.length} answered card(s).`);
    for (const d of r.decided) console.log(`  QC ${d.qcId}: ${d.decision}`);
    for (const c of r.needsChatConfirm) console.log(`  QC ${c.qcId} (${c.kind}): Desk says "${c.choice}" but ${c.kind} is never applied from the Desk. Confirm with the client in chat (one-tap question) before doing anything.`);
    for (const s of r.stale) console.log(`  Card ${s.askId}: its QC item ${s.qcId} is already decided or gone.`);
    for (const a of r.answers) console.log(`  "${a.title}": ${a.label ?? a.choice ?? "(no choice)"}${a.text ? ` | note: ${a.text}` : ""}  [card ${a.askId}]  -> act on it and record it in memory`);
  } else if (cmd === "status") {
    const pending = qc.list("qc");
    console.log(`Waiting on the client (approval queue): ${pending.length}`);
    for (const i of pending) console.log(`  ${i.id}  ${i.kind}: ${i.summary}`);
    if (existsSync("projects")) {
      console.log("Projects:");
      for (const d of readdirSync("projects")) {
        const f = join("projects", d, "brief.yaml");
        if (!existsSync(f)) continue;
        try {
          const b = parse(readFileSync(f, "utf8")) as Brief;
          const m = missingFields(b);
          console.log(`  ${d}: ${b.project} [${b.status}${m.length ? `, missing ${m.length} field(s)` : ""}]`);
        } catch { console.log(`  ${d}: brief.yaml could not be read`); }
      }
    } else console.log("Projects: none yet");
    if (existsSync("deliverables/boards")) console.log(`Boards: ${readdirSync("deliverables/boards").join(", ") || "none"}`);
    console.log("Open Desk cards: read them with ArtifactData query on collection asks, where status == open.");
  } else throw new Error("Usage: desk card | from-qc | apply | status (see header of workshop/office/desk.ts)");
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
