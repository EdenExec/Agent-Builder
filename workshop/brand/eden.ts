// Eden Partner Group visual identity as code. Source: docs/brand/eden-visual-identity.pdf
// Every generated page imports from here, so the brand lives in one place.

import { readFileSync } from "node:fs";

export const FONT_LINK = "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&display=swap";
export const FONT_STACK = `'Montserrat','Helvetica Neue',Arial,sans-serif`;
export const SITE = "edenpartnergroup.com";
export const NAME = "EDEN PARTNER GROUP";

/**
 * Which name a page carries (Kev, 10 October 2026): Eden Partner Group for recruiting, clients and candidates;
 * KDTW Group for home, family and every project not focused on recruiting. Same visual system for both.
 * KDTW Group has no public site, so its footer carries the name only.
 */
export type Org = "eden" | "kdtw";
export const IDENTITY: Record<Org, { name: string; site: string }> = {
  eden: { name: NAME, site: SITE },
  kdtw: { name: "KDTW GROUP", site: "" },
};
export function identity(org?: string): { name: string; site: string } {
  return org === "kdtw" ? IDENTITY.kdtw : IDENTITY.eden;
}

/** Light: cream and white with black lettering. Dark: matte, industrial. Semantic colours are muted and used only for state. */
export const TOKENS = {
  light: { bg: "#FAF8F3", card: "#FFFFFF", ink: "#111111", mute: "#5A5A5A", line: "#D9D6CE", soft: "#F0EDE6", accent: "#111111", accentInk: "#FFFFFF", pos: "#3D6B4F", neg: "#8A3A32", warn: "#7A5A1C" },
  dark: { bg: "#151515", card: "#1D1D1C", ink: "#F2F0EA", mute: "#A3A09A", line: "#2F2F2D", soft: "#232321", accent: "#F2F0EA", accentInk: "#111111", pos: "#7DB391", neg: "#D4857B", warn: "#D2A95C" },
} as const;

type Palette = Record<keyof typeof TOKENS.light, string>;
const decl = (p: Palette) => `--bg:${p.bg};--card:${p.card};--ink:${p.ink};--mute:${p.mute};--line:${p.line};--soft:${p.soft};--accent:${p.accent};--accent-ink:${p.accentInk};--pos:${p.pos};--neg:${p.neg};--warn:${p.warn}`;

/** Token CSS with the theme structure artifacts require: light on :root, dark via media query and explicit data-theme. */
export function tokenCss(): string {
  return `:root{${decl(TOKENS.light)};--font:${FONT_STACK};color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${decl(TOKENS.dark)};color-scheme:dark}}
:root[data-theme="dark"]{${decl(TOKENS.dark)};color-scheme:dark}`;
}

/** Hex values used by the Desk page's copy of the tokens, for the drift test. */
export const ALL_HEX = [...Object.values(TOKENS.light), ...Object.values(TOKENS.dark)].map((h) => h.toLowerCase());

let faceCache: string | undefined;
/**
 * Montserrat (SIL Open Font License) bundled in workshop/brand/fonts and embedded as data: URIs, so documents,
 * PDFs and boards always render in the mandatory brand font, offline and without a network fetch.
 * The files are the variable-weight Latin subsets from Google Fonts.
 */
export function fontFaceCss(): string {
  if (faceCache) return faceCache;
  const face = (style: "normal" | "italic") => {
    const b64 = readFileSync(new URL(`./fonts/montserrat-${style}.woff2`, import.meta.url)).toString("base64");
    return `@font-face{font-family:'Montserrat';font-style:${style};font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
  };
  return (faceCache = `${face("normal")}\n${face("italic")}`);
}
