// The projects on each agent's desk sheet (Kev, 29 Oct 2026). Pure: the CLI (workshop/office/projects-load.ts) reads the files and hands them in.
// A project comes from its brief (projects/<slug>/brief.yaml or brief.md) plus projects/virtual-office/project-owners.yaml; its items come from a
// schedule file's rows (deliverables) and from the agent's tickets. The title, state and project rules live in office-projects.js, which the page also carries.
import { autoStatus, countItems, cutWords, groupTickets, mergeItems, STATUS_WORDS, type ProjectItem, type ProjectTicket } from "./office-projects.js";

export type ProjectDef = {
  id: string; title: string;
  /** Agent ids. The first is the owner and sees every row; the others see only the rows whose owner names them. */
  agents: string[];
  keywords: string[];
  /** Repo path of the file the desk's project title links to (the schedule, else the brief). */
  link?: string;
  /** Rows read from the schedule file: item plus the Owner cell, so each agent sees its own. */
  rows?: { owner: string; item: ProjectItem }[];
  /** A status the files give (the schedule's own summary). Absent: the status is derived from the items and the page keeps it fresh. */
  status?: string;
};
export type DeskProject = { id: string; title: string; status: string; statusAuto: boolean; owner: string; keywords: string[]; link?: string; items: ProjectItem[] };

const CAPS = { needs: 8, open: 10, shipped: 6 };
const cap = (items: ProjectItem[]): ProjectItem[] => {
  const seen = { needs: 0, open: 0, shipped: 0 };
  return items.filter((i) => ++seen[i.state] <= CAPS[i.state]);
};

/** Does a schedule Owner cell name this agent? "Docket (A)" and "Jenny" match; "Employment attorney (through Kev)" matches nobody. */
export const ownerNames = (owner: string, name: string): boolean => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(owner.trim());

/**
 * The projects on one agent's desk. A project is listed when the agent is among its agents, or when one of the agent's tickets belongs to it
 * (its `project` field, a path or a keyword: see inferProject). `link` turns a repo path into a URL.
 */
export function buildAgentProjects(agent: { id: string; name: string }, defs: ProjectDef[], tickets: ProjectTicket[], now: Date, link: (u?: string | null) => string | undefined, scrub: (s: string, n?: number) => string): DeskProject[] {
  const mine = tickets.filter((t) => t.agent === agent.id);
  const g = groupTickets(mine, defs, now.getTime());
  const out: DeskProject[] = [];
  for (const d of defs) {
    const owner = d.agents[0] === agent.id;
    const listed = d.agents.includes(agent.id) || (g.byProject[d.id]?.length ?? 0) > 0;
    if (!listed) continue;
    const fileItems = (d.rows ?? []).filter((r) => owner || ownerNames(r.owner, agent.name)).map((r) => r.item);
    const tks = g.byProject[d.id] ?? [];
    const items = cap(mergeItems(fileItems, tks, now.getTime())).map((i) => ({ ...i, title: scrub(i.title, 80), ...(i.note ? { note: scrub(i.note, 220) } : {}), link: link(i.link) ?? "" }));
    if (!items.length && !d.agents.includes(agent.id)) continue;
    const auto = !d.status;
    out.push({ id: d.id, title: d.title, status: scrub(cutWords(d.status ?? autoStatus(items), STATUS_WORDS), 90), statusAuto: auto, owner: d.agents[0] ?? agent.id, keywords: d.keywords, ...(d.link ? { link: link(d.link) } : {}), items });
  }
  const weight = (p: DeskProject) => { const c = countItems(p.items); return c.needs * 100 + c.open; };
  return out.sort((a, b) => weight(b) - weight(a) || a.title.localeCompare(b.title));
}
