// One call, every configured provider, partial failure tolerated.
import { openverse } from "./openverse.ts";
import { wikimedia } from "./wikimedia.ts";
import { unsplash } from "./unsplash.ts";
import { pexels } from "./pexels.ts";
import type { ImageCandidate, ImageSource, ProviderName, SearchOptions } from "./types.ts";

export type { ImageCandidate, ImageSource, ProviderName, SearchOptions } from "./types.ts";

export const SOURCES: readonly ImageSource[] = [openverse, wikimedia, unsplash, pexels];

export function getSource(name: string): ImageSource | undefined {
  return SOURCES.find((s) => s.name === name);
}

/** Providers whose key (if any) is present in the environment. */
export function configuredSources(env: NodeJS.ProcessEnv = process.env): ImageSource[] {
  return SOURCES.filter((s) => !s.keyEnv || Boolean(env[s.keyEnv]));
}

export type ProviderError = { provider: ProviderName; message: string };
export type SearchResult = { candidates: ImageCandidate[]; errors: ProviderError[] };

export type SearchAllOptions = SearchOptions & {
  /** Restrict to these providers. Default: every configured provider. */
  providers?: ProviderName[];
  /** Pass providers that need keys even if the key is missing (they will error). */
  sources?: ImageSource[];
};

/** Search every requested provider in parallel. A failing provider is reported, not fatal. */
export async function searchImages(query: string, opts: SearchAllOptions = {}): Promise<SearchResult> {
  const pool = opts.sources ?? configuredSources();
  const chosen = opts.providers ? pool.filter((s) => opts.providers!.includes(s.name)) : pool;
  const settled = await Promise.allSettled(chosen.map((s) => s.search(query, opts)));
  const candidates: ImageCandidate[] = [];
  const errors: ProviderError[] = [];
  const seen = new Set<string>();
  settled.forEach((r, i) => {
    const provider = chosen[i]!.name;
    if (r.status === "rejected") {
      errors.push({ provider, message: r.reason instanceof Error ? r.reason.message : String(r.reason) });
      return;
    }
    for (const c of r.value) {
      const key = c.imageUrl.split("?")[0]!;
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push(c);
    }
  });
  return { candidates, errors };
}
