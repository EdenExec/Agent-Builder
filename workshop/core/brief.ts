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
const cell = (s: string) => s.replace(/\|/g, "/").replace(/\s+/g, " ").trim();
const table = (head: [string, string], rows: [string, string | undefined][]) => {
  const kept = rows.filter(([, v]) => v !== undefined && v !== "");
  return `| ${head[0]} | ${head[1]} |\n|---|---|\n${kept.map(([k, v]) => `| ${cell(k)} | ${cell(v!)} |`).join("\n")}\n`;
};
const listTable = (head: string, xs?: string[]) => `| ${head} |\n|---|\n${(xs?.length ? xs : ["None"]).map((x) => `| ${cell(x)} |`).join("\n")}\n`;

/** Review copy in the Eden format: result first, facts in tables, front matter so `npm run doc` can brand it. */
export function renderBrief(b: Brief): string {
  const s = b.site, p = b.program;
  const budget = b.budget.low !== undefined && b.budget.high !== undefined ? `${usd(b.budget.low)} to ${usd(b.budget.high)}` : usd(b.budget.high ?? b.budget.low);
  const missing = missingFields(b);
  const size = `${p.type}, ${p.bedrooms} bed / ${p.bathrooms} bath${p.targetSqFt ? `, about ${p.targetSqFt.toLocaleString("en-US")} sq ft` : ""}${p.stories ? `, ${p.stories} ${p.stories === 1 ? "story" : "stories"}` : ""}${p.garageBays ? `, ${p.garageBays}-bay garage` : ""}`;
  const mn = Math.max(p.mustHaves?.length ?? 0, p.niceToHaves?.length ?? 0, 1);
  const wishRows = Array.from({ length: mn }, (_, i) => `| ${cell(p.mustHaves?.[i] ?? "")} | ${cell(p.niceToHaves?.[i] ?? "")} |`).join("\n");
  const rooms = p.rooms?.length ? `\n${table(["Room", "Notes"], p.rooms.map((r) => [r.name, r.notes ?? ""]))}` : "";
  return `---
title: ${b.project}
subtitle: Design brief, ${b.status}
---
## Summary

${size}, ${s.jurisdiction || "jurisdiction not set"}, budget ${budget} (${b.budget.confidence ?? "unknown"}). Audience: ${b.audience}. Status: **${b.status}**.${missing.length ? `\n\n**Incomplete.** Missing: ${missing.join(", ")}.` : ""}

## Assumptions to confirm

${table(["#", "Assumption"], (b.assumptions ?? []).length ? b.assumptions.map((a, i) => [String(i + 1), a] as [string, string]) : [["", "None stated"]])}
## Site

${table(["Item", "Detail"], [["Jurisdiction", s.jurisdiction], ["Address", s.address], ["Lot", s.lotSizeSqFt ? `${s.lotSizeSqFt.toLocaleString("en-US")} sq ft${s.lotDims ? ` (${s.lotDims})` : ""}` : undefined], ["Orientation", s.orientationNotes], ["Slope", s.slopeNotes], ["Views", s.views], ["Utilities", s.utilities], ["Constraints", s.constraints?.join("; ")]])}
## Programme

${table(["Item", "Detail"], [["Type", p.type], ["Bedrooms / bathrooms", `${p.bedrooms} / ${p.bathrooms}`], ["Target size", p.targetSqFt ? `${p.targetSqFt.toLocaleString("en-US")} sq ft` : undefined], ["Stories", p.stories ? String(p.stories) : undefined], ["Garage", p.garageBays ? `${p.garageBays} bays` : undefined]])}
| Must have | Nice to have |
|---|---|
${wishRows}
${rooms}
## Style

${table(["Item", "Detail"], [["Words", b.style.words.join(", ")], ["Materials", b.style.materials?.join(", ") || "open"], ["Avoid", b.style.avoid?.join(", ") || "nothing stated"], ["References", b.style.references?.join("; ")]])}
## Budget and timeline

${table(["Item", "Detail"], [["Budget", `${budget} (${b.budget.confidence ?? "unknown"})`], ["Timeline", b.timeline ?? "not stated"]])}
## Open questions

${listTable("Question", b.openQuestions)}`;
}
