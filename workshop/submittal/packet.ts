// The Eden submittal packet (Kev, 24 Oct 2026): cover page (Hannah's Hoffman overview, then the Must Do scorecard),
// the candidate's original resume, then references and screening notes. Workflow: projects/team-hub/submittal-packet/workflow.md.
// Client agnostic (standing rule, 8 Oct): nothing here names a client. Pay is on the page, marked current or desired (24 Oct).
import { readFileSync } from "node:fs";
import { NAME, SITE } from "../brand/eden.ts";

export type Basis = "current" | "desired";
export type Rating = "meets" | "partial" | "gap";
export type Packet = {
  candidate: { first: string; last: string; middle?: string; nicknames?: string[]; former_last?: string; title?: string; years?: number | string; linkedin?: string };
  role_submitted: string;
  pay: { basis: Basis; base?: string; bonus?: string; vehicle?: string; equity?: string; other?: string };
  current_location: string;
  /** States the candidate lived or worked in before, from the resume. The current state comes from current_location. */
  past_states?: string[];
  target_locations?: string;
  highlights: string | string[];
  start_availability: string;
  actively_interviewing: string;
  interview_availability?: string;
  concerns?: string;
  must_dos?: { item: string; rating: Rating; evidence?: string }[];
  /** Path to the original resume (.pdf, or .docx/.doc converted untouched). */
  resume?: string;
  references?: { name: string; relationship: string; title?: string; company?: string; contact?: string }[];
  references_consent?: boolean;
  screening?: { date: string; by: string; notes: string | string[] }[];
  transcript?: string;
  recruiter?: string;
  date?: string;
};

const NICK: Record<string, string[]> = {
  alexander: ["alex"], andrew: ["andy", "drew"], anthony: ["tony"], benjamin: ["ben"], charles: ["chuck", "charlie"], christopher: ["chris"],
  daniel: ["dan", "danny"], david: ["dave"], donald: ["don"], edward: ["ed", "eddie"], gregory: ["greg"], james: ["jim", "jimmy", "jamie"],
  jeffrey: ["jeff"], jonathan: ["jon"], john: ["jack", "johnny"], joseph: ["joe", "joey"], joshua: ["josh"], kenneth: ["ken", "kenny"],
  matthew: ["matt"], michael: ["mike"], nicholas: ["nick"], patrick: ["pat"], peter: ["pete"], raymond: ["ray"], richard: ["rick", "rich", "dick"],
  robert: ["rob", "bob", "bobby"], ronald: ["ron"], samuel: ["sam"], stephen: ["steve"], steven: ["steve"], thomas: ["tom", "tommy"],
  timothy: ["tim"], william: ["will", "bill", "billy"], zachary: ["zach"], elizabeth: ["liz", "beth"], jennifer: ["jen", "jenny"],
  katherine: ["kate", "katie"], kathryn: ["kate", "katie"], margaret: ["maggie", "meg"], rebecca: ["becky"], susan: ["sue"], victoria: ["tori"],
};
const FORMAL: Record<string, string> = Object.fromEntries(Object.entries(NICK).flatMap(([f, ns]) => ns.map((n) => [n, f])));

const STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska",
  NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
  UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/** "TX", "Texas", "Houston, TX" or "Louisiana" -> the state spelled out; anything else is kept as given. */
export function stateName(s: string): string {
  const t = s.trim(), tail = t.split(",").pop()!.trim();
  if (STATES[tail.toUpperCase()]) return STATES[tail.toUpperCase()]!;
  const full = Object.values(STATES).find((n) => n.toLowerCase() === tail.toLowerCase());
  return full ?? t;
}

