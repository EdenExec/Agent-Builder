// Carries workshop/core/office-game.js into the Office page. One source of truth: the page holds a generated copy between two markers.
export const START = "/* GAME-CORE:START generated from workshop/core/office-game.js by `npm run office -- build-page`. Do not edit here. */";
export const END = "/* GAME-CORE:END */";

/** The module source as a page-safe closure: `export` removed, the exported names returned under `name` (`Game` for the game core). */
export function buildGameBlock(src: string, name = "Game"): string {
  const names = [...src.matchAll(/^export (?:var|const|function) ([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]!);
  if (!names.length) throw new Error("module exports nothing");
  const body = src.replace(/^export (var|const|function) /gm, "$1 ").trimEnd();
  return `var ${name} = (function () {\n${body}\nreturn { ${names.map((n) => `${n}: ${n}`).join(", ")} };\n})();`;
}

export function injectGameBlock(html: string, block: string): string {
  const a = html.indexOf(START), b = html.indexOf(END);
  if (a < 0 || b < a) throw new Error("GAME-CORE markers not found in the page");
  return html.slice(0, a) + START + "\n" + block + "\n" + html.slice(b);
}

/** The block currently in the page, or null. */
export function currentGameBlock(html: string): string | null {
  const a = html.indexOf(START), b = html.indexOf(END);
  return a < 0 || b < a ? null : html.slice(a + START.length + 1, b - 1);
}

// The projects core (workshop/core/office-projects.js) rides in the page the same way, between its own markers, as `Proj`.
export const PROJ_START = "/* PROJECTS-CORE:START generated from workshop/core/office-projects.js by `npm run office -- build-page`. Do not edit here. */";
export const PROJ_END = "/* PROJECTS-CORE:END */";
export const buildProjectsBlock = (src: string) => buildGameBlock(src, "Proj");
export function injectProjectsBlock(html: string, block: string): string {
  const a = html.indexOf(PROJ_START), b = html.indexOf(PROJ_END);
  if (a < 0 || b < a) throw new Error("PROJECTS-CORE markers not found in the page");
  return html.slice(0, a) + PROJ_START + "\n" + block + "\n" + html.slice(b);
}
export function currentProjectsBlock(html: string): string | null {
  const a = html.indexOf(PROJ_START), b = html.indexOf(PROJ_END);
  return a < 0 || b < a ? null : html.slice(a + PROJ_START.length + 1, b - 1);
}
