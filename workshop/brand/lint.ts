// Checks markdown against the Eden writing rules. Errors block; warnings need a fix or a stated reason.
export type LintResult = { errors: string[]; warnings: string[] };

const CLERICAL = /\b(responsible for|duties include|was tasked with|in charge of|helped with|worked on)\b/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

export type Doc = { meta: Record<string, string>; body: string };

export function splitFrontMatter(md: string): Doc {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(md);
  if (!m) return { meta: {}, body: md };
  const meta: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: md.slice(m[0].length) };
}

export function lintDoc(md: string): LintResult {
  const { meta, body } = splitFrontMatter(md);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!meta.title) errors.push("Front matter needs a title (---\\ntitle: ...\\n---).");

  const lines = body.split(/\r?\n/);
  const words = body.replace(/[#>*_`|-]/g, " ").split(/\s+/).filter(Boolean).length;
  const h2 = lines.filter((l) => /^##\s+/.test(l)).map((l) => l.replace(/^##\s+/, ""));
  const hasSummary = h2.some((h) => /executive summary|summary|at a glance/i.test(h));

  // Bullets per list, tracked per section.
  let section = "Introduction", run = 0;
  const flush = () => { if (run > 3) warnings.push(`"${section}" has ${run} bullets in one list. More than 3 is too long: synthesise to 3 high-impact bullets, or use a table for data.`); run = 0; };
  let para: string[] = [];
  const flushPara = () => {
    const text = para.join(" ").trim();
    if (text && !text.startsWith("|") && text.split(/\s+/).length > 60) warnings.push(`"${section}" has a ${text.split(/\s+/).length}-word paragraph. Key sections are 3 to 4 lines: cut or break it up.`);
    para = [];
  };
  for (const l of lines) {
    if (/^#{1,3}\s+/.test(l)) { flush(); flushPara(); if (/^##\s+/.test(l)) section = l.replace(/^##\s+/, ""); continue; }
    if (/^\s*([-*]|\d+\.)\s+/.test(l)) { flushPara(); run++; continue; }
    if (l.trim() === "") { flush(); flushPara(); continue; }
    if (run) flush();
    para.push(l);
  }
  flush(); flushPara();

  if (words > 450 && !hasSummary) warnings.push(`${words} words with no summary section. Larger documents need an executive summary (a "## Executive summary" heading) at the front.`);
  if (words > 450 && !/pagebreak/.test(body) && h2.length > 2) warnings.push("Long document with no page breaks. Add <!-- pagebreak --> where sections are divisible.");
  const clerical = body.match(CLERICAL);
  if (clerical) warnings.push(`Clerical phrasing ("${clerical[0]}"). Lead with the result and its impact instead of describing duties.`);
  if (EMOJI.test(md)) warnings.push("Emoji found. The Eden look is restrained: remove them.");
  const firstPara = lines.find((l) => l.trim() && !/^#/.test(l));
  if (firstPara && /^(this document|in this document|the purpose of)/i.test(firstPara.trim())) warnings.push("Opens with throat-clearing. Result first: state the outcome or decision in the opening line.");
  return { errors, warnings };
}
