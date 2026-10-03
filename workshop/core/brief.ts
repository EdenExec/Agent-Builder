// The design brief: the contract between a brainstorm and the work that follows.
// Stored as YAML so it can be hand-edited; rendered to markdown for review.
import { parse } from "yaml";

export type Brief = {
  project: string;
  /** "family" for personal builds, "public" for anything shown to or built for others. */
  audience: "family" | "public";
  status: "draft" | "approved";
  site: {
    address?: string;
    /** e.g. "Boise, ID (Ada County)" or "Spokane, WA". Required: zoning depends on it. */
    jurisdiction: string;
    lotSizeSqFt?: number;
    lotDims?: string;
    orientationNotes?: string;
    slopeNotes?: string;
    views?: string;
    utilities?: string;
    constraints?: string[];
  };
  program: {
    type: "executive-home" | "ranch" | "other";
    bedrooms: number;
    bathrooms: number;
    targetSqFt?: number;
    garageBays?: number;
    stories?: number;
    mustHaves: string[];
    niceToHaves?: string[];
    rooms?: { name: string; notes?: string }[];
  };
  style: { words: string[]; materials?: string[]; references?: string[]; avoid?: string[] };
  budget: { low?: number; high?: number; confidence?: "firm" | "rough" | "unknown" };
  timeline?: string;
  /** Things the agent assumed. Shown to the user for approval, never hidden. */
  assumptions: string[];
  openQuestions?: string[];
};

export function parseBrief(text: string): Brief {
  return parse(text) as Brief;
}

/** Returns what still blocks approval. Empty means the brief is complete enough to send the agent away. */
export function missingFields(b: Partial<Brief>): string[] {
  const m: string[] = [];
  if (!b.project?.trim()) m.push("project name");
  if (b.audience !== "family" && b.audience !== "public") m.push("audience (family or public)");
  if (!b.site?.jurisdiction?.trim()) m.push("site.jurisdiction");
  if (!b.program || !(b.program.bedrooms > 0)) m.push("program.bedrooms");
  if (!b.program || !(b.program.bathrooms > 0)) m.push("program.bathrooms");
  if (!b.program?.mustHaves?.length) m.push("program.mustHaves");
  if ((b.style?.words?.length ?? 0) < 2) m.push("style.words (at least 2)");
  const { low, high } = b.budget ?? {};
  if (typeof low !== "number" && typeof high !== "number") m.push("budget (low or high)");
  else if (typeof low === "number" && typeof high === "number" && low > high) m.push("budget.low is above budget.high");
  if (!Array.isArray(b.assumptions)) m.push("assumptions (list, may say 'none' explicitly)");
  return m;
}

const usd = (n?: number) => (typeof n === "number" ? `$${n.toLocaleString("en-US")}` : "?");
const bullets = (xs?: string[]) => (xs?.length ? xs.map((x) => `- ${x}`).join("\n") : "- none");

export function renderBrief(b: Brief): string {
  const s = b.site, p = b.program;
  const budget = b.budget.low !== undefined && b.budget.high !== undefined ? `${usd(b.budget.low)} to ${usd(b.budget.high)}` : usd(b.budget.high ?? b.budget.low);
  const missing = missingFields(b);
  return `# ${b.project}
Status: **${b.status}** · Audience: ${b.audience}${missing.length ? `\n\n> Incomplete. Missing: ${missing.join(", ")}` : ""}

## Site
- Jurisdiction: ${s.jurisdiction}${s.address ? `\n- Address: ${s.address}` : ""}${s.lotSizeSqFt ? `\n- Lot: ${s.lotSizeSqFt.toLocaleString("en-US")} sq ft${s.lotDims ? ` (${s.lotDims})` : ""}` : ""}${s.orientationNotes ? `\n- Orientation: ${s.orientationNotes}` : ""}${s.slopeNotes ? `\n- Slope: ${s.slopeNotes}` : ""}${s.views ? `\n- Views: ${s.views}` : ""}${s.utilities ? `\n- Utilities: ${s.utilities}` : ""}
${s.constraints?.length ? `\nConstraints:\n${bullets(s.constraints)}` : ""}

## Programme
- ${p.type}, ${p.bedrooms} bed / ${p.bathrooms} bath${p.targetSqFt ? `, about ${p.targetSqFt.toLocaleString("en-US")} sq ft` : ""}${p.stories ? `, ${p.stories} ${p.stories === 1 ? "story" : "stories"}` : ""}${p.garageBays ? `, ${p.garageBays}-bay garage` : ""}

Must have:
${bullets(p.mustHaves)}

Nice to have:
${bullets(p.niceToHaves)}
${p.rooms?.length ? `\nRooms:\n${p.rooms.map((r) => `- ${r.name}${r.notes ? `: ${r.notes}` : ""}`).join("\n")}\n` : ""}
## Style
- Words: ${b.style.words.join(", ")}
- Materials: ${b.style.materials?.join(", ") || "open"}
- Avoid: ${b.style.avoid?.join(", ") || "nothing stated"}${b.style.references?.length ? `\n- References: ${b.style.references.join("; ")}` : ""}

## Budget and timeline
- Budget: ${budget} (${b.budget.confidence ?? "unknown"})
- Timeline: ${b.timeline ?? "not stated"}

## Assumptions to confirm
${bullets(b.assumptions)}

## Open questions
${bullets(b.openQuestions)}
`;
}
