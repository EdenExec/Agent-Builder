import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Fetcher } from "../lib/http.ts";
import type { ImageCandidate, ImageSource } from "../sources/types.ts";
import { curate, type Found } from "./curate.ts";
import { embedTiles } from "./embed.ts";
import { renderBoard, renderBoardFragment, esc } from "./render.ts";
import { makeBoard, rebuildBoard, loadSpec } from "./make.ts";
import { parseFeedback, applyFeedback, loadExcluded } from "./feedback.ts";
import { recall } from "../core/memory.ts";
import { tileId, type BoardSpec, type Tile } from "./types.ts";

const tmp = () => mkdtempSync(join(tmpdir(), "board-"));
let n = 0;
function cand(over: Partial<ImageCandidate> = {}): ImageCandidate {
  n++;
  return {
    provider: "openverse", id: `id${n}`, title: `Oak kitchen ${n}`, pageUrl: `https://example.org/p/${n}`,
    imageUrl: `https://img.example.org/full/${n}.jpg`, thumbUrl: `https://img.example.org/thumb/${n}.jpg`,
    width: 2000, height: 1300, creator: `Creator ${n}`, creatorUrl: `https://example.org/u/${n}`,
    license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", commercialOk: true,
    attribution: `"Oak kitchen ${n}" by Creator ${n}, CC BY 4.0`, ...over,
  };
}
const found = (q: string, c: ImageCandidate): Found => ({ ...c, query: q });
const opts = { audience: "family" as const, avoid: [] as string[], exclude: new Set<string>() };

describe("curate", () => {
  test("drops duplicates, rejected, small, avoid-listed and non-commercial for public", () => {
    const dup = cand();
    const rej = cand();
    const items = [found("a", dup), found("a", dup), found("a", rej), found("a", cand({ width: 300 })), found("a", cand({ title: "Chrome faucet closeup" })), found("a", cand({ commercialOk: false })), found("a", cand())];
    const r = curate(items, { audience: "public", avoid: ["chrome"], exclude: new Set([tileId(rej)]) });
    assert.equal(r.kept.length, 2);
    const reasons = r.dropped.map((d) => d.reason).join("|");
    for (const k of ["duplicate", "previously rejected", "too small", "avoid list", "licence not cleared"]) assert.match(reasons, new RegExp(k));
  });
  test("non-commercial is fine for family boards", () => {
    assert.equal(curate([found("a", cand({ commercialOk: false }))], opts).kept.length, 1);
  });
  test("avoid matches whole word starts, not substrings in the middle", () => {
    const r = curate([found("a", cand({ title: "Neon sign" })), found("a", cand({ title: "Pioneer cabin" }))], { ...opts, avoid: ["neon"] });
    assert.deepEqual(r.kept.map((c) => c.title), ["Pioneer cabin"]);
  });
  test("caps per creator and round-robins queries", () => {
    const same = (q: string) => found(q, cand({ creator: "Same Person" }));
    const items = [same("a"), same("a"), same("a"), same("a"), found("b", cand()), found("b", cand())];
    const r = curate(items, { ...opts, maxPerCreator: 2, target: 10 });
    assert.equal(r.kept.filter((c) => c.creator === "Same Person").length, 2);
    assert.equal(r.kept.length, 4);
    const order = curate([found("a", cand()), found("a", cand()), found("b", cand()), found("b", cand())], { ...opts, target: 3 }).kept.map((c) => c.query);
    assert.deepEqual(order, ["a", "b", "a"]);
  });
  test("stops at target and reports the rest", () => {
    const r = curate(Array.from({ length: 10 }, () => found("a", cand())), { ...opts, target: 4 });
    assert.equal(r.kept.length, 4);
    assert.equal(r.dropped.filter((d) => d.reason === "over target size").length, 6);
  });
  test("drops near-duplicates from one creator's series but keeps different subjects", () => {
    const a = cand({ creator: "Pat", title: "Crown Hall, Illinois Institute 1" }), b = cand({ creator: "Pat", title: "Crown Hall, Illinois Institute 2" });
    const c = cand({ creator: "Pat", title: "Farnsworth House at dusk" }), d = cand({ creator: "Sam", title: "Crown Hall, Illinois Institute 3" });
    const r = curate([a, b, c, d].map((x) => found("a", x)), opts);
    assert.deepEqual(r.kept.map((x) => x.id), [a.id, c.id, d.id]);
    assert.match(r.dropped[0]!.reason, /near-duplicate/);
  });
  test("unknown creators are not capped", () => {
    const r = curate(Array.from({ length: 5 }, () => found("a", cand({ creator: undefined }))), { ...opts, maxPerCreator: 1 });
    assert.equal(r.kept.length, 5);
  });
});

