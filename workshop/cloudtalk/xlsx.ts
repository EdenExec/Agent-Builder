// Minimal XLSX reader for lead sheets: first worksheet (or a named one), cell text only. No dependencies.
// An .xlsx is a zip of XML parts; we read the central directory, inflate the parts we need, and pull out the cells.
import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

type Part = { method: number; compSize: number; offset: number };

function readZip(buf: Buffer): Map<string, Buffer> {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("not an xlsx file (no zip directory found)");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const parts = new Map<string, Part>();
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("bad zip directory");
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const offset = buf.readUInt32LE(p + 42);
    parts.set(buf.toString("utf8", p + 46, p + 46 + nameLen), { method, compSize, offset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  const out = new Map<string, Buffer>();
  for (const [name, part] of parts) {
    const o = part.offset;
    if (buf.readUInt32LE(o) !== 0x04034b50) throw new Error(`bad zip entry ${name}`);
    const start = o + 30 + buf.readUInt16LE(o + 26) + buf.readUInt16LE(o + 28);
    const data = buf.subarray(start, start + part.compSize);
    out.set(name, part.method === 0 ? Buffer.from(data) : inflateRawSync(data));
  }
  return out;
}

const unescapeXml = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&");

/** Concatenated text of every <t> in a fragment (handles rich-text runs). */
function textOf(fragment: string): string {
  let out = "";
  for (const m of fragment.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)) out += unescapeXml(m[1]!);
  return out;
}

function colIndex(ref: string): number {
  const letters = /^[A-Z]+/.exec(ref)?.[0] ?? "A";
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** A number stored as 5.5555550100E9 becomes "5555550100" so phone digits survive. */
function plainNumber(v: string): string {
  if (!/^-?\d+(\.\d+)?[eE][+-]?\d+$/.test(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) && Math.abs(n) < 1e21 ? BigInt(Math.round(n)).toString() : v;
}

export function readXlsx(path: string, sheetName?: string): string[][] {
  const parts = readZip(readFileSync(path));
  const text = (name: string) => parts.get(name)?.toString("utf8");
  const workbook = text("xl/workbook.xml");
  if (!workbook) throw new Error("not an xlsx file (no xl/workbook.xml)");
  const sheets = [...workbook.matchAll(/<sheet\s[^>]*>/g)].map((m) => ({
    name: unescapeXml(/name="([^"]*)"/.exec(m[0])?.[1] ?? ""),
    rid: /r:id="([^"]*)"/.exec(m[0])?.[1] ?? "",
  }));
  const chosen = sheetName ? sheets.find((s) => s.name === sheetName) : sheets[0];
  if (!chosen) throw new Error(sheetName ? `sheet "${sheetName}" not found` : "workbook has no sheets");
  const rels = text("xl/_rels/workbook.xml.rels") ?? "";
  let target = "";
  for (const m of rels.matchAll(/<Relationship\s[^>]*>/g)) {
    if (new RegExp(`Id="${chosen.rid}"`).test(m[0])) target = /Target="([^"]*)"/.exec(m[0])?.[1] ?? "";
  }
  const sheetPath = target ? (target.startsWith("/") ? target.slice(1) : `xl/${target}`) : "xl/worksheets/sheet1.xml";
  const sheetXml = text(sheetPath);
  if (!sheetXml) throw new Error(`worksheet part ${sheetPath} missing`);

  const shared: string[] = [];
  const sst = text("xl/sharedStrings.xml");
  if (sst) for (const m of sst.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)) shared.push(textOf(m[1]!));

  const rows: string[][] = [];
  for (const rm of sheetXml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: string[] = [];
    for (const cm of rm[1]!.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cm[1]!;
      const ref = /\br="([A-Z]+\d+)"/.exec(attrs)?.[1] ?? "A1";
      const type = /\bt="([^"]*)"/.exec(attrs)?.[1] ?? "n";
      const inner = cm[2] ?? "";
      let value = "";
      if (type === "inlineStr") value = textOf(inner);
      else {
        const v = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1];
        if (v !== undefined) value = type === "s" ? (shared[Number(v)] ?? "") : type === "n" ? plainNumber(v) : unescapeXml(v);
      }
      cells[colIndex(ref)] = value;
    }
    rows.push(Array.from(cells, (c) => c ?? ""));
  }
  return rows;
}
