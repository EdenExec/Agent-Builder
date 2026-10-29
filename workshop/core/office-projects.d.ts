// Types for office-projects.js (plain JS so the Office page can carry a verbatim copy).
export const TITLE_WORDS: number;
export const STATUS_WORDS: number;
export const NEED_WORDS: number;
export const SHIPPED_DAYS: number;

export type ItemState = "needs" | "open" | "shipped";
export type ProjectTicket = {
  id: string; agent?: string; status: string; ask?: string; title?: string; project?: string; blockedOn?: string;
  proposed?: { exact?: string } | null; createdAt?: string; updatedAt?: string; doneAt?: string;
  result?: { summary?: string; link?: string } | null;
};
export type ProjectItem = { title: string; state: ItemState; link?: string; at?: string | null; note?: string; ticket?: string };
export type ProjectDefLite = { id: string; keywords?: string[] };

export function squash(text: unknown): string;
export function cutWords(text: unknown, n: number): string;
export function firstClause(text: unknown): string;
export function ticketTitle(x: Partial<ProjectTicket>): string;
export function needLine(x: Partial<ProjectTicket>): string;
export function ticketState(x: Pick<ProjectTicket, "status">): ItemState;
export function isLive(x: Pick<ProjectTicket, "status">): boolean;
export function inferProject(x: Partial<ProjectTicket>, defs: ProjectDefLite[]): { id: string; how: "field" | "path" | "keyword" } | null;
export function ticketItem(x: ProjectTicket): ProjectItem & { ticket: string };
export function groupTickets(tickets: ProjectTicket[], defs: ProjectDefLite[], now: number): { byProject: Record<string, ProjectTicket[]>; loose: ProjectTicket[] };
export function recent(at: string | number | null | undefined, now: number): boolean;
export function mergeItems(fileItems: ProjectItem[], tickets: ProjectTicket[], now: number): ProjectItem[];
export function countItems(items: ProjectItem[]): { needs: number; open: number; shipped: number };
export function chips(c: { needs: number; open: number; shipped: number }): string[];
export function autoStatus(items: ProjectItem[]): string;
