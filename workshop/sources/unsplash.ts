// Unsplash: high-quality photography, strong on interiors. Free key required.
// Docs: https://unsplash.com/documentation
// Guidelines: hotlink `urls.*`, attribute "Photo by X on Unsplash", hit download_location on use.
import { getJson, withQuery } from "../lib/http.ts";
import type { ImageCandidate, ImageSource, SearchOptions } from "./types.ts";

type UnsplashPhoto = {
  id: string;
  description?: string | null;
  alt_description?: string | null;
  width?: number;
  height?: number;
  urls: { raw: string; full: string; regular: string; small: string; thumb: string };
  links: { html: string; download_location: string };
  user: { name: string; username: string; links?: { html?: string } };
};
type UnsplashResponse = { total?: number; results?: UnsplashPhoto[] };

const UTM = "utm_source=agent-builder&utm_medium=referral";

export function mapUnsplash(p: UnsplashPhoto): ImageCandidate {
  const title = (p.description ?? p.alt_description ?? "").trim() || "Untitled";
  const creatorUrl = `${p.user.links?.html ?? `https://unsplash.com/@${p.user.username}`}?${UTM}`;
  return {
    provider: "unsplash",
    id: p.id,
    title,
    pageUrl: `${p.links.html}?${UTM}`,
    imageUrl: `${p.urls.raw}&w=1600&q=80&fm=jpg`,
    thumbUrl: p.urls.small,
    width: p.width,
    height: p.height,
    creator: p.user.name,
    creatorUrl,
    license: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
    commercialOk: true,
    attribution: `Photo by ${p.user.name} on Unsplash`,
    downloadTrigger: p.links.download_location,
  };
}

export const unsplash: ImageSource = {
  name: "unsplash",
  label: "Unsplash",
  host: "api.unsplash.com",
  keyEnv: "UNSPLASH_ACCESS_KEY",
  terms: "Free for commercial use. Attribute 'Photo by NAME on Unsplash' with links; request downloadTrigger when a photo is used; demo apps are limited to 50 requests/hour.",
  async search(query, opts: SearchOptions = {}) {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) throw new Error("UNSPLASH_ACCESS_KEY is not set");
    const url = withQuery("https://api.unsplash.com/search/photos", {
      query,
      per_page: opts.count ?? 12,
      orientation: opts.orientation,
      content_filter: "high",
    });
    const data = await getJson<UnsplashResponse>(url, {
      fetcher: opts.fetcher,
      timeoutMs: opts.timeoutMs,
      headers: { authorization: `Client-ID ${key}`, "accept-version": "v1" },
    });
    return (data.results ?? []).map(mapUnsplash);
  },
};