/** Name variations for the first-pass search: formal and nicknames, middle initial, former surname, reversed. Six at most. */
export function nameVariants(c: Packet["candidate"]): string[] {
  const first = cap(c.first.trim()), last = c.last.trim(), low = first.toLowerCase();
  const firsts = new Set([first, ...(c.nicknames ?? []).map(cap)]);
  const formal = FORMAL[low]; if (formal) firsts.add(cap(formal));
  for (const n of NICK[low] ?? []) firsts.add(cap(n));
  const out = [...firsts].map((f) => `${f} ${last}`);
  if (c.middle) out.splice(1, 0, `${first} ${c.middle.trim().charAt(0).toUpperCase()} ${last}`);
  if (c.former_last) out.push(`${first} ${c.former_last.trim()}`);
  out.push(`${last}, ${first}`);
  return [...new Set(out)].slice(0, 6);
}

/** Kev, 24 Oct: name variations AND location, the current state plus every state the candidate lived or worked in before. */
export function searchStates(p: Pick<Packet, "current_location" | "past_states">): string[] {
  return [...new Set([p.current_location, ...(p.past_states ?? [])].filter(Boolean).map(stateName))].slice(0, 6);
}
export function googleQuery(p: Pick<Packet, "candidate" | "current_location" | "past_states">): string {
  const or = (xs: string[]) => `(${xs.map((x) => `"${x}"`).join(" OR ")})`;
  const states = searchStates(p);
  return states.length ? `${or(nameVariants(p.candidate))} ${or(states)}` : or(nameVariants(p.candidate));
}
export const googleLink = (p: Pick<Packet, "candidate" | "current_location" | "past_states">) => `https://www.google.com/search?q=${encodeURIComponent(googleQuery(p))}`;

/** What must be on a packet before it goes to Kev. Empty means ready for his review. */
export function checkPacket(p: Packet): string[] {
  const miss: string[] = [];
  if (!p.candidate?.first || !p.candidate?.last) miss.push("Candidate name");
  if (!p.role_submitted) miss.push("Role submitted");
  if (p.pay?.basis !== "current" && p.pay?.basis !== "desired") miss.push('Pay marked "current" or "desired"');
  if (!p.pay?.base) miss.push("Base pay");
  if (!p.current_location) miss.push("Current location");
  if (!p.start_availability) miss.push("Start availability");
  if (!p.actively_interviewing) miss.push("Actively interviewing");
  if (!p.concerns) miss.push('Concerns (write "None known" only if true)');
  const md = p.must_dos ?? [];
  if (md.length < 7 || md.length > 10) miss.push(`Must Dos: ${md.length} on the scorecard, 7 to 10 expected`);
  md.forEach((m, i) => { if (!m.evidence) miss.push(`Must Do ${i + 1}: one line of evidence`); });
  if ((p.references ?? []).length && p.references_consent !== true) miss.push("Candidate's consent to list references");
  if (!p.resume) miss.push("Original resume");
  return miss;
}

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
const lines = (v?: string | string[]) => (Array.isArray(v) ? v : v ? [v] : []);
const RATING: Record<Rating, string> = { meets: "Meets", partial: "Partial", gap: "Gap" };
export const CONSENT = "Please do not contact references without the candidate's clear consent.";

export function scoreLine(md: NonNullable<Packet["must_dos"]>): string {
  const n = (r: Rating) => md.filter((m) => m.rating === r).length;
  const parts = [`${n("meets")} of ${md.length} met`];
  if (n("partial")) parts.push(`${n("partial")} partial`);
  if (n("gap")) parts.push(`${n("gap")} gap`);
  return parts.join(" · ");
}

