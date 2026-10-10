// Markdown -> an Eden-branded HTML document: white page, Montserrat, bold headers, cover page,
// table of contents for larger documents, page breaks, header and footer on every printed page.
import { fontFaceCss, FONT_STACK, identity } from "./eden.ts";
import { splitFrontMatter } from "./lint.ts";

export const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(s: string): string {
  let t = escHtml(s);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return t;
}
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Heading = { level: number; text: string; id: string };

export function renderDocBody(body: string): { html: string; headings: Heading[]; words: number } {
  const lines = body.split(/\r?\n/);
  const out: string[] = [];
  const headings: Heading[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i]!;
    if (!l.trim()) { i++; continue; }
    if (/^\s*<!--\s*pagebreak\s*-->\s*$/i.test(l)) { out.push('<div class="pagebreak"></div>'); i++; continue; }
    const h = /^(#{1,3})\s+(.*)$/.exec(l);
    if (h) {
      const level = h[1]!.length, text = h[2]!.trim();
      let id = slugify(text) || `s${headings.length}`;
      if (headings.some((x) => x.id === id)) id += `-${headings.length}`;
      headings.push({ level, text, id });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++; continue;
    }
    if (/^---+\s*$/.test(l)) { out.push("<hr>"); i++; continue; }
    if (/^\|/.test(l) && /^\|?\s*:?-{2,}/.test(lines[i + 1] ?? "")) {
      const cells = (r: string) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(l); i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\|/.test(lines[i]!)) { rows.push(cells(lines[i]!)); i++; }
      out.push(`<div class="tw"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    const li = /^\s*(?:([-*])|(\d+)\.)\s+(.*)$/.exec(l);
    if (li) {
      const ordered = Boolean(li[2]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = /^\s*(?:([-*])|(\d+)\.)\s+(.*)$/.exec(lines[i]!);
        if (!m || Boolean(m[2]) !== ordered) break;
        items.push(m[3]!); i++;
      }
      out.push(`<${ordered ? "ol" : "ul"}>${items.map((x) => `<li>${inline(x)}</li>`).join("")}</${ordered ? "ol" : "ul"}>`);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i]!.trim() && !/^(#{1,3}\s|\s*([-*]|\d+\.)\s|\||---+\s*$|\s*<!--)/.test(lines[i]!)) { para.push(lines[i]!.trim()); i++; }
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    else i++;
  }
  return { html: out.join("\n"), headings, words: body.split(/\s+/).filter(Boolean).length };
}

const cssStr = (t: string) => t.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, " ");

export type DocOptions = { cover?: boolean };

export function renderDoc(md: string, opts: DocOptions = {}): string {
  const { meta, body } = splitFrontMatter(md);
  const title = meta.title ?? "Untitled";
  // `org: kdtw` in the front matter puts KDTW Group on a home, family or non-recruiting document.
  const { name: NAME, site: SITE } = identity(meta.org);
  const { html, headings, words } = renderDocBody(body);
  const h2s = headings.filter((h) => h.level === 2);
  const cover = opts.cover ?? (meta.cover ? meta.cover !== "false" : words > 450 || h2s.length > 5);
  const toc = h2s.length >= 5 && meta.toc !== "false";
  const date = meta.date ?? "";
  // `compact: true` in the front matter tightens type and spacing so a one-to-two page brief stays on two pages.
  const compact = meta.compact === "true"
    ? "body{font-size:9.5pt;line-height:1.45}h1{font-size:20pt}h2{font-size:12pt;margin:16px 0 6px;padding-top:6px}p{margin:0 0 6px}ul,ol{margin:0 0 6px}li{margin:0 0 2px}.tw{margin:6px 0 8px}table{font-size:8.5pt}th{padding:4px 8px}td{padding:4px 8px}@page{margin:20mm 18mm 18mm}"
    : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(title)}</title>
<style>
${fontFaceCss()}
@page{size:Letter;margin:24mm 20mm 22mm;@top-left{content:"${NAME}";font:700 8pt ${FONT_STACK};letter-spacing:.06em;color:#111;border-bottom:1px solid #111;width:45%;vertical-align:bottom;padding-bottom:3mm;white-space:nowrap}@top-right{content:"${cssStr(title)}";font:italic 600 8pt ${FONT_STACK};color:#111;border-bottom:1px solid #111;width:55%;text-align:right;vertical-align:bottom;padding-bottom:3mm;white-space:nowrap;overflow:hidden}@bottom-left{content:"${SITE}";font:400 8pt ${FONT_STACK};color:#5a5a5a}@bottom-right{content:"${NAME}";font:700 8pt ${FONT_STACK};color:#5a5a5a}}
${cover ? "@page:first{@top-left{content:none;border:0}@top-right{content:none;border:0}@bottom-left{content:none}@bottom-right{content:none}}" : ""}
*{box-sizing:border-box}
html{background:#fff}
body{margin:0 auto;max-width:820px;background:#fff;color:#111;font:400 11pt/1.6 ${FONT_STACK};padding:0 24px 80px}
@media print{body{max-width:none;padding:0}header.screen{display:none}}
header.screen{padding:28px 0 14px;border-bottom:1px solid #111;margin-bottom:28px}
header.screen b{display:block;font-weight:700;letter-spacing:.04em}
header.screen i{font-weight:600;font-size:.9em}
h1{font-weight:700;font-size:26pt;line-height:1.15;margin:0 0 6px;letter-spacing:-.01em}
h2{font-weight:700;font-size:15pt;margin:34px 0 8px;padding-top:10px;border-top:1px solid #d9d6ce}
h3{font-weight:700;font-size:11.5pt;margin:20px 0 4px}
p{margin:0 0 10px;max-width:68ch}
ul,ol{margin:0 0 12px;padding-left:20px;max-width:68ch}li{margin:0 0 4px}
.tw{overflow-x:auto;margin:10px 0 16px}
table{border-collapse:collapse;width:100%;font-size:10pt}
th{text-align:left;font-weight:700;border-bottom:2px solid #111;padding:8px 10px}
td{border-bottom:1px solid #d9d6ce;padding:8px 10px;vertical-align:top}
tr{page-break-inside:avoid}
hr{border:0;border-top:1px solid #d9d6ce;margin:22px 0}
a{color:#111}code{font-size:.9em;background:#f0ede6;padding:1px 4px}
.pagebreak{break-after:page;page-break-after:always;height:0}
h2,h3{break-after:avoid}
.cover{min-height:92vh;display:flex;flex-direction:column;justify-content:space-between;break-after:page;page-break-after:always;padding:40px 0 20px}
.cover .org{font-weight:700;letter-spacing:.06em;font-size:11pt}
.cover h1{font-size:34pt;margin-top:22vh;max-width:14ch}
.cover .sub{font-weight:600;font-style:italic;font-size:13pt;margin:8px 0 0}
.cover .meta{font-size:9.5pt;color:#5a5a5a;display:flex;justify-content:space-between;border-top:1px solid #111;padding-top:10px}
.toc{break-after:page;page-break-after:always;padding-top:20px}
.toc ol{list-style:none;padding:0}.toc li{display:flex;gap:12px;border-bottom:1px solid #d9d6ce;padding:8px 0;font-weight:600}
.toc a{text-decoration:none}
${compact}
</style></head><body>
${cover
    ? `<section class="cover"><div class="org">${NAME}</div><div><h1>${escHtml(title)}</h1>${meta.subtitle ? `<p class="sub">${escHtml(meta.subtitle)}</p>` : ""}</div><div class="meta"><span>${escHtml([meta.author, date].filter(Boolean).join(" · "))}</span><span>${SITE}</span></div></section>`
    : `<header class="screen"><b>${NAME}</b><i>${escHtml(title)}</i></header><h1>${escHtml(title)}</h1>${meta.subtitle ? `<p><i>${escHtml(meta.subtitle)}</i></p>` : ""}`}
${toc ? `<nav class="toc"><h2 style="border:0;margin-top:0">Contents</h2><ol>${h2s.map((h) => `<li><a href="#${h.id}">${inline(h.text)}</a></li>`).join("")}</ol></nav>` : ""}
${html}
</body></html>
`;
}
