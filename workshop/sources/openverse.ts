// Openverse: aggregated Creative Commons images (Flickr, Wikimedia, museums...). No key needed.
// Docs: https://api.openverse.org/v1/
import { getJson, withQuery } from "../lib/http.ts";
import type { ImageCandidate, ImageSource, SearchOptions } from "./types.ts";

type OpenverseResult = {
  id: string;
  title?: string | null;
  foreign_landing_url?: string;
  url: string;
  thumbnail?: string;
  width?: number | null;
  height?: number | null;
  creator?: string | null;
  creator_url?: string | null;
  license: string; // "by", "by-sa", "cc0", "pdm"
  license_version?: string | null;
  license_url?: string | null;
  source?: string;
  provider?: string;
};
type OpenverseResponse = { result_count?: number; results?: OpenverseResult[] };

export function formatCcLicense(license: string, version?: string | null): string {
  const l = license.toLowerCase();
  if (l === "cc0") return "CC0 1.0";
  if (l === "pdm") return "Public Domain Mark";
  return `CC ${l.toUpperCase()}${version ? " " + version : ""}`;
}

export function mapOpenverse(r: OpenverseResult): ImageCandidate {
  const title = (r.title ?? "").trim() || "Untitled";
  const license = formatCcLicense(r.license, r.license_version);
  const creator = r.creator?.trim() || undefined;
  const source = r.source ?? r.provider ?? "Openverse";
  return {
    provider: "openverse",
    id: r.id,
    title,
    pageUrl: r.foreign_landing_url ?? r.url,
    imageUrl: r.url,
    thumbUrl: r.thumbnail ?? r.url,
    width: r.width ?? undefined,
    height: r.height ?? undefined,
    creator,
    creatorUrl: r.creator_url ?? undefined,
    license,
    licenseUrl: r.license_url ?? undefined,
    commercialOk: !/nc|nd/.test(r.license.toLowerCase()),
    attribution: `"${title}"${creator ? ` by ${creator}` : ""}, ${license}, via ${source}`,
  };
}

export const openverse: ImageSource = {
  name: "openverse",
  label: "Openverse",
  host: "api.openverse.org",
  terms: "Creative Commons. Keep title, creator and licence on every tile. Commercial-use filter applied at search time.",
  async search(query, opts: SearchOptions = {}) {
    const url = withQuery("https://api.openverse.org/v1/images/", {
      q: query,
      page_size: opts.count ?? 12,
      license_type: "commercial",
      mature: false,
      aspect_ratio: opts.orientation === "landscape" ? "wide" : opts.orientation === "portrait" ? "tall" : opts.orientation === "squarish" ? "square" : undefined,
    });
    const data = await getJson<OpenverseResponse>(url, { fetcher: opts.fetcher, timeoutMs: opts.timeoutMs });
    return (data.results ?? []).map(mapOpenverse);
  },
};
