// Kev's QC notes into Crelate (Q, 30 Oct 2026; ticket t-202610300215-crnt).
// The one Crelate write Kev allowed (standing rules, 30 Oct: "notes only"): a note Kev typed on a candidates-in-process
// row in the Today view goes onto that candidate's Crelate record, marked as Kev's (via Radar), in his words unedited.
// Nothing else is ever written: no stage moves, tags, edits, new records, deletes, and never a note an agent wrote.
// The only write is POST /notes. Everything else is a GET. Dry run unless --apply.
//
//   npm run crelate-note -- --file notes.json            dry run: match each candidate, show what would be written
//   npm run crelate-note -- --file notes.json --apply    write, then read each note back
//
// notes.json: [{ "key": "daily-2026-10-30-note-<qcId>", "name": "First Last", "note": "Kev's words", "at": "<ISO>" }]
// The name comes from the action's title ("QC note: <name> (<date>)"). Output: one JSON result per note on stdout.
// The API key is read from CRELATE_API_KEY and never printed.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { defaultFetcher, type Fetcher } from "../lib/http.ts";

export const API = "https://app.crelate.com/api3/";
const BROWSER_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"; // Cloudflare blocks default clients
const MAX_NOTE = 4000;

export type NoteInput = { key: string; name: string; note: string; at: string };
export type NoteStatus = "would-write" | "written" | "exists" | "no-match" | "many-matches" | "invalid" | "readback-failed" | "error";
export type NoteResult = { key: string; name: string; status: NoteStatus; contactId?: string; noteId?: string; matches?: number; detail?: string };

/** "QC note: Brad Moore (2026-10-30)" -> "Brad Moore". */
export function nameFromTitle(title: string): string | undefined {
  const m = /^QC note:\s*(.+?)\s*\(([^()]*)\)\s*$/.exec(title.trim());
  return m ? m[1] : undefined;
}

const norm = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/** Crelate titles contacts "Last, First" (sometimes "Last, First Middle"); compare against "First Last". */
export function titleMatchesName(title: string, name: string): boolean {
  const want = norm(name);
  const parts = title.split(",");
  const asFirstLast = parts.length >= 2 ? norm(`${parts.slice(1).join(" ")} ${parts[0]}`) : norm(title);
  if (asFirstLast === want) return true;
  // "Last, First Middle" against "First Last": drop middle names, keep first and last
  if (parts.length >= 2) {
    const first = norm(parts.slice(1).join(" ")).split(" ")[0];
    const last = norm(parts[0]);
    return `${first} ${last}` === want;
  }
  return false;
}

/** Stable id so the same note version is never written twice (a later `at` is Kev's revision: a new note). */
export const externalKey = (n: NoteInput) => `radar-qc-note:${n.key}:${n.at}`;

/** What lands in Crelate: a marker line, then Kev's words exactly as he typed them. */
export function noteBody(n: NoteInput): string {
  const d = new Date(n.at);
  const day = Number.isNaN(d.getTime()) ? n.at.slice(0, 10)
    : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "America/Los_Angeles" });
  return `QC note from Kev (via Radar), ${day}:\n${n.note}`;
}

export function validate(n: Partial<NoteInput>): string | undefined {
  if (!n || typeof n !== "object") return "not an object";
  if (!n.key || !/^daily-\d{4}-\d{2}-\d{2}-note-[A-Za-z0-9_.:-]+$/.test(n.key)) return "key must be daily-<date>-note-<qcId>";
  if (!n.name || !n.name.trim()) return "no candidate name";
  if (typeof n.note !== "string" || !n.note.trim()) return "empty note";
  if (n.note.length > MAX_NOTE) return `note over ${MAX_NOTE} characters`;
  if (!n.at || Number.isNaN(new Date(n.at).getTime())) return "at must be an ISO time";
  return undefined;
}

type Resp = { Data?: any; Errors?: any[] };

