// npm run submittal -- <packet.json> [--out deliverables/submittals] [--draft]
// Builds one Eden submittal packet PDF: cover page (overview + Must Do scorecard), the original resume untouched,
// then references and screening notes. Packets carry pay and references: they go to Drive, never the repo or the Hub.
// Without --draft it stops on anything missing from the pre-send checklist (projects/team-hub/submittal-packet/workflow.md).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { backDoc, checkPacket, coverDoc, fileBase, googleQuery, type Packet } from "./packet.ts";

function findChrome(): string | undefined {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!existsSync(root)) return undefined;
  for (const d of readdirSync(root).filter((x) => /^chromium-\d+$/.test(x)))
    for (const sub of ["chrome-linux", "chrome-linux64"]) { const p = join(root, d, sub, "chrome"); if (existsSync(p)) return p; }
  return undefined;
}
const toPdf = (chrome: string, html: string, pdf: string) =>
  execFileSync(chrome, ["--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${resolve(pdf)}`, pathToFileURL(resolve(html)).href], { stdio: "ignore", timeout: 90_000 });

/** The resume stays in its own format: a PDF is used as is; a Word file is converted page for page, nothing edited. */
function resumePdf(src: string, work: string): string {
  if (extname(src).toLowerCase() === ".pdf") return src;
  execFileSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", work, src], { stdio: "ignore", timeout: 120_000 });
  const out = join(work, basename(src).replace(/\.[^.]+$/, ".pdf"));
  if (!existsSync(out)) throw new Error(`Could not convert the resume ${src} to PDF. Export it to PDF and point "resume" at that.`);
  return out;
}

const args = process.argv.slice(2);
const file = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--out");
const outDir = args.includes("--out") ? args[args.indexOf("--out") + 1]! : "deliverables/submittals";
try {
  if (!file) throw new Error("Usage: npm run submittal -- <packet.json> [--out dir] [--draft]");
  const p = JSON.parse(readFileSync(file, "utf8")) as Packet;
  const miss = checkPacket(p);
  for (const m of miss) console.log(`MISSING ${m}`);
  if (miss.length && !args.includes("--draft")) { console.error(`${miss.length} item(s) missing. Fill them, or run with --draft for a working copy (never one to send).`); process.exit(2); }
  if (p.resume && !existsSync(p.resume)) throw new Error(`Resume not found: ${p.resume}`);
  mkdirSync(outDir, { recursive: true });
  const base = fileBase(p) + (miss.length ? " (DRAFT)" : "");
  const work = join(outDir, ".work"); mkdirSync(work, { recursive: true });
  const cover = join(work, "cover.html"), back = join(work, "back.html");
  writeFileSync(cover, coverDoc(p)); writeFileSync(back, backDoc(p));
  console.log(`First-pass search: ${googleQuery(p)}`);
  const chrome = findChrome();
  if (!chrome) { copyFileSync(cover, join(outDir, `${base} - cover.html`)); console.log("No Chromium, so no PDF. Open the cover HTML and print it."); process.exit(0); }
  toPdf(chrome, cover, join(work, "1.pdf")); toPdf(chrome, back, join(work, "3.pdf"));
  const parts = [join(work, "1.pdf"), ...(p.resume ? [resumePdf(p.resume, work)] : []), join(work, "3.pdf")];
  const pdf = join(outDir, `${base}.pdf`);
  execFileSync("pdfunite", [...parts, pdf]);
  rmSync(work, { recursive: true, force: true });
  console.log(`Wrote ${pdf}.`);
  // Kev, 27 Oct 2026: every packet is reviewed by him before it is submitted; quality control is his eyes on it.
  console.log("REVIEW BEFORE SUBMITTING: Kev reads every field, pay line and name before this goes to a client. Then save it to Drive, Submittals / <Client> / <JO> / <Candidate>.");
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