const png = Buffer.from("89504e470d0a1a0a", "hex");
function imgFetcher(handler: (url: string) => { status?: number; type?: string; body?: Buffer; length?: string }): Fetcher {
  return async (url) => {
    const h = handler(url);
    const status = h.status ?? 200;
    return {
      ok: status < 300, status, statusText: "", text: async () => "", json: async () => ({}),
      headers: { get: (k: string) => (k.toLowerCase() === "content-type" ? (h.type ?? "image/jpeg") : k.toLowerCase() === "content-length" ? (h.length ?? null) : null) },
      arrayBuffer: async () => { const b = h.body ?? png; return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer; },
    };
  };
}
const tileOf = (c: ImageCandidate): Tile => ({ id: tileId(c), candidate: c, note: "n", query: "q" });
/** URLs in these tests end in /<n>.jpg where the candidate id is id<n>. */
const isFor = (u: string, c: ImageCandidate) => u.endsWith(`/${c.id.slice(2)}.jpg`);

describe("embed", () => {
  test("embeds the full image as a data URI", async () => {
    const t = tileOf(cand());
    const r = await embedTiles([t], { fetcher: imgFetcher(() => ({})) });
    assert.equal(r.failed.length, 0);
    assert.match(t.dataUri!, /^data:image\/jpeg;base64,/);
  });
  test("falls back to the thumbnail when the full image fails or is too big", async () => {
    const a = tileOf(cand()), b = tileOf(cand());
    const f = imgFetcher((u) => (u.includes("/full/") ? (isFor(u, a.candidate) ? { status: 500 } : { length: "99999999" }) : { type: "image/png" }));
    const r = await embedTiles([a, b], { fetcher: f });
    assert.equal(r.failed.length, 0);
    assert.match(a.dataUri!, /^data:image\/png/);
    assert.match(b.dataUri!, /^data:image\/png/);
  });
  test("rejects non-images, http URLs and oversized bodies, and reports them", async () => {
    const html = tileOf(cand()), plain = tileOf(cand({ imageUrl: "http://x.org/a.jpg", thumbUrl: "http://x.org/b.jpg" })), big = tileOf(cand());
    const f = imgFetcher((u) => (isFor(u, html.candidate) ? { type: "text/html" } : { body: Buffer.alloc(2000) }));
    const r = await embedTiles([html, plain, big], { fetcher: f, maxBytes: 1000 });
    assert.equal(r.failed.length, 3);
    assert.match(r.failed.find((x) => x.id === html.id)!.error, /not an image/);
    assert.match(r.failed.find((x) => x.id === plain.id)!.error, /https/);
    assert.match(r.failed.find((x) => x.id === big.id)!.error, /too large/);
  });
});

function spec(extra: Partial<BoardSpec> = {}): BoardSpec {
  const c = cand({ title: `Bad <script>alert(1)</script> "title"`, creator: "A&B", attribution: "Photo by A&B, CC BY", creatorUrl: "javascript:alert(1)", pageUrl: "javascript:alert(2)" });
  return { slug: "test-board", title: "Quiet <Timber>", theme: "Living", audience: "family", avoid: [], createdAt: "2026-10-04T00:00:00Z",
    tiles: [{ ...tileOf(c), note: "Warm <b>oak</b>", dataUri: "data:image/png;base64,AAAA" }, { ...tileOf(cand()), query: "other", note: "" }], ...extra };
}

