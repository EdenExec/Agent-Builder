// Wikimedia Commons: freely licensed media. No key needed, but a descriptive User-Agent is required.
// Docs: https://www.mediawiki.org/wiki/API:Imageinfo
import { getJson, stripHtml, withQuery } from "../lib/http.ts";
import type { ImageCandidate, ImageSource, SearchOptions } from "./types.ts";

type MetaValue = { value?: string };
type ImageInfo = {
  url: string;
  descriptionurl?: string;
  thumburl?: string;
  width?: number;
  height?: number;
  mime?: string;
  extmetadata?: Record<string, MetaValue | undefined>;
};
type CommonsPage = { pageid: number; title: string; imageinfo?: ImageInfo[] };
type CommonsResponse = { query?: { pages?: CommonsPage[] } };

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export function licenseAllowsCommercial(shortName: string): boolean {
  const s = shortName.toLowerCase();
  if (!s) return false;
  if (/\bnc\b|non-?commercial|\bnd\b|no ?derivatives|fair use|non-free/.test(s)) return false;
  return /cc|public domain|pd|cc0|gfdl|attribution|free art|fal/.test(s);
}

export function mapCommons(p: CommonsPage): ImageCandidate | undefined {
  const info = p.imageinfo?.[0];
  if (!info) return undefined;
  if (info.mime && !ALLOWED_MIME.has(info.mime)) return undefined;
  const meta = info.extmetadata ?? {};
  const license = stripHtml(meta.LicenseShortName?.value) || stripHtml(meta.License?.value) || "Unknown";
  const creator = stripHtml(meta.Artist?.value) || undefined;
  const title = stripHtml(meta.ObjectName?.value) || p.title.replace(/^File:/, "").replace(/\.[a-z0-9]+$/i, "");
  return {
    provider: "wikimedia",
    id: String(p.pageid),
    title,
    pageUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
    imageUrl: info.url,
    thumbUrl: info.thumburl ?? info.url,
    width: info.width,
    height: info.height,
    creator,
    license,
    licenseUrl: stripHtml(meta.LicenseUrl?.value) || undefined,
    commercialOk: licenseAllowsCommercial(license),
    attribution: `"${title}"${creator ? ` by ${creator}` : ""}, ${license}, via Wikimedia Commons`,
  };
}

export const wikimedia: ImageSource = {
  name: "wikimedia",
  label: "Wikimedia Commons",
  host: "commons.wikimedia.org",
  terms: "Mostly CC and public domain. Licence varies per file; the candidate's commercialOk flag must be respected. Share-alike licences require the board to carry the same licence note.",
  async search(query, opts: SearchOptions = {}) {
    const url = withQuery("https://commons.wikimedia.org/w/api.php", {
      action: "query",
      format: "json",
      formatversion: 2,
      generator: "search",
      gsrsearch: `filetype:bitmap ${query}`,
      gsrnamespace: 6,
      gsrlimit: opts.count ?? 12,
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: 800,
      iiextmetadatafilter: "LicenseShortName|License|LicenseUrl|Artist|ObjectName",
      origin: "*",
    });
    const data = await getJson<CommonsResponse>(url, { fetcher: opts.fetcher, timeoutMs: opts.timeoutMs });
    const pages = data.query?.pages ?? [];
    return pages.map(mapCommons).filter((c): c is ImageCandidate => c !== undefined && c.commercialOk);
  },
};
