// npm run sabbath [-- <ISO time>] [--json]
// Is this instant inside the Sabbath (Friday sunset to Saturday sunset where the family lives; Kev, 24 Oct 2026)?
// Exit 0 = inside the Sabbath (a routine stops here, holding what Kev sent), 1 = not, 2 = bad input.
// Scheduled routines run it as their first step. The rule and the sunset maths live in workshop/core/office-game.js.
import { pathToFileURL } from "node:url";
import { isSabbathAt, sabbathWindow } from "../core/office-game.js";

export function sabbathReport(ms: number): { sabbath: boolean; lines: string[]; json: Record<string, unknown> } {
  const w = sabbathWindow(ms), inside = isSabbathAt(ms);
  const fmt = (t: number) => new Date(t).toLocaleString("en-US", { timeZone: w.tz, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  const lines = [
    inside ? `SABBATH: yes. Hold everything Kev sends; launch it after sundown ${fmt(w.end)}.` : `SABBATH: no. The next one begins at sundown ${fmt(w.start)}.`,
    `Now:             ${fmt(ms)}`,
    `Friday sunset:   ${fmt(w.start)}  (${w.place})`,
    `Saturday sunset: ${fmt(w.end)}  (${w.place})`,
  ];
  return { sabbath: inside, lines, json: { sabbath: inside, now: new Date(ms).toISOString(), start: new Date(w.start).toISOString(), end: new Date(w.end).toISOString(), place: w.place, tz: w.tz } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2), at = args.find((a) => !a.startsWith("--"));
  const ms = at ? Date.parse(at) : Date.now();
  if (Number.isNaN(ms)) { console.error(`Not a time: "${at}". Use an ISO time such as 2026-10-23T19:00:00-07:00.`); process.exit(2); }
  const r = sabbathReport(ms);
  console.log(args.includes("--json") ? JSON.stringify(r.json) : r.lines.join("\n"));
  process.exit(r.sabbath ? 0 : 1);
}
