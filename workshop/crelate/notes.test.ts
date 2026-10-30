import { test } from "node:test";
import assert from "node:assert/strict";
import { nameFromTitle, titleMatchesName, noteBody, validate, writeNotes, displayText, crelateClient, externalKey, type CrelateNotes, type NoteInput } from "./notes.ts";

const note = (over: Partial<NoteInput> = {}): NoteInput => ({
  key: "daily-2026-10-30-note-qc123", name: "Brad Moore", note: "Strong call, wants Boise. Push for Thursday.", at: "2026-10-30T18:05:00Z", ...over,
});

function fake(contacts: { Id: string; Title: string }[], opts: { existing?: any[]; readBack?: (body: string) => any } = {}) {
  const log: string[] = [];
  let lastBody = "";
  const c: CrelateNotes = {
    async findContacts(name) { log.push(`find ${name}`); return contacts.filter((x) => titleMatchesName(x.Title, name)); },
    async notesByKey(id, epk) { log.push(`exists? ${id}`); return (opts.existing ?? []).filter((x) => x.ExternalPrimaryKey === epk); },
    async createNote(id, display) { log.push(`POST ${id}`); lastBody = display; return "note-1"; },
    async getNote(id) { log.push(`GET ${id}`); return opts.readBack ? opts.readBack(lastBody) : { Id: id, Display: lastBody, ParentId: { Id: contacts[0]?.Id } }; },
  };
  return { c, log };
}

test("name comes from the QC note title", () => {
  assert.equal(nameFromTitle("QC note: Brad Moore (2026-10-30)"), "Brad Moore");
  assert.equal(nameFromTitle("QC touch: Brad Moore"), undefined);
});

test("Crelate titles are Last, First; middle names are tolerated", () => {
  assert.ok(titleMatchesName("Moore, Brad", "Brad Moore"));
  assert.ok(titleMatchesName("Moore, Brad J.", "Brad Moore"));
  assert.ok(titleMatchesName("Muñoz, José", "Jose Munoz"));
  assert.ok(!titleMatchesName("Moore, Bradley", "Brad Moore"));
  assert.ok(!titleMatchesName("Moore, Brad", "Brad Moorehead"));
});

test("the body is a marker line, then Kev's words unedited", () => {
  const b = noteBody(note());
  assert.match(b, /^QC note from Kev \(via Radar\), Fri, Oct 30, 2026:\n/);
  assert.ok(b.endsWith("Strong call, wants Boise. Push for Thursday."));
});

test("bad input is refused before any call", async () => {
  assert.match(validate(note({ key: "daily-2026-10-30-touch-1" }))!, /note-/);
  assert.match(validate(note({ note: "  " }))!, /empty/);
  assert.match(validate(note({ at: "yesterday" }))!, /ISO/);
  const { c, log } = fake([{ Id: "c1", Title: "Moore, Brad" }]);
  const [r] = await writeNotes([note({ note: "" })], c, true);
  assert.equal(r.status, "invalid");
  assert.deepEqual(log, []);
});

test("dry run matches and writes nothing", async () => {
  const { c, log } = fake([{ Id: "c1", Title: "Moore, Brad" }]);
  const [r] = await writeNotes([note()], c, false);
  assert.equal(r.status, "would-write");
  assert.equal(r.contactId, "c1");
  assert.ok(!log.some((l) => l.startsWith("POST")));
});

test("no match and two matches are flagged, never guessed", async () => {
  const none = fake([{ Id: "c9", Title: "Moore, Bradley" }]);
  assert.equal((await writeNotes([note()], none.c, true))[0].status, "no-match");
  const two = fake([{ Id: "c1", Title: "Moore, Brad" }, { Id: "c2", Title: "Moore, Brad" }]);
  const [r] = await writeNotes([note()], two.c, true);
  assert.equal(r.status, "many-matches");
  assert.equal(r.matches, 2);
  assert.ok(!two.log.some((l) => l.startsWith("POST")));
});

test("apply writes once, then reads it back", async () => {
  const { c, log } = fake([{ Id: "c1", Title: "Moore, Brad" }]);
  const [r] = await writeNotes([note()], c, true);
  assert.equal(r.status, "written");
  assert.equal(r.noteId, "note-1");
  assert.deepEqual(log, ["find Brad Moore", "exists? c1", "POST c1", "GET note-1"]);
});

test("the same note version is never written twice", async () => {
  const n = note();
  const { c, log } = fake([{ Id: "c1", Title: "Moore, Brad" }], { existing: [{ Id: "old", ExternalPrimaryKey: externalKey(n) }] });
  const [r] = await writeNotes([n], c, true);
  assert.equal(r.status, "exists");
  assert.ok(!log.some((l) => l.startsWith("POST")));
  // a later `at` is Kev's revision, so it gets its own note
  assert.notEqual(externalKey(note({ at: "2026-10-30T19:00:00Z" })), externalKey(n));
});

test("a read-back that doesn't match is reported", async () => {
  const { c } = fake([{ Id: "c1", Title: "Moore, Brad" }], { readBack: () => ({ Id: "note-1", Display: "something else", ParentId: { Id: "c1" } }) });
  assert.equal((await writeNotes([note()], c, true))[0].status, "readback-failed");
});

test("JSON-wrapped Display reads back as text", () => {
  assert.equal(displayText(JSON.stringify(["line one", "line two"])), "line one\nline two");
  assert.equal(displayText("plain"), "plain");
});

test("the client refuses any write except POST notes, and never sends the key anywhere else", async () => {
  const calls: { url: string; method?: string; body?: string; key?: string }[] = [];
  const fetcher = async (url: string, init: any = {}) => {
    calls.push({ url, method: init.method, body: init.body, key: init.headers?.["X-Api-Key"] });
    const data = url.includes("contacts/search") ? [{ EntityName: "Contacts", Id: "c1", Title: "Moore, Brad" }] : url.endsWith("/notes") ? "note-1" : [];
    return { ok: true, status: 200, statusText: "OK", headers: { get: () => null }, json: async () => ({ Data: data }), text: async () => JSON.stringify({ Data: data }) };
  };
  const client = crelateClient("test-key", fetcher as any);
  assert.deepEqual(await client.findContacts("Brad Moore"), [{ Id: "c1", Title: "Moore, Brad" }]);
  const id = await client.createNote("c1", "QC note from Kev (via Radar), x:\nhi", "radar-qc-note:k:t", "2026-10-30T18:05:00Z");
  assert.equal(id, "note-1");
  const post = calls.find((c) => c.method === "POST")!;
  assert.equal(post.url, "https://app.crelate.com/api3/notes");
  assert.deepEqual(JSON.parse(post.body!).entity.ParentId, { Id: "c1", EntityName: "Contacts" });
  assert.ok(calls.every((c) => c.url.startsWith("https://app.crelate.com/api3/") && c.key === "test-key"));
  assert.equal(calls.filter((c) => c.method === "POST").length, 1);
});
