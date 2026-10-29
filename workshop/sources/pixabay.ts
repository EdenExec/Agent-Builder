// Pixabay: free stock photography. Free key required (PIXABAY_API_KEY).
// Docs: https://pixabay.com/api/docs/
// Terms: no permanent hotlinking (boards embed the bytes as data URIs, see boards/embed.ts);
// rate limit 100 requests per 60 seconds per key (we make one request per query, like every other source).
import { getJson, withQuery } from "../lib/http.ts";
import type { ImageCandidate, ImageSource, Orientation, SearchOptions } from "./types.ts";

type PixabayHit = {
  id: number;
  pageURL: string;
  tags?: string;
  previewURL?: string;
  webformatURL?: string;
  largeImageURL?: string;
  imageWidth?: number;
  imageHeight?: number;
  user: string;
  user_id: number;
};
type PixabayResponse = { total?: number; totalHits?: number; hits?: PixabayHit[] };

/** Pixabay accepts 3..200 results per page and queries up to 100 characters. */
export const PIXABAY_MIN_PER_PAGE = 3;
export const PIXABAY_MAX_PER_PAGE = 200;
export const PIXABAY_MAX_QUERY = 100;

const ORIENTATION: Partial<Record<Orientation, string>> = { landscape: "horizontal", portrait: "vertical" };

export function mapPixabay(h: PixabayHit): ImageCandidate | undefined {
  const imageUrl = h.largeImageURL || h.webformatURL;
  if (!imageUrl) return undefined;
  const title = (h.tags ?? "").trim() || "Untitled";
  return {
    provider: "pixabay",
    id: String(h.id),
    title,
    pageUrl: h.pageURL,
    imageUrl,
    thumbUrl: h.webformatURL || h.previewURL || imageUrl,
    width: h.imageWidth,
    height: h.imageHeight,
    creator: h.user,
    creatorUrl: `https://pixabay.com/users/${encodeURIComponent(h.user)}-${h.user_id}/`,
    license: "Pixabay Content License",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    commercialOk: true,
    attribution: `Photo by ${h.user} on Pixabay`,
  };
}

export const pixabay: ImageSource = {
  name: "pixabay",
  label: "Pixabay",
  host: "pixabay.com",
  keyEnv: "PIXABAY_API_KEY",
  terms: "Free for commercial use under the Pixabay Content License. Credit 'Photo by NAME on Pixabay'; no permanent hotlinking (boards embed the image); 100 requests/60 seconds.",
  async search(query, opts: SearchOptions = {}) {
    const key = process.env.PIXABAY_API_KEY;
    if (!key) throw new Error("PIXABAY_API_KEY is not set");
    const count = Math.min(PIXABAY_MAX_PER_PAGE, Math.max(PIXABAY_MIN_PER_PAGE, opts.count ?? 12));
    const url = withQuery("https://pixabay.com/api/", {
      key,
      q: query.slice(0, PIXABAY_MAX_QUERY),
      image_type: "photo",
      safesearch: true,
      per_page: count,
      page: 1,
      orientation: opts.orientation ? ORIENTATION[opts.orientation] : undefined,
    });
    const data = await getJson<PixabayResponse>(url, { fetcher: opts.fetcher, timeoutMs: opts.timeoutMs });
    return (data.hits ?? []).map(mapPixabay).filter((c): c is ImageCandidate => Boolean(c)).slice(0, opts.count ?? 12);
  },
};