const CSS = `@page{size:Letter;margin:0.6in 0.65in}
*{box-sizing:border-box}html,body{margin:0;background:#fff;color:#111}
body{font:400 10.5px/1.5 'Montserrat','Helvetica Neue',Arial,sans-serif;letter-spacing:0}
.page{break-after:page;display:flex;flex-direction:column;min-height:9.75in}.page:last-child{break-after:auto}
header{border-bottom:1px solid #111;padding-bottom:7px;margin-bottom:22px}
.org{font-size:8.5px;font-weight:600;letter-spacing:.12em}.doc{font-size:13px;font-weight:700;font-style:italic;margin-top:3px}
h1{font-size:26px;font-weight:800;margin:0;line-height:1.15}.sub{font-size:11.5px;color:#5A5A5A;margin:4px 0 18px}
h2{font-size:8.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin:20px 0 6px;color:#111}
table{width:100%;border-collapse:collapse}td,th{padding:6px 8px 6px 0;border-bottom:1px solid #D9D6CE;vertical-align:top;text-align:left}
.ov td.k{width:30%;font-size:8.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#5A5A5A;padding-top:8px}
.ov td.v{font-size:10.5px}.ov ul{margin:0;padding-left:15px}
.tag{display:inline-block;font-size:7.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:1px solid #111;padding:1px 5px;margin-right:6px;vertical-align:1px}
th{font-size:7.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#5A5A5A}
.sc td{font-size:10px}.sc td.n{width:22px;color:#5A5A5A}.sc td.r{width:70px}
.pill{display:inline-block;font-size:7.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:2px 6px;border:1px solid}
.meets{color:#3D6B4F;border-color:#3D6B4F}.partial{color:#7A5A1C;border-color:#7A5A1C}.gap{color:#8A3A32;border-color:#8A3A32}
.score{font-size:11px;font-weight:700;margin:0 0 4px}
a{color:#111}.muted{color:#5A5A5A}
.consent{border:1.5px solid #111;padding:9px 12px;font-weight:600;margin:0 0 16px}
.note p{margin:0 0 6px}.note .when{font-size:8.5px;color:#5A5A5A;letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}
pre{white-space:pre-wrap;font:400 9.5px/1.5 'Montserrat',sans-serif;margin:0}
footer{margin-top:auto;padding-top:10px;border-top:1px solid #D9D6CE;display:flex;justify-content:space-between;font-size:7.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#5A5A5A}`;

/**
 * Static Montserrat weights (@fontsource/montserrat 5.1.0, SIL OFL), not the brand's variable font: Chromium prints a
 * variable font as Type 3 "Montserrat-Thin", which the paper rules forbid (no Type 3, never Thin).
 */
