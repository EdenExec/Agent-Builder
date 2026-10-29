// npm run scorecard-rows -- --week 2026-10-19 [--board projects/workforce/board/current.json] [--out rows.json]
// After the Friday 9:55am PT Crelate pull (Kev, 23 Oct 2026): turns the board into one people/<slug>/scorecards/<week> row per person
// for the Round Table's "Numbers and trend" tab, and writes them as an ArtifactData batch (`writes`) to <out>. Counts only, never a name.
import { readFileSync, writeFileSync } from "node:fs";

const a = process.argv.slice(2), arg = (k: string) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : undefined; };
const week = arg("week"), board = JSON.parse(readFileSync(arg("board") ?? "projects/workforce/board/current.json", "utf8")), out = arg("out") ?? "scorecard-rows.json";
if (!week) { console.error("Usage: npm run scorecard-rows -- --week <Monday YYYY-MM-DD> [--board file] [--out file]"); process.exit(1); }
type Row = { slug: string; this?: Record<string, number>; rp_days_at_15?: number; rp_by_day?: Record<string, number> };
const writes = [...(board.recruiters ?? []), ...(board.leadership ?? [])].map((r: Row) => {
  const t = r.this ?? {};
  const days = [1, 2, 3, 4, 5].map((dow) => Object.entries(r.rp_by_day ?? {}).find(([d]) => new Date(`${d}T12:00:00Z`).getUTCDay() === dow)?.[1] ?? 0);
  return { op: "set", collection: `people/${r.slug}/scorecards`, doc_id: week, data: {
    week_of: week, partial: !!board.week?.partial, source: `Crelate API v3, ${board.as_of ?? "pull time unknown"}`,
    rps: t.rps ?? 0, rp_days: r.rp_days_at_15 ?? 0, rp_by_day: days, mps: t.mps ?? 0, resumes: t.resumes ?? 0, ptcs: t.ptcs ?? 0, subs: t.subs ?? 0, ftis: t.ftis ?? 0,
  } };
});
writeFileSync(out, JSON.stringify(writes, null, 2) + "\n");
console.log(`${writes.length} scorecard row(s) for the week of ${week} written to ${out}. Push them with one ArtifactData batch on the Round Table (pin if_version for rows that already exist).`);
