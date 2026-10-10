import type { ImageCandidate } from "../sources/types.ts";

export type Tile = {
  /** "provider:id", stable across boards. Used for rejection memory. */
  id: string;
  candidate: ImageCandidate;
  /** Why this tile is on the board, one line. Editable in the spec. */
  note: string;
  /** The search query that found it; shown as a filter chip. */
  query: string;
  /** Embedded image bytes as a data: URI. Absent when embedding failed or was skipped. */
  dataUri?: string;
};

export type BoardSpec = {
  slug: string;
  title: string;
  /** One theme per board, e.g. "Living room and courtyard". */
  theme: string;
  project?: string;
  audience: "family" | "public";
  /** Name on the board. Home boards are KDTW Group (Kev, 10 Oct 2026); "eden" only for recruiting work. */
  org?: "eden" | "kdtw";
  avoid: string[];
  createdAt: string;
  tiles: Tile[];
};

/** What the board page exports and `board feedback` ingests. */
export type Feedback = {
  board: string;
  pins: { id: string; reason?: string }[];
  rejects: { id: string; reason?: string }[];
  comment?: string;
};

export const tileId = (c: Pick<ImageCandidate, "provider" | "id">) => `${c.provider}:${c.id}`;
