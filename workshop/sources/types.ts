import type { Fetcher } from "../lib/http.ts";

export type ProviderName = "openverse" | "wikimedia" | "unsplash" | "pexels";

/** One image the employee may pin to a board. Every field needed for attribution travels with it. */
export type ImageCandidate = {
  provider: ProviderName;
  id: string;
  title: string;
  /** Page to link back to (landing page, not the raw file). */
  pageUrl: string;
  /** Full-size image URL for downloading into the board. */
  imageUrl: string;
  /** Small preview for quick curation. */
  thumbUrl: string;
  width?: number;
  height?: number;
  creator?: string;
  creatorUrl?: string;
  /** Human-readable licence, e.g. "CC BY-SA 4.0", "Unsplash License". */
  license: string;
  licenseUrl?: string;
  /** Whether the licence permits commercial use without a share-alike or no-derivatives catch. */
  commercialOk: boolean;
  /** Ready-to-print attribution line. */
  attribution: string;
  /** Unsplash only: URL that must be requested when the photo is actually used (API guideline). */
  downloadTrigger?: string;
};

export type Orientation = "landscape" | "portrait" | "squarish";

export type SearchOptions = {
  /** Max results per provider. Default 12. */
  count?: number;
  orientation?: Orientation;
  fetcher?: Fetcher;
  timeoutMs?: number;
};

export type ImageSource = {
  name: ProviderName;
  label: string;
  host: string;
  /** Env var holding the key, if the provider needs one. */
  keyEnv?: string;
  /** Short note on terms the board builder must respect. */
  terms: string;
  search(query: string, opts?: SearchOptions): Promise<ImageCandidate[]>;
};
