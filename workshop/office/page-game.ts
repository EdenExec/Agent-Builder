// Carries workshop/core/office-game.js into the Office page. One source of truth: the page holds a generated copy between two markers.
export const START = "/* GAME-CORE:START generated from workshop/core/office-game.js by `npm run office -- build-page`. Do not edit here. */";
export const END = "/* GAME-CORE:END */";

/** The module source as a page-safe closure: `export` removed, the exported names returned as `Game`. */
export function buildGameBlock(src: string): string {
  const names = [...src.matchAll(/^export (?:var|const|function) ([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]!);
  if (!names.length) throw new Error("office-game.js exports nothing");
  const body = src.replace(/^export (var|const|function) /gm, "$1 ").trimEnd();
  return `var Game = (function () {\n${body}\nreturn { ${names.map((n) => `${n}: ${n}`).join(", ")} };\n})();`;
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
