// `npm run doctor` - one command that says what is wired up and what is still missing.
// Exit code 1 if anything required is failing, so it can gate a deploy.
import "../lib/env.ts";
import { HttpError, defaultFetcher } from "../lib/http.ts";
import { SOURCES } from "../sources/index.ts";

type Status = "ok" | "missing_key" | "key_rejected" | "blocked" | "rate_limited" | "error";
type Check = { name: string; status: Status; detail: string; fix?: string };

const ANTHROPIC = "https://api.anthropic.com";

function explain(err: unknown): { status: Status; detail: string } {
  if (err instanceof HttpError) {
    switch (err.kind) {
      case "network": return { status: "blocked", detail: err.message };
      case "auth": return { status: "key_rejected", detail: `${err.message}${err.bodySnippet ? ` - ${err.bodySnippet}` : ""}` };
      case "rate_limit": return { status: "rate_limited", detail: err.message };
      default: return { status: "error", detail: `${err.message}${err.bodySnippet ? ` - ${err.bodySnippet}` : ""}` };
    }
  }
  return { status: "error", detail: err instanceof Error ? err.message : String(err) };
}

async function checkAnthropic(): Promise<Check[]> {
  const key = process.env.ANTHROPIC_API_KEY;
  const fix = "Add ANTHROPIC_API_KEY to the environment (cloud: environment settings -> Edit -> API credentials; local: .env).";
  if (!key) return [{ name: "Anthropic API key", status: "missing_key", detail: "ANTHROPIC_API_KEY is not set", fix }];
  const checks: Check[] = [];
  const headers = { "x-api-key": key, "anthropic-version": "2023-06-01" };
  try {
    const res = await defaultFetcher(`${ANTHROPIC}/v1/models?limit=1`, { headers, signal: AbortSignal.timeout(15_000) });
    if (res.ok) checks.push({ name: "Anthropic API key", status: "ok", detail: "key accepted by /v1/models" });
    else checks.push({ name: "Anthropic API key", status: res.status === 401 || res.status === 403 ? "key_rejected" : "error", detail: `HTTP ${res.status} from /v1/models`, fix });
  } catch (err) {
    const e = explain(err);
    checks.push({ name: "Anthropic API key", status: e.status, detail: e.detail, fix });
  }
  if (checks[0]!.status !== "ok") return checks;
  // Managed Agents beta access: listing agents succeeds only for organisations in the beta.
  try {
    const res = await defaultFetcher(`${ANTHROPIC}/v1/agents?limit=1`, {
      headers: { ...headers, "anthropic-beta": "managed-agents-2026-04-01" },
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) checks.push({ name: "Managed Agents access", status: "ok", detail: "organisation can list agents" });
    else checks.push({ name: "Managed Agents access", status: "key_rejected", detail: `HTTP ${res.status} from /v1/agents`, fix: "Ask Anthropic to enable the Managed Agents beta for this organisation, or use a key from an organisation that has it." });
  } catch (err) {
    const e = explain(err);
    checks.push({ name: "Managed Agents access", status: e.status, detail: e.detail });
  }
  return checks;
}

async function checkSources(): Promise<Check[]> {
  return Promise.all(
    SOURCES.map(async (s): Promise<Check> => {
      const name = `${s.label} (${s.host})`;
      const allowFix = `Allow ${s.host} in this environment's network access (cloud: environment settings -> Edit -> Network access).`;
      if (s.keyEnv && !process.env[s.keyEnv]) {
        return { name, status: "missing_key", detail: `${s.keyEnv} is not set`, fix: `Create a free key and add ${s.keyEnv} to the environment. See .env.example for where to get it.` };
      }
      try {
        const results = await s.search("modern kitchen interior", { count: 3, timeoutMs: 15_000 });
        return { name, status: "ok", detail: `${results.length} result(s) for a test search` };
      } catch (err) {
        const e = explain(err);
        const fix = e.status === "blocked" ? allowFix : e.status === "key_rejected" ? `Check ${s.keyEnv ?? "the request"}; the provider rejected it.` : undefined;
        return { name, status: e.status, detail: e.detail, fix };
      }
    }),
  );
}

const ICON: Record<Status, string> = { ok: "OK  ", missing_key: "KEY ", key_rejected: "AUTH", blocked: "NET ", rate_limited: "RATE", error: "ERR " };

async function main() {
  const proxied = Boolean(process.env.HTTPS_PROXY || process.env.https_proxy);
  console.log(`Agent-Builder doctor${proxied ? " (egress via proxy)" : ""}\n`);
  const checks = [...(await checkAnthropic()), ...(await checkSources())];
  const w = Math.max(...checks.map((c) => c.name.length));
  for (const c of checks) {
    console.log(`${ICON[c.status]}  ${c.name.padEnd(w)}  ${c.detail}`);
    if (c.fix && c.status !== "ok") console.log(`${"".padEnd(6)}${"".padEnd(w)}  -> ${c.fix}`);
  }
  const failing = checks.filter((c) => c.status !== "ok");
  console.log(`\n${checks.length - failing.length}/${checks.length} checks passing.`);
  process.exitCode = failing.length ? 1 : 0;
}

main().catch((err) => { console.error(err); process.exitCode = 2; });
