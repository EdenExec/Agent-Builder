// API credit watch for the Command Center (Kev, 4 Nov 2026: "always watching we're not running up API usage costs").
// Reads Scout's run log, employees/scout/memory/live/credits.md, one line per run:
//   - 2026-11-03 (run ...) · EL-033 · seat kev1 · paid credits 12 · free records 14 · <note>
// The seat may also be written "on kev1 seat"; "exhausted" anywhere in a line marks that seat out of credits for the month.
// Pure: no network, no writes. Counts and seat names only.
export const SEAT_CAP = 2000;           // ZoomInfo paid credits per seat per month
export type SeatStatus = "ok" | "watch" | "over" | "out";
export type SeatRow = { seat: string; weekPaid: number; monthPaid: number; projected: number; cap: number; lastRun: string | null; status: SeatStatus };
export type CreditsDoc = { schema: 1; source: string; asOf: string; month: string; weekOf: string; cap: number; seats: SeatRow[]; runs: number; flagged: number; notes: string[] };

const DAY = 86_400_000;
const ymd = (ms: number) => new Date(ms).toISOString().slice(0, 10);
/** Monday of the week holding a date (YYYY-MM-DD, treated as a calendar day). */
export function mondayOf(date: string): string { const d = new Date(date + "T12:00:00Z"); return ymd(d.getTime() - ((d.getUTCDay() + 6) % 7) * DAY); }

export type CreditLine = { date: string; seat: string; paid: number; exhausted: boolean };
export function parseLine(line: string): CreditLine | null {
  const m = /^\s*-\s*(\d{4}-\d{2}-\d{2})/.exec(line); if (!m) return null;
  const seat = /\bseat[:\s]+([A-Za-z][\w-]*)/i.exec(line)?.[1] ?? /\b(?:on\s+)?([A-Za-z][\w-]*)\s+seat\b/i.exec(line)?.[1] ?? "unknown";
  const paid = Number(/paid(?:\s+credits)?[:\s]+(\d[\d,]*)/i.exec(line)?.[1]?.replace(/,/g, "") ?? 0);
  return { date: m[1]!, seat: seat.toLowerCase(), paid, exhausted: /exhausted/i.test(line) };
}

/** Per seat: paid credits this week and this month, a straight-line month-end projection, and a flag. */
export function buildCredits(md: string, now: Date, cap = SEAT_CAP): CreditsDoc {
  const today = ymd(now.getTime()), month = today.slice(0, 7), weekOf = mondayOf(today);
  const lines = md.split(/\r?\n/).map(parseLine).filter((x): x is CreditLine => !!x && x.date <= today);
  const dim = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)).getUTCDate(), dayN = +today.slice(8, 10);
  const by = new Map<string, CreditLine[]>();
  for (const l of lines) { const a = by.get(l.seat) ?? []; a.push(l); by.set(l.seat, a); }
  const seats: SeatRow[] = [...by.entries()].map(([seat, ls]) => {
    const inMonth = ls.filter((l) => l.date.startsWith(month));
    const monthPaid = inMonth.reduce((t, l) => t + l.paid, 0), weekPaid = ls.filter((l) => l.date >= weekOf).reduce((t, l) => t + l.paid, 0);
    const projected = Math.round(monthPaid / Math.max(1, dayN) * dim);
    const out = inMonth.some((l) => l.exhausted) || monthPaid >= cap;
    const status: SeatStatus = out ? "out" : projected > cap ? "over" : projected > cap * 0.8 ? "watch" : "ok";
    const last = ls.map((l) => l.date).sort().pop() ?? null;
    return { seat, weekPaid, monthPaid, projected, cap, lastRun: last, status };
  }).sort((a, b) => a.seat.localeCompare(b.seat));
  const notes = seats.filter((s) => s.status !== "ok").map((s) =>
    s.status === "out" ? `${s.seat}: out of credits for ${month}; ZoomInfo refuses paid lookups until the month resets.`
      : s.status === "over" ? `${s.seat}: on pace for ${s.projected.toLocaleString("en-US")} of ${cap.toLocaleString("en-US")} this month.`
      : `${s.seat}: past 80% of the monthly allowance on pace.`);
  return { schema: 1, source: "employees/scout/memory/live/credits.md (Scout's run log)", asOf: now.toISOString(), month, weekOf, cap, seats, runs: lines.filter((l) => l.date.startsWith(month)).length, flagged: notes.length, notes };
}
