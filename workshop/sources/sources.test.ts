import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { HttpError, getJson, type Fetcher } from "../lib/http.ts";
import { openverse, formatCcLicense } from "./openverse.ts";
import { wikimedia, licenseAllowsCommercial } from "./wikimedia.ts";
import { unsplash } from "./unsplash.ts";
import { pexels } from "./pexels.ts";
import { searchImages, configuredSources, SOURCES, type ImageSource } from "./index.ts";

const fixture = (name: string) => JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/${name}.json`, import.meta.url)), "utf8"));

/** A fetcher that records the request and returns a canned body. */
function stub(body: unknown, status = 200) {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const fetcher: Fetcher = async (url, init) => {
    calls.push({ url, headers: init?.headers ?? {} });
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? "OK" : "Error",
      headers: { get: () => null },
      json: async () => body,
      text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
    };
  };
  return { fetcher, calls };
}

describe("openverse", () => {
  test("maps results with licence, attribution and commercial flag", async () => {
    const { fetcher, calls } = stub(fixture("openverse"));
    const out = await openverse.search("modern kitchen", { count: 2, fetcher });
    assert.equal(out.length, 2);
    const u = new URL(calls[0]!.url);
    assert.equal(u.searchParams.get("q"), "modern kitchen");
    assert.equal(u.searchParams.get("license_type"), "commercial");
    assert.equal(u.searchParams.get("page_size"), "2");
    assert.equal(out[0]!.license, "CC BY 2.0");
    assert.equal(out[0]!.creator, "Jane Example");
    assert.equal(out[0]!.pageUrl, "https://www.flickr.com/photos/example/123");
    assert.equal(out[0]!.attribution, '"Modern kitchen with oak island" by Jane Example, CC BY 2.0, via flickr');
    assert.equal(out[0]!.commercialOk, true);
    assert.equal(out[1]!.title, "Untitled");
    assert.equal(out[1]!.license, "CC0 1.0");
    assert.equal(out[1]!.creator, undefined);
  });
  test("formats CC licence names", () => {
    assert.equal(formatCcLicense("by-sa", "4.0"), "CC BY-SA 4.0");
    assert.equal(formatCcLicense("pdm"), "Public Domain Mark");
    assert.equal(formatCcLicense("cc0", "1.0"), "CC0 1.0");
  });
});

describe("wikimedia", () => {
  test("keeps commercial-ok bitmaps, drops SVG and NC files, strips HTML", async () => {
    const { fetcher, calls } = stub(fixture("wikimedia"));
    const out = await wikimedia.search("kitchen", { count: 4, fetcher });
    const u = new URL(calls[0]!.url);
    assert.equal(u.searchParams.get("gsrsearch"), "filetype:bitmap kitchen");
    assert.equal(u.searchParams.get("gsrnamespace"), "6");
    assert.deepEqual(out.map((c) => c.id), ["1001", "1004"]);
    assert.equal(out[0]!.creator, "Example User");
    assert.equal(out[0]!.license, "CC BY-SA 4.0");
    assert.equal(out[0]!.pageUrl, "https://commons.wikimedia.org/wiki/File:Modern_kitchen_interior.jpg");
    assert.equal(out[0]!.thumbUrl.includes("800px"), true);
    assert.equal(out[1]!.title, "Old kitchen 1920");
    assert.equal(out[1]!.license, "Public domain");
  });
  test("licence classifier", () => {
    assert.equal(licenseAllowsCommercial("CC BY 4.0"), true);
    assert.equal(licenseAllowsCommercial("CC BY-SA 3.0"), true);
    assert.equal(licenseAllowsCommercial("CC0"), true);
    assert.equal(licenseAllowsCommercial("Public domain"), true);
    assert.equal(licenseAllowsCommercial("CC BY-NC-SA 2.0"), false);
    assert.equal(licenseAllowsCommercial("CC BY-ND 4.0"), false);
    assert.equal(licenseAllowsCommercial("Fair use"), false);
    assert.equal(licenseAllowsCommercial(""), false);
  });
});

describe("unsplash", () => {
  let saved: string | undefined;
  beforeEach(() => { saved = process.env.UNSPLASH_ACCESS_KEY; process.env.UNSPLASH_ACCESS_KEY = "test-key"; });
  afterEach(() => { if (saved === undefined) delete process.env.UNSPLASH_ACCESS_KEY; else process.env.UNSPLASH_ACCESS_KEY = saved; });

  test("sends Client-ID auth and maps attribution, UTM links and download trigger", async () => {
    const { fetcher, calls } = stub(fixture("unsplash"));
    const out = await unsplash.search("kitchen", { count: 1, fetcher, orientation: "landscape" });
    assert.equal(calls[0]!.headers.authorization, "Client-ID test-key");
    assert.equal(new URL(calls[0]!.url).searchParams.get("orientation"), "landscape");
    assert.equal(out.length, 1);
    const c = out[0]!;
    assert.equal(c.title, "white wooden kitchen cabinet with sink");
    assert.equal(c.attribution, "Photo by Sidekix Media on Unsplash");
    assert.match(c.pageUrl, /utm_source=agent-builder/);
    assert.match(c.creatorUrl!, /utm_source=agent-builder/);
    assert.match(c.imageUrl, /w=1600/);
    assert.equal(c.downloadTrigger, "https://api.unsplash.com/photos/Ab12Cd34Ef5/download?ixid=abc");
    assert.equal(c.commercialOk, true);
  });
  test("fails clearly without a key", async () => {
    delete process.env.UNSPLASH_ACCESS_KEY;
    await assert.rejects(() => unsplash.search("x", { fetcher: stub({}).fetcher }), /UNSPLASH_ACCESS_KEY is not set/);
  });
});

describe("pexels", () => {
  let saved: string | undefined;
  beforeEach(() => { saved = process.env.PEXELS_API_KEY; process.env.PEXELS_API_KEY = "pexels-test"; });
  afterEach(() => { if (saved === undefined) delete process.env.PEXELS_API_KEY; else process.env.PEXELS_API_KEY = saved; });

  test("sends raw key auth and maps photographer credit", async () => {
    const { fetcher, calls } = stub(fixture("pexels"));
    const out = await pexels.search("kitchen", { count: 1, fetcher, orientation: "squarish" });
    assert.equal(calls[0]!.headers.authorization, "pexels-test");
    assert.equal(new URL(calls[0]!.url).searchParams.get("orientation"), "square");
    const c = out[0]!;
    assert.equal(c.id, "2724749");
    assert.equal(c.creator, "Mark McCammon");
    assert.equal(c.attribution, "Photo by Mark McCammon on Pexels");
    assert.equal(c.pageUrl, "https://www.pexels.com/photo/kitchen-and-dining-area-2724749/");
    assert.match(c.imageUrl, /dpr=2/);
  });
});

describe("http layer", () => {
  test("classifies status codes", async () => {
    for (const [status, kind] of [[401, "auth"], [403, "auth"], [429, "rate_limit"], [404, "not_found"], [503, "server"], [418, "http"]] as const) {
      await assert.rejects(() => getJson("https://x.test/", { fetcher: stub("nope", status).fetcher }), (err: unknown) => err instanceof HttpError && err.kind === kind && err.status === status);
    }
  });
  test("flags non-JSON bodies", async () => {
    const fetcher: Fetcher = async () => ({ ok: true, status: 200, statusText: "OK", headers: { get: () => null }, json: async () => { throw new SyntaxError("bad"); }, text: async () => "<html>" });
    await assert.rejects(() => getJson("https://x.test/", { fetcher }), (err: unknown) => err instanceof HttpError && err.kind === "bad_response");
  });
});

describe("searchImages", () => {
  test("only keyless providers are configured when no keys are set", () => {
    const names = configuredSources({}).map((s) => s.name);
    assert.deepEqual(names, ["openverse", "wikimedia"]);
    assert.equal(configuredSources({ PEXELS_API_KEY: "k" }).length, 3);
    assert.equal(SOURCES.length, 4);
  });
  test("tolerates a failing provider and dedupes by image URL", async () => {
    const good: ImageSource = { ...openverse, search: async () => openverse.search("q", { fetcher: stub(fixture("openverse")).fetcher }) };
    const dupe: ImageSource = { ...wikimedia, search: async () => [{ ...(await good.search("q"))[1]!, provider: "wikimedia" as const, id: "dupe" }] };
    const bad: ImageSource = { ...pexels, search: async () => { throw new HttpError("network", "https://api.pexels.com", "connection blocked"); } };
    const res = await searchImages("q", { sources: [good, dupe, bad] });
    assert.equal(res.candidates.length, 2);
    assert.deepEqual(res.errors, [{ provider: "pexels", message: "connection blocked" }]);
  });
  test("providers filter restricts the pool", async () => {
    const a: ImageSource = { ...openverse, search: async () => [] };
    let pexelsCalled = false;
    const b: ImageSource = { ...pexels, search: async () => { pexelsCalled = true; return []; } };
    await searchImages("q", { sources: [a, b], providers: ["openverse"] });
    assert.equal(pexelsCalled, false);
  });
});
