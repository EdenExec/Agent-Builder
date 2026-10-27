import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const prep = (...args: string[]) => execFileSync(process.execPath, ["workshop/office/office-prep.ts", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
function dump(): string {
  const d = mkdtempSync(join(tmpdir(), "office-prep-"));
  const put = (col: string, id: string, data: object) => { mkdirSync(join(d, col), { recursive: true }); writeFileSync(join(d, col, `${id}.json`), JSON.stringify(data)); };
  put("agents", "dean", { id: "dean", lastHeard: "2026-10-21T00:00:00Z" });
  put("meta", "sync", { syncedAt: "2026-10-22T00:00:00Z" });
  put("tickets", "t-1", { agent: "dean", status: "done", doneAt: "2026-10-26T18:00:00Z" });
  put("actions", "a-1", { action: "done", at: "2026-10-26T18:00:00Z" });
  put("team_asks", "a-202610261005-max-mx7q", { from: "casey", to: "max", createdAt: "2026-10-26T17:05:00Z" });
  return d;
}

describe("office-prep (the ticket runner's floor refresh)", () => {
  test("in: reads versions pasted straight from the ArtifactData list results, and keeps Team Hub asks as read-only input", () => {
    const d = dump(), v = join(d, "versions.txt");
    writeFileSync(v, [
      '15 documents from collection "agents" saved as JSON files under "/x/agents":',
      '- "dean"  607 bytes  version 8  "/x/agents/dean.json"',
      '2 documents from collection "meta" saved as JSON files under "/x/meta":',
      '[1 more saved documents, at <that directory>/<doc_id>.json each (id, version): "sync" 74]',
    ].join("\n"));
    prep("in", d, v);
    const existing = JSON.parse(readFileSync(join(d, "existing.json"), "utf8")) as Record<string, { version: number }>;
    assert.deepEqual(Object.fromEntries(Object.entries(existing).map(([k, x]) => [k, x.version])), { "agents/dean": 8, "meta/sync": 74 });
    assert.equal((JSON.parse(readFileSync(join(d, "asks.json"), "utf8")) as { from: string }[])[0]!.from, "casey");
    assert.equal((JSON.parse(readFileSync(join(d, "tickets.json"), "utf8")) as unknown[]).length, 1);
  });
  test("out: never writes the read-only collections, and splits the batch at 50", () => {
    const d = dump(), outbox = join(d, "outbox"), dest = join(d, "dest");
    mkdirSync(outbox);
    const writes = [
      { op: "set", collection: "agents", doc_id: "dean", data: { id: "dean" }, if_version: 8 },
      { op: "set", collection: "team_asks", doc_id: "x", data: {} },
      { op: "set", collection: "tickets", doc_id: "t-1", data: {}, if_version: 1 },
      ...Array.from({ length: 55 }, (_, i) => ({ op: "set", collection: "alerts", doc_id: `sync-n${i}`, data: {} })),
    ];
    writeFileSync(join(outbox, "batch-1.json"), JSON.stringify({ writes }));
    mkdirSync(join(d, "alerts"));
    prep("out", outbox, d, dest);
    const all = JSON.parse(readFileSync(join(dest, "writes.json"), "utf8")) as { collection: string }[];
    assert.equal(all.length, 56);
    assert.ok(all.every((w) => w.collection === "agents" || w.collection === "alerts"));
    assert.equal((JSON.parse(readFileSync(join(dest, "writes-1.json"), "utf8")) as unknown[]).length, 50);
    assert.equal((JSON.parse(readFileSync(join(dest, "writes-2.json"), "utf8")) as unknown[]).length, 6);
  });
  test("out: with no inbox read, Jenny's desk still refreshes but keeps the light the last inbox sweep gave it", () => {
    const d = dump(), outbox = join(d, "outbox"), dest = join(d, "dest");
    mkdirSync(outbox);
    writeFileSync(join(d, "existing.json"), JSON.stringify({ "agents/host": { version: 3, data: { id: "host", light: "reply", counts: { reply: 2 }, lastHeard: "2026-10-22T00:00:00Z" } } }));
    writeFileSync(join(outbox, "batch-1.json"), JSON.stringify({ writes: [
      { op: "set", collection: "agents", doc_id: "host", data: { id: "host", light: "idle", counts: { reply: 0 }, lastHeard: "2026-10-26T20:00:00Z" }, if_version: 3 },
      { op: "set", collection: "meta", doc_id: "sync", data: { skipped: ["inbox replies (pass --inbox)"] }, if_version: 1 },
    ] }));
    prep("out", outbox, d, dest);
    const host = (JSON.parse(readFileSync(join(dest, "writes.json"), "utf8")) as { doc_id: string; file_path: string }[]).find((w) => w.doc_id === "host")!;
    assert.deepEqual(JSON.parse(readFileSync(host.file_path, "utf8")), { id: "host", light: "reply", counts: { reply: 2 }, lastHeard: "2026-10-26T20:00:00Z" });
  });
});
