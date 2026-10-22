// Glue between ArtifactData dumps and `npm run office -- sync`, for the ticket runner and any session without a hand-built existing.json.
// npm run office-prep -- in  <dump> <versions.json>   dump = an ArtifactData `out_dir` holding <collection>/<id>.json files
//     (list tickets, agents, alerts and meta into it). versions.json = {"agents/q": 3, ...}, copied from the list results
//     (the saved files carry no version). Writes <dump>/tickets.json and <dump>/existing.json for `office sync`.
// npm run office-prep -- out <outbox> <dump> <dest>   keeps only the sync writes for collections present in <dump> (writes to
//     anything else would hit documents whose version we never read), saves each document's data as its own file under
//     <dest>/docs/, and writes <dest>/writes.json: the `writes` array to pass to one ArtifactData batch.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Write = { op: "set" | "delete"; collection: string; doc_id: string; data?: unknown; if_version?: number };

const [cmd, ...args] = process.argv.slice(2);
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;
const collections = (dump: string) => readdirSync(dump, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

try {
  if (cmd === "in") {
    const [dump, versionsFile] = args;
    if (!dump || !versionsFile) throw new Error("Usage: office-prep in <dump> <versions.json>");
    const versions = readJson<Record<string, number>>(versionsFile);
    const existing: Record<string, { version: number; data: unknown }> = {};
    const tickets: unknown[] = [];
    for (const col of collections(dump)) {
      for (const f of readdirSync(join(dump, col)).filter((n) => n.endsWith(".json"))) {
        const id = f.slice(0, -5), key = `${col}/${id}`, data = readJson<Record<string, unknown>>(join(dump, col, f));
        if (col === "tickets") tickets.push({ id, ...data });
        else if (versions[key] !== undefined) existing[key] = { version: versions[key]!, data };
        else console.warn(`no version for ${key}; its write will be dropped`);
      }
    }
    writeFileSync(join(dump, "tickets.json"), JSON.stringify(tickets, null, 2) + "\n");
    writeFileSync(join(dump, "existing.json"), JSON.stringify(existing, null, 2) + "\n");
    console.log(`${tickets.length} ticket(s), ${Object.keys(existing).length} versioned doc(s). Next: npm run office -- sync --tickets ${join(dump, "tickets.json")} --existing ${join(dump, "existing.json")}`);
  } else if (cmd === "out") {
    const [outbox, dump, dest] = args;
    if (!outbox || !dump || !dest) throw new Error("Usage: office-prep out <outbox> <dump> <dest>");
    const keep = new Set(collections(dump).filter((c) => c !== "tickets"));
    const existing = existsSync(join(dump, "existing.json")) ? readJson<Record<string, unknown>>(join(dump, "existing.json")) : {};
    const all: Write[] = readdirSync(outbox).filter((n) => /^batch-\d+\.json$/.test(n)).sort()
      .flatMap((n) => readJson<{ writes: Write[] }>(join(outbox, n)).writes);
    // A set on a document we hold no version for is safe only if the document is new; skip existing-but-unversioned ones.
    const writes = all.filter((w) => keep.has(w.collection) && (w.if_version !== undefined || !existsSync(join(dump, w.collection, `${w.doc_id}.json`))));
    mkdirSync(join(dest, "docs"), { recursive: true });
    const out = writes.map((w) => {
      if (w.op === "delete") return { op: w.op, collection: w.collection, doc_id: w.doc_id, if_version: w.if_version };
      const file = join(dest, "docs", `${w.collection}--${w.doc_id}.json`);
      writeFileSync(file, JSON.stringify(w.data) + "\n");
      return { op: w.op, collection: w.collection, doc_id: w.doc_id, file_path: file, ...(w.if_version !== undefined ? { if_version: w.if_version } : {}) };
    });
    writeFileSync(join(dest, "writes.json"), JSON.stringify(out, null, 2) + "\n");
    console.log(`${out.length} of ${all.length} write(s) kept (collections: ${[...keep].join(", ")}; ${Object.keys(existing).length} versioned). Pass ${join(dest, "writes.json")} as the batch writes (at most 50 per call).`);
  } else {
    throw new Error("Usage: office-prep in <dump> <versions.json> | out <outbox> <dump> <dest>");
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