export function crelateClient(apiKey: string, fetcher: Fetcher = defaultFetcher) {
  const headers = { "X-Api-Key": apiKey, "user-agent": BROWSER_UA, accept: "application/json" };
  async function call(method: "GET" | "POST", path: string, body?: unknown): Promise<Resp> {
    if (method === "POST" && path !== "notes") throw new Error(`refused: the only write allowed is POST notes, not ${path}`);
    for (let attempt = 0; ; attempt++) {
      const res = await fetcher(API + path, {
        method, headers: body ? { ...headers, "content-type": "application/json" } : headers,
        body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(60_000),
      });
      if (res.status === 429 && attempt < 3) { await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); continue; }
      const text = await res.text();
      let json: Resp = {};
      try { json = text ? JSON.parse(text) : {}; } catch { throw new Error(`${method} ${path.split("?")[0]}: HTTP ${res.status}, not JSON`); }
      if (!res.ok) throw new Error(`${method} ${path.split("?")[0]}: HTTP ${res.status} ${JSON.stringify(json.Errors ?? "").slice(0, 200)}`);
      if (Array.isArray(json.Errors) && json.Errors.length) throw new Error(`${method} ${path.split("?")[0]}: ${JSON.stringify(json.Errors).slice(0, 200)}`);
      return json;
    }
  }
  return {
    /** Contacts whose record title is exactly this person. */
    async findContacts(name: string): Promise<{ Id: string; Title: string }[]> {
      const r = await call("GET", `contacts/search?query=${encodeURIComponent(name)}&limit=25`);
      const rows: any[] = Array.isArray(r.Data) ? r.Data : [];
      return rows.filter((x) => /contact/i.test(String(x.EntityName ?? "contacts")) && x.Id && titleMatchesName(String(x.Title ?? ""), name))
        .map((x) => ({ Id: String(x.Id), Title: String(x.Title) }));
    },
    async notesByKey(contactId: string, epk: string): Promise<any[]> {
      const r = await call("GET", `notes?parent_id=${encodeURIComponent(contactId)}&external_primary_keys=${encodeURIComponent(epk)}&limit=5`);
      return Array.isArray(r.Data) ? r.Data : [];
    },
    async createNote(contactId: string, display: string, epk: string, when: string): Promise<string> {
      const r = await call("POST", "notes", { entity: { ParentId: { Id: contactId, EntityName: "Contacts" }, Display: display, ExternalPrimaryKey: epk, When: when } });
      if (typeof r.Data !== "string" || !r.Data) throw new Error("POST notes: no id returned");
      return r.Data;
    },
    async getNote(id: string): Promise<any | undefined> {
      const r = await call("GET", `notes/${encodeURIComponent(id)}`);
      return r.Data ?? undefined;
    },
  };
}
export type CrelateNotes = ReturnType<typeof crelateClient>;

/** The Display read back may be the plain text or a JSON-wrapped string array (Crelate docs). */
export function displayText(d: unknown): string {
  if (typeof d !== "string") return "";
  const t = d.trim();
  if (t.startsWith("[") || t.startsWith("\"")) {
    try { const v = JSON.parse(t); return Array.isArray(v) ? v.join("\n") : String(v); } catch { /* plain text */ }
  }
  return d;
}

export async function writeNotes(inputs: NoteInput[], client: CrelateNotes, apply: boolean): Promise<NoteResult[]> {
  const out: NoteResult[] = [];
  for (const n of inputs) {
    const base = { key: n?.key ?? "?", name: n?.name ?? "?" };
    const bad = validate(n);
    if (bad) { out.push({ ...base, status: "invalid", detail: bad }); continue; }
    try {
      const matches = await client.findContacts(n.name);
      if (matches.length === 0) { out.push({ ...base, status: "no-match", matches: 0, detail: "no contact titled exactly this name: flag to Radar" }); continue; }
      if (matches.length > 1) { out.push({ ...base, status: "many-matches", matches: matches.length, detail: "more than one contact with this name: flag to Radar, never guess" }); continue; }
      const contactId = matches[0].Id;
      const epk = externalKey(n);
      const already = (await client.notesByKey(contactId, epk)).find((x) => x.ExternalPrimaryKey === epk);
      if (already) { out.push({ ...base, status: "exists", contactId, noteId: String(already.Id), matches: 1 }); continue; }
      const body = noteBody(n);
      if (!apply) { out.push({ ...base, status: "would-write", contactId, matches: 1, detail: body }); continue; }
      const noteId = await client.createNote(contactId, body, epk, n.at);
      const back = await client.getNote(noteId);
      const parent = back?.ParentId?.Id ?? back?.ParentId;
      const ok = back && displayText(back.Display).trim() === body.trim() && (!parent || String(parent).toLowerCase() === contactId.toLowerCase());
      out.push({ ...base, status: ok ? "written" : "readback-failed", contactId, noteId, matches: 1, detail: ok ? undefined : "note written but did not read back as sent: check it in Crelate" });
    } catch (e) {
      out.push({ ...base, status: "error", detail: e instanceof Error ? e.message : String(e) });
    }
  }
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = process.argv.slice(2);
  const arg = (k: string) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : undefined; };
  const file = arg("file");
  const apply = a.includes("--apply");
  if (!file) { console.error("Usage: npm run crelate-note -- --file notes.json [--apply]"); process.exit(2); }
  const key = process.env.CRELATE_API_KEY;
  if (!key) { console.error("CRELATE_API_KEY is not set in this environment."); process.exit(1); }
  let inputs: NoteInput[];
  try { const v = JSON.parse(readFileSync(file, "utf8")); inputs = Array.isArray(v) ? v : [v]; }
  catch (e) { console.error(`Could not read ${file}: ${e instanceof Error ? e.message : e}`); process.exit(2); }
  const results = await writeNotes(inputs, crelateClient(key), apply);
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", results }, null, 2));
  process.exit(results.some((r) => r.status === "error" || r.status === "readback-failed") ? 1 : 0);
}
