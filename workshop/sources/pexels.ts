// Pexels: free stock photography, good interiors and materials. Free key required.
// Docs: https://www.pexels.com/api/documentation/
import { getJson, withQuery } from "../lib/http.ts";
import type { ImageCandidate, ImageSource, SearchOptions } from "./types.ts";

type PexelsPhoto = {
  id: number;
  width?: number;
  height?: number;
  url: string;
  photographer: string;
  photographer_url?: string;
  alt?: string | null;
  src: { original: string; large2x: string; large: string; medium: string; small: string; tiny: string };
};
type PexelsResponse = { total_results?: number; photos?: PexelsPhoto[] };

export function mapPexels(p: PexelsPhoto): ImageCandidate {
  const title = (p.alt ?? "").trim() || "Untitled";
  return {
    provider: "pexels",
    id: String(p.id),
    title,
    pageUrl: p.url,
    imageUrl: p.src.large2x,
    thumbUrl: p.src.medium,
    width: p.width,
    height: p.height,
    creator: p.photographer,
    creatorUrl: p.photographer_url,
    license: "Pexels License",
    licenseUrl: "https://www.pexels.com/license/",
    commercialOk: true,
    attribution: `Photo by ${p.photographer} on Pexels`,
  };
}

export const pexels: ImageSource = {
  name: "pexels",
  label: "Pexels",
  host: "api.pexels.com",
  keyEnv: "PEXELS_API_KEY",
  terms: "Free for commercial use. Credit photographer and Pexels where possible; 200 requests/hour, 20,000/month.",
  async search(query, opts: SearchOptions = {}) {
    const key = process.env.PEXELS_API_KEY;
    if (!key) throw new Error("PEXELS_API_KEY is not set");
    const url = withQuery("https://api.pexels.com/v1/search", {
      query,
      per_page: opts.count ?? 12,
      orientation: opts.orientation === "squarish" ? "square" : opts.orientation,
    });
    const data = await getJson<PexelsResponse>(url, {
      fetcher: opts.fetcher,
      timeoutMs: opts.timeoutMs,
      headers: { authorization: key },
    });
    return (data.photos ?? []).map(mapPexels);
  },
};
