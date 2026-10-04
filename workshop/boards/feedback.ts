// Turn pins and rejections into durable memory. Rejected ids feed curation so they never come back.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { remember, memoryDir } from "../core/memory.ts";
import type { BoardSpec, Feedback } from "./types.ts";

export function parseFeedback(text: string): Feedback {
  // Tolerate pasted text around the JSON (chat apps add prose or code fences).
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("No feedback JSON found");
  let raw: any;
  try { raw = JSON.parse(text.slice(start, end + 1)); } catch { throw new Error("Feedback is not valid JSON"); }
  // ArtifactData wraps documents as { data: {...} } and lists as { documents: [...] }.
  if (typeof raw?.board !== "string" && raw?.data && typeof raw.data.board === "string") raw = raw.data;
  if (typeof raw.board !== "string" || !raw.board) throw new Error('Feedback needs a "board"');
  const list = (v: unknown, name: string) => {
    if (v === undefined) return [];
    if (!Array.isArray(v)) throw new Error(`"${name}" must be a list`);
    return v.map((x) => {
      if (typeof x?.id !== "string" || !/^[a-z]+:\S+$/.test(x.id)) throw new Error(`Bad tile id in "${name}": ${JSON.stringify(x?.id)}`);
      return { id: x.id, reason: typeof x.reason === "string" && x.reason.trim() ? x.reason.trim() : undefined };
    });
  };
  return { board: raw.board, pins: list(raw.pins, "pins"), rejects: list(raw.rejects, "rejects"), comment: typeof raw.comment === "string" ? raw.comment.trim() || undefined : undefined };
}

export function loadExcluded(employeeDir: string): Set<string> {
  const f = join(memoryDir(employeeDir), "rejected-images.md");
  if (!existsSync(f)) return new Set();
  return new Set([...readFileSync(f, "utf8").matchAll(/^- \S+: (\S+:\S+)$/gm)].map((m) => m[1]!));
}

export type Applied = { pinned: number; rejected: number; unknown: string[]; noReason: number };

export function applyFeedback(employeeDir: string, spec: BoardSpec, fb: Feedback, now = new Date()): Applied {
  if (fb.board !== spec.slug) throw new Error(`Feedback is for board "${fb.board}", not "${spec.slug}"`);
  const byId = new Map(spec.tiles.map((t) => [t.id, t]));
  const out: Applied = { pinned: 0, rejected: 0, unknown: [], noReason: 0 };
  const label = (id: string) => { const t = byId.get(id)!; return `"${t.candidate.title.slice(0, 60)}" by ${t.candidate.creator ?? "unknown"} (${id}) on board "${spec.title}"`; };
  for (const p of fb.pins) {
    if (!byId.has(p.id)) { out.unknown.push(p.id); continue; }
    remember(employeeDir, "taste", `Pinned ${label(p.id)}${p.reason ? `: ${p.reason}` : ""}`, now);
    out.pinned++;
  }
  for (const r of fb.rejects) {
    if (!byId.has(r.id)) { out.unknown.push(r.id); continue; }
    remember(employeeDir, "taste", `Rejected ${label(r.id)}${r.reason ? `: ${r.reason}` : " (no reason given)"}`, now);
    remember(employeeDir, "rejected-images", r.id, now);
    if (!r.reason) out.noReason++;
    out.rejected++;
  }
  if (fb.comment) remember(employeeDir, "taste", `Board "${spec.title}" comment: ${fb.comment}`, now);
  return out;
}