describe("render", () => {
  test("escapes untrusted text and refuses non-http links", () => {
    const html = renderBoard(spec());
    assert.doesNotMatch(html, /<script>alert/);
    assert.doesNotMatch(html, /href="javascript:/);
    assert.match(html, /Quiet &lt;Timber&gt;/);
    assert.match(html, /Warm &lt;b&gt;oak&lt;\/b&gt;/);
    assert.match(html, /A&amp;B/);
    assert.equal(esc(`'"<>&`), "&#39;&quot;&lt;&gt;&amp;");
  });
  test("fragment has no document wrapper but keeps title, style, board root and script; standalone wraps it", () => {
    const f = renderBoardFragment(spec());
    assert.match(f, /^<title>Quiet &lt;Timber&gt;<\/title>/);
    assert.doesNotMatch(f, /<!doctype|<html[ >]|<head[ >]|<body[ >]/i);
    assert.match(f, /<div id="board" data-slug="test-board">/);
    assert.match(f, /getElementById\("board"\)\.dataset\.slug/);
    assert.match(renderBoard(spec()), /^<!doctype html>[\s\S]*<body>[\s\S]*<\/body><\/html>\n$/);
  });
  test("follows the Eden identity: Montserrat, neutral palette, name and site, no serif or brand colour", () => {
    const html = renderBoard(spec());
    assert.match(html, /font-family:'Montserrat';font-style:normal;font-weight:100 900;[^}]*data:font\/woff2;base64,/);
    assert.match(html, /--font:'Montserrat'/);
    assert.match(html, /EDEN PARTNER GROUP/);
    assert.match(html, /edenpartnergroup\.com/);
    assert.match(html, /--bg:#FAF8F3/);
    assert.doesNotMatch(html, /Georgia|#c4491f|#ff8159/i);
  });
  test("carries attribution, licence and filters on every tile and is theme-aware and self-contained", () => {
    const s = spec();
    const html = renderBoard(s);
    assert.equal((html.match(/<article class="tile"/g) ?? []).length, 2);
    for (const t of s.tiles) assert.ok(html.includes(esc(t.candidate.attribution)));
    assert.match(html, /data-q="other"/);
    assert.match(html, /prefers-color-scheme:dark/);
    assert.match(html, /<em>not embedded<\/em>/);
    assert.match(html, /<a href="https:\/\/example\.org\/u\/\d+"[^>]*>&quot;Oak kitchen \d+&quot; by Creator/);
    assert.equal((html.match(/class="note"/g) ?? []).length, 1, "empty notes are not rendered");
    assert.doesNotMatch(html, /<script src=/);
    assert.match(html, /data-slug="test-board"/);
    assert.match(html, /<title>Quiet &lt;Timber&gt;<\/title>/);
  });
});

function source(name: "openverse" | "pexels", byQuery: Record<string, ImageCandidate[]>, fail = false): ImageSource {
  return { name, label: name, host: `${name}.test`, terms: "", async search(q) { if (fail) throw new Error("boom"); return byQuery[q] ?? []; } };
}

describe("makeBoard", () => {
  test("builds, saves spec and html, survives a failing provider, drops unembeddable tiles", async () => {
    const out = tmp();
    const good = [cand(), cand(), cand()];
    const dead = cand({ imageUrl: "https://dead.test/x.jpg", thumbUrl: "https://dead.test/y.jpg" });
    const r = await makeBoard({
      slug: "t1", title: "T", theme: "Th", queries: ["q1", "q2"], audience: "family", avoid: [], exclude: new Set(), outRoot: out,
      searchSources: [source("openverse", { q1: [good[0]!, dead], q2: [good[1]!, good[2]!] }), source("pexels", {}, true)],
      imageFetcher: imgFetcher((u) => (u.includes("dead.test") ? { status: 404 } : {})),
    });
    assert.equal(r.spec.tiles.length, 3);
    assert.equal(r.embedFailures.length, 1);
    assert.equal(r.searchErrors[0]!.provider, "pexels");
    assert.ok(existsSync(r.htmlPath));
    const saved = loadSpec(r.specPath);
    assert.equal(saved.tiles.length, 3);
    assert.ok(saved.tiles.every((t) => !("dataUri" in t)), "spec must not store image bytes");
    assert.match(readFileSync(r.htmlPath, "utf8"), /data:image\/jpeg;base64,/);
  });
  test("rebuild re-embeds from the lean spec and drops tiles that vanished", async () => {
    const out = tmp();
    const [a, b] = [cand(), cand()];
    const r = await makeBoard({ slug: "t2", title: "T", theme: "Th", queries: ["q1", "q2"], audience: "family", avoid: [], exclude: new Set(), outRoot: out,
      searchSources: [source("openverse", { q1: [a], q2: [b] })], imageFetcher: imgFetcher(() => ({})) });
    const spec = loadSpec(r.specPath);
    spec.tiles[0]!.note = "Edited note";
    writeFileSync(r.specPath, JSON.stringify(spec));
    const rb = await rebuildBoard(r.specPath, out, { imageFetcher: imgFetcher((u) => (isFor(u, b) ? { status: 404 } : {})) });
    assert.equal(rb.spec.tiles.length, 1);
    assert.match(readFileSync(rb.htmlPath, "utf8"), /Edited note/);
  });
  test("honours exclude memory and public licensing end to end", async () => {
    const out = tmp();
    const rejected = cand(), nc = cand({ commercialOk: false }), ok = cand();
    const r = await makeBoard({ slug: "t3", title: "T", theme: "Th", queries: ["q1", "q2"], audience: "public", avoid: [], exclude: new Set([tileId(rejected)]), outRoot: out,
      searchSources: [source("openverse", { q1: [rejected, nc], q2: [ok] })], imageFetcher: imgFetcher(() => ({})) });
    assert.deepEqual(r.spec.tiles.map((t) => t.id), [tileId(ok)]);
  });
  test("clear errors: bad slug, one query, nothing found, nothing downloadable", async () => {
    const base = { title: "T", theme: "Th", audience: "family" as const, avoid: [], exclude: new Set<string>(), outRoot: tmp(), imageFetcher: imgFetcher(() => ({})) };
    await assert.rejects(makeBoard({ ...base, slug: "Bad Slug", queries: ["a", "b"] }), /slug/);
    await assert.rejects(makeBoard({ ...base, slug: "ok", queries: ["only"] }), /at least 2/);
    await assert.rejects(makeBoard({ ...base, slug: "ok", queries: ["a", "b"], searchSources: [source("openverse", {}, true)] }), /No images found.*boom.*doctor/);
    await assert.rejects(makeBoard({ ...base, slug: "ok", queries: ["a", "b"], searchSources: [source("openverse", { a: [cand()] })], imageFetcher: imgFetcher(() => ({ status: 404 })) }), /Every image failed/);
  });
});

describe("feedback", () => {
  const fbText = (o: unknown) => "Here you go:\n```json\n" + JSON.stringify(o) + "\n```\nthanks";
  test("parses pasted text and validates", () => {
    const fb = parseFeedback(fbText({ board: "b", pins: [{ id: "openverse:1", reason: " warm " }], rejects: [{ id: "pexels:2" }], comment: " more wood " }));
    assert.deepEqual(fb.pins, [{ id: "openverse:1", reason: "warm" }]);
    assert.equal(fb.rejects[0]!.reason, undefined);
    assert.equal(fb.comment, "more wood");
    assert.throws(() => parseFeedback("nothing"), /No feedback/);
    assert.throws(() => parseFeedback("{bad"), /valid JSON|No feedback/);
    assert.throws(() => parseFeedback('{"pins":[]}'), /board/);
    assert.throws(() => parseFeedback('{"board":"b","pins":[{"id":"nocolon"}]}'), /Bad tile id/);
    assert.throws(() => parseFeedback('{"board":"b","pins":"x"}'), /must be a list/);
  });
  test("reads the document exactly as the board page stores it, wrapped or not, ignoring extra fields", () => {
    const doc = { board: "b", pins: [{ id: "pexels:9", reason: "light" }], rejects: [], status: "new", createdAt: "2026-10-04T00:00:00Z" };
    assert.equal(parseFeedback(JSON.stringify(doc)).pins[0]!.id, "pexels:9");
    assert.equal(parseFeedback(JSON.stringify({ data: doc, version: 3 })).board, "b");
  });
  test("board page sends to the Desk database when available and still offers copy", () => {
    const html = renderBoard(spec());
    assert.match(html, /id="fbsend"[^>]*hidden/);
    assert.match(html, /collection\("feedback"\)/);
    assert.match(html, /id="fbcopy"/);
  });
  test("writes taste and rejected ids to memory, and curate then excludes them", () => {
    const emp = tmp();
    const s = spec({ slug: "b" });
    const [t1, t2] = s.tiles;
    const fb = parseFeedback(fbText({ board: "b", pins: [{ id: t1!.id, reason: "warm timber" }], rejects: [{ id: t2!.id }, { id: "openverse:ghost", reason: "x" }], comment: "more oak" }));
    const a = applyFeedback(emp, s, fb, new Date("2026-10-04T00:00:00Z"));
    assert.deepEqual([a.pinned, a.rejected, a.noReason, a.unknown], [1, 1, 1, ["openverse:ghost"]]);
    const m = recall(emp);
    assert.match(m.taste!, /Pinned .* warm timber/);
    assert.match(m.taste!, /Rejected .* \(no reason given\)/);
    assert.match(m.taste!, /comment: more oak/);
    assert.deepEqual([...loadExcluded(emp)], [t2!.id]);
    assert.equal(loadExcluded(tmp()).size, 0);
    assert.throws(() => applyFeedback(emp, spec({ slug: "other" }), fb), /not "other"/);
  });
});
