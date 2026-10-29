// Types for office-game.js (plain JS so the Office page can carry a verbatim copy).
export const SLA_PICKUP_MIN: number;
export const STALL_MIN: number;
export const RUNNER_START_HOUR: number;
export const RUNNER_END_HOUR: number;
export const POINTS: { today: number; other: number; onClock: number; sameDay: number; kevMove: number; fail: number };
export const OPEN_STATUSES: string[];
export const RECORD_FLOORS: { closedInDay: number; weekPoints: number; streakDays: number };

export type GameTicket = {
  id: string; agent: string; status: string; priority?: string; ask?: string;
  createdAt?: string; pickedAt?: string; doneAt?: string; updatedAt?: string;
  result?: { summary?: string; link?: string } | null;
};
export type GameAction = { action: string; at: string; agent?: string | null; key?: string };
export type SlaState = { state: "ok" | "fail" | "stall"; minutes: number; since: number | null };
export type SlaFinding = { id: string; agent: string; state: "fail" | "stall"; minutes: number; since: number | null };
export type DayStat = { date: string; points: number; closed: number; fails: number; kev: number; qc: number };
export type WeekStat = { start: string; points: number; closed: number; fails: number; kev: number; qc: number };
export type AgentRow = { agent: string; closed: number; fails: number; points: number; medianCloseMin: number | null };
export type Records = {
  mostClosedDay: { n: number; date: string | null; on: string | null };
  bestWeek: { points: number; weekOf: string | null; on: string | null };
  longestStreak: { days: number; on: string | null };
};
export type Game = {
  today: string; sabbath: boolean; day: DayStat; week: WeekStat; lastWeek: WeekStat;
  openNow: number; oldest: { id: string; agent: string; createdAt: string; waitedMin: number } | null; medianPickupMin: number | null;
  streak: number; agents: AgentRow[]; kev: { moves: number; points: number }; records: Records; firstDay: string | null;
};

export function pacificDate(ms: number): string;
export function dayOfWeek(date: string): number;
export function addDays(date: string, n: number): string;
export type SabbathPlace = { from: string; name: string; lat: number; lon: number; tz: string };
export const SABBATH_PLACES: SabbathPlace[];
export function sabbathPlace(date: string): SabbathPlace;
export function sunsetAt(date: string, place?: SabbathPlace): number;
export function sabbathWindow(ms: number): { start: number; end: number; friday: string; saturday: string; place: string; tz: string };
export function isSabbathAt(ms: number): boolean;
export function isSabbathDay(date: string): boolean;
export function weekStart(date: string): string;
export function isRunnerTime(ms: number): boolean;
export function runnerMinutes(from: number, to: number): number;
export function addRunnerMinutes(from: number, minutes: number): number;
export function fmtWait(min: number): string;
export function clip(text: unknown, n: number): string;
export function slaTitle(state: "fail" | "stall", minutes: number, ask: string | undefined): string;
export function pickupAt(t: GameTicket): number | null;
export function failDeadline(t: GameTicket): number | null;
export function failedAt(t: GameTicket, now: number): number | null;
export function slaState(t: GameTicket, now: number): SlaState;
export function ticketScore(t: GameTicket): { points: number; base: number; onClock: boolean; sameDay: boolean; date: string } | null;
export function slaFindings(tickets: GameTicket[], now: number): SlaFinding[];
export function buildGame(input: { now: number; tickets?: GameTicket[]; actions?: GameAction[]; qcByDay?: Record<string, number> }): Game;
export function mergeRecords(live: Records, prior?: Partial<Records> | null): Records;
export function newRecords(rec: Partial<Records> | null | undefined, today: string): { key: string; text: string }[];
