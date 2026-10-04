// Small HTTP layer shared by every connector.
// - Honors HTTPS_PROXY (Claude cloud sessions route egress through a proxy;
//   the employee's own sandbox does not, so both paths must work).
// - Sends a descriptive User-Agent (Wikimedia requires one).
// - Normalises failures into HttpError with a `kind` the doctor can explain.

import { fetch as undiciFetch, EnvHttpProxyAgent, Agent, type Dispatcher } from "undici";

export const USER_AGENT =
  "AgentBuilder/0.1 (housing design employee; +https://github.com/EdenExec/Agent-Builder)";

export type FetchInit = {
  method?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type FetchResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
  text(): Promise<string>;
  /** Present on the production fetcher; image embedding needs it. */
  arrayBuffer?(): Promise<ArrayBuffer>;
};

/** Anything shaped like fetch. Tests pass a stub; production uses undici. */
export type Fetcher = (url: string, init?: FetchInit) => Promise<FetchResponse>;

export type HttpErrorKind =
  | "network" // could not connect: DNS, proxy denied, timeout
  | "auth" // 401 / 403: key missing, wrong or not permitted
  | "rate_limit" // 429
  | "not_found" // 404
  | "server" // 5xx
  | "bad_response" // 2xx but body was not what we expected
  | "http"; // any other non-2xx

export class HttpError extends Error {
  kind: HttpErrorKind;
  status: number | undefined;
  url: string;
  bodySnippet: string | undefined;

  constructor(kind: HttpErrorKind, url: string, message: string, status?: number, bodySnippet?: string) {
    super(message);
    this.name = "HttpError";
    this.kind = kind;
    this.url = url;
    this.status = status;
    this.bodySnippet = bodySnippet;
  }
}

let dispatcher: Dispatcher | undefined;
function getDispatcher(): Dispatcher {
  if (!dispatcher) {
    const proxied = process.env.HTTPS_PROXY || process.env.https_proxy;
    dispatcher = proxied ? new EnvHttpProxyAgent() : new Agent();
  }
  return dispatcher;
}

/** Production fetcher: undici with proxy support and a fixed User-Agent. */
export const defaultFetcher: Fetcher = async (url, init = {}) => {
  const headers: Record<string, string> = { "user-agent": USER_AGENT, accept: "application/json", ...(init.headers ?? {}) };
  try {
    const res = await undiciFetch(url, {
      method: init.method ?? "GET",
      headers,
      signal: init.signal,
      dispatcher: getDispatcher(),
    });
    return res as unknown as FetchResponse;
  } catch (err) {
    throw new HttpError("network", url, describeNetworkError(err));
  }
};

function describeNetworkError(err: unknown): string {
  const e = err as { name?: string; message?: string; cause?: { code?: string; message?: string } };
  if (e?.name === "TimeoutError" || e?.name === "AbortError") return "timed out";
  const code = e?.cause?.code;
  if (code === "ENOTFOUND") return "DNS lookup failed";
  if (code === "ECONNREFUSED") return "connection refused";
  const msg = e?.cause?.message ?? e?.message ?? "unknown network error";
  const proxied = Boolean(process.env.HTTPS_PROXY || process.env.https_proxy);
  // When the egress proxy denies a CONNECT (host not on the allowlist) undici
  // surfaces it as "fetch failed" with cause "Request was cancelled." and code 0.
  if (proxied && /cancell?ed|fetch failed|CONNECT|403/i.test(msg)) return "blocked by the egress proxy (host is not in this environment's allowed domains)";
  if (/fetch failed/i.test(msg)) return "connection failed";
  return msg;
}

export type GetJsonOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
  fetcher?: Fetcher;
};

/** GET a URL and parse JSON, mapping failures to HttpError kinds. */
export async function getJson<T = unknown>(url: string, opts: GetJsonOptions = {}): Promise<T> {
  const fetcher = opts.fetcher ?? defaultFetcher;
  const signal = AbortSignal.timeout(opts.timeoutMs ?? 20_000);
  const res = await fetcher(url, { headers: opts.headers, signal });
  if (!res.ok) {
    const body = (await res.text().catch(() => "")).slice(0, 300);
    const kind: HttpErrorKind =
      res.status === 401 || res.status === 403 ? "auth"
      : res.status === 429 ? "rate_limit"
      : res.status === 404 ? "not_found"
      : res.status >= 500 ? "server"
      : "http";
    throw new HttpError(kind, url, `HTTP ${res.status} ${res.statusText}`.trim(), res.status, body);
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new HttpError("bad_response", url, "response was not valid JSON", res.status);
  }
}

/** Build a URL with query parameters, skipping undefined values. */
export function withQuery(base: string, params: Record<string, string | number | boolean | undefined>): string {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) u.searchParams.set(k, String(v));
  return u.toString();
}

/** Strip HTML tags and collapse whitespace (Wikimedia metadata is HTML). */
export function stripHtml(s: string | undefined): string {
  return (s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
