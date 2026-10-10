import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lintDoc, splitFrontMatter } from "./lint.ts";
import { renderDoc, renderDocBody, escHtml } from "./doc.ts";
import { tokenCss, TOKENS, ALL_HEX, FONT_STACK } from "./eden.ts";

const good = `---
title: Lakeside Infill: Planning Summary
subtitle: Programme and zoning
---
## Executive summary

A 3,800 sq ft two-story home fits the lot with 6 ft to spare on the west setback (unverified).

- Courtyard plan wins on privacy
- Garage moves to the street side
- Survey is the only blocker

## Areas

| Room | Area |
|---|---|
| Great room | 520 sq ft |
| Kitchen | 280 sq ft |
`;

describe("lint", () => {
  test("a compliant document has no errors or warnings", () => {
    assert.deepEqual(lintDoc(good), { errors: [], warnings: [] });
  });
  test("requires a title", () => assert.match(lintDoc("## Hi\ntext").errors[0]!, /title/));
  test("flags lists over 3 bullets, naming the section", () => {
    const w = lintDoc("---\ntitle: T\n---\n## Scope\n- a\n- b\n- c\n- d\n").warnings;
    assert.match(w[0]!, /"Scope" has 4 bullets/);
    assert.equal(lintDoc("---\ntitle: T\n---\n## Scope\n- a\n- b\n- c\n\ntext\n\n- d\n").warnings.length, 0, "separate lists of 3 and 1 are fine");
  });
  test("flags clerical tone, throat-clearing, emoji and long paragraphs", () => {
    const long = Array(70).fill("word").join(" ");
    const w = lintDoc(`---\ntitle: T\n---\nThis document describes things. Responsible for scheduling 🎉\n\n## A\n${long}\n`).warnings.join("|");
    assert.match(w, /Clerical/);
    assert.match(w, /throat-clearing/);
    assert.match(w, /Emoji/);
    assert.match(w, /70-word paragraph/);
  });
  test("long documents need a summary and page breaks", () => {
    const filler = Array(480).fill("word").join(" ").replace(/(word ){12}/g, "$&\n\n");
    const w = lintDoc(`---\ntitle: T\n---\n## One\n${filler}\n## Two\nx\n## Three\ny\n`).warnings.join("|");
    assert.match(w, /no summary/);
    assert.match(w, /page breaks/);
    assert.equal(lintDoc(`---\ntitle: T\n---\n## Executive summary\n${filler}\n## Two\nx\n## Three\ny\n<!-- pagebreak -->\n`).warnings.filter((x) => /summary|page breaks/.test(x)).length, 0);
  });
  test("front matter parsing", () => {
    assert.deepEqual(splitFrontMatter('---\ntitle: "A: B"\ncover: false\n---\nbody'), { meta: { title: "A: B", cover: "false" }, body: "body" });
    assert.deepEqual(splitFrontMatter("no front matter").meta, {});
  });
});

describe("render", () => {
  test("branded structure: Montserrat, name, footer, white page, table, no cover for a short doc", () => {
    const h = renderDoc(good);
    assert.match(h, /@font-face\{font-family:'Montserrat';font-style:normal;font-weight:100 900;[^}]*data:font\/woff2;base64,/);
    assert.match(h, /font-style:italic/);
    assert.doesNotMatch(h, /googleapis/, "documents are self-contained");
    assert.ok(h.includes(FONT_STACK));
    assert.match(h, /EDEN PARTNER GROUP/);
    assert.match(h, /edenpartnergroup\.com/);
    assert.match(h, /background:#fff/);
    assert.match(h, /<table>[\s\S]*<th>Room<\/th>/);
    assert.doesNotMatch(h, /<section class="cover">/);
    assert.doesNotMatch(h, /<nav class="toc">/);
  });
  test("cover and contents appear for larger documents and can be forced", () => {
    const many = "---\ntitle: Big\n---\n" + [1, 2, 3, 4, 5, 6].map((n) => `## S${n}\ntext\n`).join("\n");
    const h = renderDoc(many);
    assert.match(h, /<section class="cover">/);
    assert.match(h, /<nav class="toc">[\s\S]*href="#s1"/);
    assert.match(renderDoc(good, { cover: true }), /<section class="cover">/);
    assert.doesNotMatch(renderDoc(many, { cover: false }), /<section class="cover">/);
  });
  test("compact front matter tightens the layout and is off by default", () => {
    assert.match(renderDoc("---\ntitle: T\ncompact: true\n---\n## A\ntext\n"), /line-height:1\.45/);
    assert.doesNotMatch(renderDoc(good), /line-height:1\.45/);
  });
  test("escapes HTML, links only http(s), supports page breaks and inline styles", () => {
    const { html } = renderDocBody("<script>x</script> **bold** *it* [ok](https://a.co) [bad](javascript:alert(1))\n\n<!-- pagebreak -->\n\n1. one\n2. two\n");
    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /<strong>bold<\/strong>/);
    assert.match(html, /<em>it<\/em>/);
    assert.match(html, /href="https:\/\/a\.co"/);
    assert.doesNotMatch(html, /href="javascript/);
    assert.match(html, /class="pagebreak"/);
    assert.match(html, /<ol><li>one<\/li><li>two<\/li><\/ol>/);
    assert.equal(escHtml('<a "b">'), "&lt;a &quot;b&quot;&gt;");
  });
});

describe("tokens", () => {
  test("palette is black, white, cream and greys only, plus muted state colours", () => {
    const neutral = (hex: string) => { const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return Math.max(r, g, b) - Math.min(r, g, b) <= 24; };
    for (const k of ["bg", "card", "ink", "mute", "line", "soft", "accent", "accentInk"] as const) {
      assert.ok(neutral(TOKENS.light[k]) && neutral(TOKENS.dark[k]), `${k} must be a neutral`);
    }
    assert.equal(TOKENS.light.ink, "#111111");
    assert.equal(TOKENS.light.accent, "#111111", "primary action is black, not a brand colour");
  });
  test("css has the artifact theme structure", () => {
    const css = tokenCss();
    assert.match(css, /^:root\{/);
    assert.match(css, /prefers-color-scheme:dark/);
    assert.match(css, /:root\[data-theme="dark"\]/);
  });
  test("the Desk page mirrors the brand tokens and font", () => {
    const desk = readFileSync("workshop/desk/desk.html", "utf8").toLowerCase();
    for (const hex of [...Object.values(TOKENS.light), ...Object.values(TOKENS.dark)].map((h) => h.toLowerCase())) assert.ok(desk.includes(hex), `desk.html is missing ${hex}`);
    assert.ok(desk.includes("montserrat"));
    assert.ok(!/georgia|#c4491f|#ff8159/.test(desk), "old off-brand styling must be gone");
    assert.ok(ALL_HEX.length > 0);
  });
});