const WEIGHTS = ["400-normal", "600-normal", "700-normal", "800-normal", "700-italic"];
let faces: string | undefined;
function faceCss(): string {
  return (faces ??= WEIGHTS.map((w) => {
    const [weight, style] = w.split("-");
    const b64 = readFileSync(new URL(`./fonts/montserrat-latin-${w}.woff2`, import.meta.url)).toString("base64");
    return `@font-face{font-family:'Montserrat';font-style:${style};font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
  }).join("\n"));
}

function shell(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${faceCss()}\n${CSS}</style></head><body>${body}</body></html>`;
}
const head = (role: string) => `<header><div class="org">${NAME}</div><div class="doc">Candidate submittal · ${esc(role)}</div></header>`;
const foot = (extra = "Confidential") => `<footer><span>${SITE}</span><span>${esc(extra)}</span><span>${NAME}</span></footer>`;

export function fullName(c: Packet["candidate"]): string {
  return [c.first, c.middle, c.last].filter(Boolean).join(" ");
}

/** Page 1: the overview in Hannah's order, then the Must Do scorecard. */
export function coverHtml(p: Packet): string {
  const c = p.candidate, pay = p.pay, basis = pay.basis === "current" ? "Current" : "Desired";
  const pkg = ([["Bonus", pay.bonus], ["Vehicle", pay.vehicle], ["ESOP / ownership / golden handcuffs", pay.equity], ["Other", pay.other]] as const)
    .filter(([, v]) => v).map(([k, v]) => `${k}: ${esc(v)}`).join("<br>");
  const exp = [c.title, c.years ? `${c.years} years` : ""].filter(Boolean).join(" · ");
  const hl = lines(p.highlights);
  const states = searchStates(p);
  const row = (k: string, v: string) => (v ? `<tr><td class="k">${k}</td><td class="v">${v}</td></tr>` : "");
  const ov = [
    row("Candidate name", esc(fullName(c)) + (c.linkedin ? ` · <a href="${esc(c.linkedin)}">LinkedIn</a>` : "")),
    row("Salary expectations", `<span class="tag">${basis}</span>Base ${esc(pay.base ?? "to confirm")}`),
    row("Package", pkg ? `<span class="tag">${basis}</span>${pkg}` : ""),
    row("Role submitted", esc(p.role_submitted)),
    row("Experience", esc(exp)),
    row("Current location", esc(p.current_location)),
    row("Target project locations", esc(p.target_locations)),
    row("Experience highlights", hl.length > 1 ? `<ul>${hl.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : esc(hl[0])),
    row("Start availability", esc(p.start_availability)),
    row("Actively interviewing", esc(p.actively_interviewing)),
    row("Interview availability", esc(p.interview_availability)),
    row("Concerns", esc(p.concerns)),
    row("First-pass search", `<a href="${googleLink(p)}">Google: name variations in ${esc(states.join(", ") || "all locations")}</a><div class="muted" style="font-size:8.5px">Public search only, a first pass, not a background check.</div>`),
  ].join("");
  const md = p.must_dos ?? [];
  const sc = md.length
    ? `<h2>Pre-screen scorecard · the role's Must Dos</h2><p class="score">${scoreLine(md)}</p><table class="sc"><tr><th></th><th>Must Do</th><th>Match</th><th>Evidence from our screen</th></tr>${md
        .map((m, i) => `<tr><td class="n">${i + 1}</td><td>${esc(m.item)}</td><td class="r"><span class="pill ${m.rating}">${RATING[m.rating]}</span></td><td>${esc(m.evidence)}</td></tr>`)
        .join("")}</table>`
    : "";
  return `<section class="page">${head(p.role_submitted)}<h1>${esc(fullName(c))}</h1><div class="sub">${esc(p.role_submitted)}${p.date ? ` · ${esc(p.date)}` : ""}</div><h2>Overview</h2><table class="ov">${ov}</table>${sc}${foot()}</section>`;
}

/** The last page: references (consent line first), then screening notes and the transcript. */
export function backHtml(p: Packet): string {
  const refs = p.references ?? [];
  const refTable = refs.length
    ? `<table><tr><th>Reference</th><th>Relationship</th><th>Title and company</th><th>Contact</th></tr>${refs
        .map((r) => `<tr><td>${esc(r.name)}</td><td>${esc(r.relationship)}</td><td>${esc([r.title, r.company].filter(Boolean).join(", "))}</td><td>${esc(r.contact ?? "On request, with consent")}</td></tr>`)
        .join("")}</table>`
    : `<p class="muted">References available on request, with the candidate's consent.</p>`;
  const notes = (p.screening ?? []).map((s) => `<div class="note"><div class="when">${esc(s.date)} · ${esc(s.by)}</div>${lines(s.notes).map((n) => `<p>${esc(n)}</p>`).join("")}</div>`).join("");
  return `<section class="page">${head(p.role_submitted)}<h1>${esc(fullName(p.candidate))}</h1><div class="sub">References and screening notes</div><h2>References</h2><div class="consent">${esc(CONSENT)}</div>${refTable}${notes ? `<h2>Screening notes</h2>${notes}` : ""}${p.transcript ? `<h2>From the screening call</h2><pre>${esc(p.transcript)}</pre>` : ""}${foot()}</section>`;
}

export const coverDoc = (p: Packet) => shell(`${fullName(p.candidate)} · Candidate submittal`, coverHtml(p));
export const backDoc = (p: Packet) => shell(`${fullName(p.candidate)} · References and screening notes`, backHtml(p));
export const fileBase = (p: Packet) => `${p.candidate.last}, ${p.candidate.first} - Eden Submittal - ${p.role_submitted}`.replace(/[\/\\:*?"<>|]/g, "-");
