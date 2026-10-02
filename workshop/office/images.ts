// `npm run images -- "warm minimal kitchen" [--count 8] [--providers openverse,pexels] [--orientation landscape] [--json]`
import "../lib/env.ts";
import { searchImages, type ProviderName } from "../sources/index.ts";
import type { Orientation } from "../sources/types.ts";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const query = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && !(all[i - 1] ?? "").startsWith("--")).join(" ").trim();
  if (!query) {
    console.error('usage: npm run images -- "query" [--count N] [--providers a,b] [--orientation landscape|portrait|squarish] [--json]');
    process.exitCode = 2;
    return;
  }
  const count = Number(arg("count") ?? 8);
  const providers = arg("providers")?.split(",").map((p) => p.trim()) as ProviderName[] | undefined;
  const orientation = arg("orientation") as Orientation | undefined;
  const { candidates, errors } = await searchImages(query, { count, providers, orientation });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ query, candidates, errors }, null, 2));
    return;
  }
  for (const c of candidates) {
    console.log(`[${c.provider}] ${c.title.slice(0, 60)}${c.width && c.height ? ` (${c.width}x${c.height})` : ""}`);
    console.log(`    ${c.license}${c.commercialOk ? "" : "  (NOT commercial-ok)"} - ${c.attribution}`);
    console.log(`    ${c.pageUrl}`);
  }
  for (const e of errors) console.error(`! ${e.provider}: ${e.message}`);
  console.log(`\n${candidates.length} candidate(s), ${errors.length} provider error(s).`);
  process.exitCode = candidates.length ? 0 : 1;
}

main().catch((err) => { console.error(err); process.exitCode = 2; });
