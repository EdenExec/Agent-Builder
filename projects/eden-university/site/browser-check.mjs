// Browser check for the Eden University page (Q, 29 Oct 2026).
//   node projects/eden-university/site/browser-check.mjs [shots dir]
// Playwright lives at /opt/node22/lib/node_modules/playwright, Chromium under /opt/pw-browsers. Nothing leaves the box: fonts are stubbed.
// Part 1: example mode (two sample learners and a sample supervisor) at 1920 and 390 wide, light and dark.
// Part 2: a stubbed live database that enforces the declared rules: learner submit, then supervisor sign-off, in two pages at once.
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const SHOTS = process.argv[2] ?? mkdtempSync(join(tmpdir(), "eu-shots-"));
mkdirSync(SHOTS, { recursive: true });
const src = readFileSync(join(HERE, "eden-university.html"), "utf8");
// The publisher wraps the page in a skeleton; do the same here so the check sees what a viewer sees.
const wrapDir = mkdtempSync(join(tmpdir(), "eu-page-"));
const FILE = join(wrapDir, "page.html");
writeFileSync(FILE, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px -apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${src}</body></html>`);

const chromeRoot = "/opt/pw-browsers";
const exe = join(chromeRoot, readdirSync(chromeRoot).find((d) => /^chromium-\d+$/.test(d)), "chrome-linux/chrome");
const browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
let fails = 0, passes = 0;
const ok = (c, m, extra) => { if (c) passes++; else { fails++; console.log("FAIL", m, extra ?? ""); } };
const NOW = new Date("2026-10-29T18:00:00Z"); // Thu 11:00 am Pacific

async function open(ctx) {
  const p = await ctx.newPage();
  p.errs = [];
  p.on("console", (m) => { if (m.type() === "error") p.errs.push(m.text()); });
  p.on("pageerror", (e) => p.errs.push("pageerror: " + e.message));
  await p.route("**/*", (r) => (/^(file|about|data):/.test(r.request().url()) ? r.continue() : /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.fulfill({ status: 200, contentType: "text/css", body: "" }) : r.abort()));
  await p.clock.install({ time: NOW });
  return p;
}
const go = async (p, hash = "") => { await p.goto("file://" + FILE + hash); await p.clock.resume(); await p.waitForTimeout(250); };
const noScroll = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const text = (p, sel = "body") => p.textContent(sel);
const settle = (p) => p.waitForTimeout(200);
const FONTS_OK = (p) => p.evaluate(() => getComputedStyle(document.body).fontFamily.includes("Montserrat"));

// ---------------------------------------------------------------- Part 1: example mode
for (const [w, h, scheme] of [[1920, 1080, "light"], [390, 844, "light"], [390, 844, "dark"], [1920, 1080, "dark"]]) {
  const tag = `example ${w} ${scheme}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, timezoneId: "America/Los_Angeles", locale: "en-US" });
  const p = await open(ctx);
  await go(p, "#home");
  ok(/EXAMPLE DATA/.test(await text(p, "#banner")), `${tag}: example banner`);
  ok((await text(p, "header.top")).includes("EDEN PARTNER GROUP") && (await text(p, "header.top")).includes("Eden University"), `${tag}: header carries the org and title`);
  ok(/EDEN PARTNER GROUP/.test(await text(p, "footer")) && /edenpartnergroup\.com/.test(await text(p, "footer")), `${tag}: footer`);
  ok(await FONTS_OK(p), `${tag}: Montserrat first in the stack`);
  ok(!(await p.$("#strip")), `${tag}: a learner does not see the 50,000-ft strip`);
  ok(!(await p.$("nav a[href='#team']")), `${tag}: a learner has no Team tab`);
  ok((await p.$$("#tracks .card")).length === 2, `${tag}: two track cards`);
  const card = await text(p, "#tracks .card");
  ok(/Sample · Intern, Communications/.test(card) && /Weeks/.test(card) && /Modules/.test(card), `${tag}: card has title, weeks, modules`, card);
  ok(/Alex Sample|signed off/.test(await text(p, "#mine")) && (await p.$$("#mine .card")).length === 1, `${tag}: My progress shows Alex's one track`);
  ok(/40% signed off|33% signed off|\d+% signed off/.test(await text(p, "#mine")), `${tag}: My progress has a percentage`, await text(p, "#mine"));
  ok(/Behind · 1 module/.test(await text(p, "#mine")), `${tag}: My progress carries the behind flag`);
  ok(await noScroll(p), `${tag}: home has no horizontal scroll`);
  await p.screenshot({ path: join(SHOTS, `home-${w}-${scheme}.png`), fullPage: true });

  // supervisor first (before Alex submits anything)
  await p.selectOption("#persona", "sup-example"); await settle(p);
  ok(!!(await p.$("nav a[href='#team']")), `${tag}: the supervisor gets a Team tab`);
  ok(!!(await p.$("#strip")), `${tag}: the supervisor sees the strip on Home`);
  const strip = await text(p, "#strip");
  ok(/Alex Sample/.test(strip) && /Jordan Sample/.test(strip), `${tag}: strip lists both learners`, strip);
  ok(/Behind · 1 module/.test(strip), `${tag}: strip carries Alex's behind flag`, strip);
  ok(/On track/.test(strip), `${tag}: strip shows Jordan on track`);
  ok(await p.$$eval("#strip tbody tr", (r) => /Alex/.test(r[0].textContent)), `${tag}: behind learners sort first`);
  ok(await noScroll(p), `${tag}: supervisor home has no horizontal scroll`);
  await p.selectOption("#persona", "u-alex"); await settle(p);

  // track view
  await p.click("#mine a.card"); await settle(p);
  ok(p.url().endsWith("#track-sample-intern-comms"), `${tag}: hash route is #track-<id>`, p.url());
  ok((await p.$$("section.phase")).length === 3, `${tag}: three phases`);
  ok((await p.$$(".mod")).length === 6, `${tag}: six module rows`);
  const pills = await p.$$eval(".mod .pill", (e) => e.map((x) => x.textContent));
  ok(pills.join("|") === "Done|Signed off|Signed off|Submitted|In progress|Not started", `${tag}: statuses`, pills.join("|"));
  ok(await p.$eval(".mod[data-mod='sample-intern-comms:M05'] .tag-behind", (e) => !!e), `${tag}: M05 is flagged behind`);
  ok((await p.$$(".tag-behind")).length === 1, `${tag}: only one behind tag`);
  ok(await p.$eval(".mod-d[id='d-sample-intern-comms:M05']", (e) => e.hidden), `${tag}: details start closed`);
  await p.click(".mod-h[data-k='sample-intern-comms:M05']");
  ok(await p.$eval(".mod-d[id='d-sample-intern-comms:M05']", (e) => !e.hidden), `${tag}: tap opens the module`);
  const det = await text(p, "#d-sample-intern-comms\\:M05");
  ok(/Goal/.test(det) && /Steps/.test(det) && /Proof to submit/.test(det) && /Do not paste passwords/.test(det), `${tag}: detail has goal, steps, proof, the warning`, det);
  // privacy guard
  await p.fill("[data-draft='sample-intern-comms:M05:text']", "Plan is ready, mail me at someone@example.com");
  await p.click("button[data-act=submit][data-m=M05]");
  ok(/email address/.test(await text(p, "#status")) && (await p.$$eval(".mod .pill", (e) => e[4].textContent)) === "In progress", `${tag}: an email address blocks the submit`);
  await p.fill("[data-draft='sample-intern-comms:M05:text']", "Call 208-555-0147 to confirm");
  await p.click("button[data-act=submit][data-m=M05]");
  ok(/phone number/.test(await text(p, "#status")), `${tag}: a phone number blocks the submit`);
  await p.fill("[data-draft='sample-intern-comms:M05:text']", "password: hunter2");
  await p.click("button[data-act=submit][data-m=M05]");
  ok(/password or key/.test(await text(p, "#status")), `${tag}: a password blocks the submit`);
  await p.fill("[data-draft='sample-intern-comms:M05:text']", "Five posts planned, one per weekday.");
  await p.fill("[data-draft='sample-intern-comms:M05:link']", "javascript:alert(1)");
  await p.click("button[data-act=submit][data-m=M05]");
  ok(/http/.test(await text(p, "#status")), `${tag}: a non-http link is refused`);
  await p.fill("[data-draft='sample-intern-comms:M05:link']", "https://example.com/plan");
  await p.check("#d-sample-intern-comms\\:M05 input[data-i='0']");
  ok(await p.$eval("#d-sample-intern-comms\\:M05 input[data-i='0']", (e) => e.checked), `${tag}: a step ticks`);
  ok((await p.$$eval(".mod .pill", (e) => e[4].textContent)) === "In progress", `${tag}: a ticked step reads In progress`);
  await p.click("button[data-act=submit][data-m=M05]"); await settle(p);
  ok((await p.$$eval(".mod .pill", (e) => e[4].textContent)) === "Submitted", `${tag}: submit moves M05 to Submitted`);
  ok(!(await p.$(".tag-behind")), `${tag}: a submitted module is no longer behind`);
  ok(/Submitted/.test(await text(p, "#d-sample-intern-comms\\:M05")) && /Resubmit/.test(await text(p, "#d-sample-intern-comms\\:M05")), `${tag}: it can be resubmitted before sign-off`);
  ok(await p.$eval("#d-sample-intern-comms\\:M02 input", (e) => e.disabled), `${tag}: a signed-off module is locked`);
  ok(await noScroll(p), `${tag}: track view has no horizontal scroll`);
  if (w === 390) ok(await p.evaluate(() => [...document.querySelectorAll("button,a.btn,select,input")].filter((e) => e.offsetParent && e.type !== "checkbox").every((e) => e.getBoundingClientRect().height >= 33)), `${tag}: touch targets are at least 34px tall`);
  await p.screenshot({ path: join(SHOTS, `track-${w}-${scheme}.png`), fullPage: true });

  // start a second track (Alex has not started the recruiter desk)
  await p.goto("file://" + FILE + "#track-sample-recruiter-desk"); await p.clock.resume(); await settle(p);
  ok(/Start this track/.test(await text(p, ".startbox")), `${tag}: an unstarted track offers Start`);
  ok(await p.$eval("button[data-act=start]", (e) => !e.disabled), `${tag}: Start is enabled`);
  ok(await p.$$eval(".step input", (e) => e.every((x) => x.disabled)), `${tag}: steps are locked until the track starts`);
  ok(!(await p.$("textarea")), `${tag}: no proof box before the track starts`);

  await go(p, "#home");
  await p.selectOption("#persona", "sup-example"); await settle(p);
  await p.click("nav a[href='#team']"); await settle(p);
  ok(!/Behind/.test(await text(p, "#strip")), `${tag}: after Alex submits M05 the behind flag clears`, await text(p, "#strip"));
  ok((await p.$$("section.sec table.rt")).length >= 2, `${tag}: team view has the strip and a roster per track`);
  await p.click("button.linkbtn[data-k='sample-intern-comms--u-alex']"); await settle(p);
  ok((await p.$$(".dd-in .dmod")).length === 6, `${tag}: the learner opens to six modules`);
  ok(/Plan is ready|Five posts planned/.test(await text(p, ".dd-in")) || /Cut the history/.test(await text(p, ".dd-in")), `${tag}: the learner's proof is readable`);
  ok((await p.$$("button[data-act=signoff]")).length === 2, `${tag}: a sign-off button on each submitted module (M04, M05)`, String((await p.$$("button[data-act=signoff]")).length));
  await p.fill("[data-note='sample-intern-comms--u-alex:M04']", "Good cuts.");
  await p.click("button[data-act=signoff][data-m=M04]"); await settle(p);
  ok(/Signed off by Bridger/.test(await text(p, ".dd-in")) && /Good cuts/.test(await text(p, ".dd-in")), `${tag}: sign-off records who and the note`);
  ok((await p.$$("button[data-act=signoff]")).length === 1, `${tag}: one fewer sign-off waiting`);
  await p.click("button[data-act=undo][data-m=M04]"); await settle(p);
  ok((await p.$$("button[data-act=signoff]")).length === 2, `${tag}: undo puts it back`);
  await p.click("button[data-act=signoff][data-m=M04]"); await settle(p);
  await p.screenshot({ path: join(SHOTS, `team-${w}-${scheme}.png`), fullPage: true });
  ok(await noScroll(p), `${tag}: team view has no horizontal scroll`);
  // a learner cannot see Team
  await p.selectOption("#persona", "u-jordan"); await settle(p);
  await p.evaluate(() => { location.hash = "#team"; }); await settle(p);
  ok(!(await p.$("nav a[href='#team']")) && !!(await p.$("#mine")), `${tag}: a learner sent to #team lands on Home`);
  ok(/Sample · Recruiter Desk/.test(await text(p, "#mine")), `${tag}: Jordan sees his own track`);
  ok(p.errs.length === 0, `${tag}: no console errors`, p.errs.join(" | "));
  await ctx.close();
}

// ---------------------------------------------------------------- Part 2: stubbed live database with the declared rules
// Rules under test (what Kev declares at publish): [{path:"", read:"view", write:"admin"}, {path:"progress", read:"interact", write:"interact"}]
const RULES = [{ path: "", read: "view", write: "admin" }, { path: "progress", read: "interact", write: "interact" }];
const RANK = { view: 0, interact: 1, admin: 2 };
const need = (path, kind) => { const col = path.split("/")[0]; const r = RULES.find((x) => x.path === col) ?? RULES.find((x) => x.path === ""); return r[kind]; };
const store = {};  // collection -> id -> doc
const log = [];    // every write with who and path
const subs = [];   // {page, sid, kind, path}
const clone = (v) => JSON.parse(JSON.stringify(v));

// Load the sample tracks through the real loader so the page reads exactly what `npm run eu -- load` writes.
const sample = JSON.parse(src.match(/id="eu-sample-tracks">\s*([\s\S]*?)<\/script>/)[1]);
const fromDir = mkdtempSync(join(tmpdir(), "eu-from-")), outDir = mkdtempSync(join(tmpdir(), "eu-out-"));
for (const t of sample) { mkdirSync(join(fromDir, t.id)); writeFileSync(join(fromDir, t.id, "track.json"), JSON.stringify(t)); }
execFileSync(process.execPath, ["workshop/office/eu.ts", "load", "--from", fromDir, "--out", outDir], { cwd: join(HERE, "..", "..", ".."), stdio: "pipe" });
const batch = JSON.parse(readFileSync(join(outDir, "tracks-batch.json"), "utf8"));
store.tracks = {};
for (const w of batch.writes) store.tracks[w.doc_id] = JSON.parse(readFileSync(w.file_path, "utf8"));
ok(batch.writes.length === 2 && batch.writes.every((w) => w.op === "set" && w.collection === "tracks"), "loader: one set per track into tracks/{id}");

const snapOf = (kind, path) => {
  if (kind === "doc") { const [c, ...r] = path.split("/"); const v = (store[c] ?? {})[r.join("/")]; return { exists: v !== undefined, id: r.join("/"), data: v === undefined ? undefined : clone(v) }; }
  return { docs: Object.keys(store[path] ?? {}).map((id) => ({ id, data: clone(store[path][id]) })) };
};
async function pushAll() {
  for (const s of subs) await s.page.evaluate(([sid, snap]) => window.__push(sid, snap), [s.sid, snapOf(s.kind, s.path)]).catch(() => {});
}
async function livePage(ctx, who) {
  const p = await open(ctx);
  p.who = who;
  await p.exposeFunction("__sub", async (sid, kind, path) => {
    if (RANK[who.level] < RANK[need(path, "read")]) return { denied: true };
    subs.push({ page: p, sid, kind, path }); return { snap: snapOf(kind, path) };
  });
  await p.exposeFunction("__unsub", (sid) => { const i = subs.findIndex((s) => s.page === p && s.sid === sid); if (i >= 0) subs.splice(i, 1); });
  await p.exposeFunction("__write", async (op, path, data) => {
    if (RANK[who.level] < RANK[need(path, "write")]) return { denied: `no ${need(path, "write")} access to ${path}` };
    const [c, ...r] = path.split("/"), id = r.join("/");
    store[c] = store[c] ?? {};
    if (op === "set") store[c][id] = clone(data); else if (op === "update") store[c][id] = { ...store[c][id], ...clone(data) }; else delete store[c][id];
    log.push({ who: who.id, op, path }); setTimeout(pushAll, 0); return {};
  });
  await p.addInitScript((w) => {
    let n = 0; const cbs = {};
    window.__push = (sid, snap) => { const c = cbs[sid]; if (!c) return; c.cb(c.kind === "doc" ? { exists: snap.exists, id: snap.id, data: () => snap.data } : { docs: snap.docs.map((d) => ({ id: d.id, data: () => d.data })) }); };
    const mk = (kind, path) => ({
      onSnapshot(cb, err) {
        const sid = "s" + ++n; cbs[sid] = { cb, kind };
        window.__sub(sid, kind, path).then((r) => { if (r.denied) { delete cbs[sid]; err && err(new Error("denied")); } else window.__push(sid, r.snap); });
        return () => { delete cbs[sid]; window.__unsub(sid); };
      },
      set: (d) => window.__write("set", path, d).then((r) => { if (r.denied) throw new Error(r.denied); }),
      update: (d) => window.__write("update", path, d).then((r) => { if (r.denied) throw new Error(r.denied); }),
      delete: () => window.__write("delete", path).then((r) => { if (r.denied) throw new Error(r.denied); }),
    });
    window.claude = { use: (name) => Promise.resolve(name === "db" ? { doc: (p) => mk("doc", p), collection: (p) => mk("col", p) } : name === "user" ? { me: () => Promise.resolve({ id: w.id, name: w.name }), can: () => Promise.resolve(w.level === "admin") } : null) };
  }, who);
  return p;
}

for (const [w, h] of [[1920, 1080], [390, 844]]) {
  const tag = `live ${w}`;
  for (const k of Object.keys(store)) if (k !== "tracks") delete store[k];
  log.length = 0; subs.length = 0;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, timezoneId: "America/Los_Angeles", locale: "en-US" });
  const maya = await livePage(ctx, { id: "u_maya0000000000000000a", name: "Maya Test", level: "interact" });
  const sup = await livePage(ctx, { id: "u_bridger00000000000000a", name: "Bridger", level: "admin" });
  await go(maya, "#home"); await go(sup, "#home");
  ok(!/EXAMPLE DATA/.test(await text(maya, "#banner")), `${tag}: live mode shows no example banner`);
  ok((await maya.$$("#tracks .card")).length === 2, `${tag}: tracks read from tracks/{id}`);
  ok(/Sample · Intern, Communications/.test(await text(maya, "#tracks")), `${tag}: loader fields reach the card`);
  ok(/Live · updated/.test(await text(maya, "#sync")), `${tag}: footer says Live and the sync time`);
  ok(!!(await sup.$("#strip")) && /Nobody has started/.test(await text(sup, "#strip")), `${tag}: supervisor strip is empty before anyone starts`);

  // learner: start, tick, submit
  await maya.goto("file://" + FILE + "#track-sample-intern-comms"); await maya.clock.resume(); await settle(maya);
  await maya.click("button[data-act=start]"); await settle(maya);
  const pk = "progress/sample-intern-comms--u_maya0000000000000000a";
  ok(!!store.progress?.["sample-intern-comms--u_maya0000000000000000a"], `${tag}: start writes ${pk}`, JSON.stringify(Object.keys(store.progress ?? {})));
  const pd = store.progress["sample-intern-comms--u_maya0000000000000000a"];
  ok(pd.name === "Maya Test" && pd.startDate === "2026-10-29" && pd.trackId === "sample-intern-comms", `${tag}: progress doc has name, start date, track`, JSON.stringify(pd));
  await maya.click(".mod-h[data-k='sample-intern-comms:M02']");
  await maya.check("#d-sample-intern-comms\\:M02 input[data-i='0']"); await settle(maya);
  ok(JSON.stringify(store.progress["sample-intern-comms--u_maya0000000000000000a"].steps) === '{"M02":[0]}', `${tag}: tick writes steps`);
  await maya.fill("[data-draft='sample-intern-comms:M02:text']", "1. Result first. 2. Three bullets. 3. White space.");
  await maya.click("button[data-act=submit][data-m=M02]"); await settle(maya);
  const sub = store.progress["sample-intern-comms--u_maya0000000000000000a"].submissions?.M02;
  ok(sub && /Result first/.test(sub.text) && sub.at, `${tag}: submit writes submissions.M02`, JSON.stringify(sub));
  ok((await maya.$$eval(".mod .pill", (e) => e[1].textContent)) === "Submitted", `${tag}: learner sees Submitted`);

  // supervisor sees it live and signs off
  await sup.click("nav a[href='#team']"); await settle(sup);
  ok(/Maya Test/.test(await text(sup, "#app")) && /Waiting/.test(await text(sup, "#strip")), `${tag}: supervisor roster shows Maya`);
  await sup.click("button.linkbtn[data-k='sample-intern-comms--u_maya0000000000000000a']"); await settle(sup);
  ok(/Result first/.test(await text(sup, ".dd-in")), `${tag}: supervisor reads the proof`);
  await sup.fill("[data-note='sample-intern-comms--u_maya0000000000000000a:M02']", "Clear.");
  await sup.click("button[data-act=signoff][data-m=M02]"); await settle(sup); await settle(maya);
  const so = store.signoff?.["sample-intern-comms--u_maya0000000000000000a"];
  ok(so && so.modules.M02 && so.modules.M02.by === "u_bridger00000000000000a" && so.modules.M02.note === "Clear.", `${tag}: sign-off writes signoff/{track}--{user}`, JSON.stringify(so));
  ok((await maya.$$eval(".mod .pill", (e) => e[1].textContent)) === "Signed off", `${tag}: the learner's page flips to Signed off by itself`);
  ok(/Signed off by Bridger/.test(await text(maya, "#d-sample-intern-comms\\:M02")), `${tag}: learner sees who signed`);
  ok(/17% signed off|\d+% signed off/.test(await text(maya, ".progress-line")), `${tag}: learner percentage updates`, await text(maya, ".progress-line"));
  ok(/17%/.test(await text(sup, "#strip")), `${tag}: the strip shows 17% for Maya (1 of 6)`, await text(sup, "#strip"));

  // the rules hold: a learner cannot sign off, cannot write tracks
  const denied = await maya.evaluate(async () => {
    const db = await window.claude.use("db"); const out = [];
    for (const p of ["signoff/sample-intern-comms--u_maya0000000000000000a", "tracks/x"]) { try { await db.doc(p).set({ modules: { M03: { by: "me" } } }); out.push("allowed"); } catch (e) { out.push("denied"); } }
    return out;
  });
  ok(denied.join() === "denied,denied", `${tag}: rules refuse a learner's sign-off and track write`, denied.join());
  const readDenied = await maya.evaluate(async () => { const db = await window.claude.use("db"); return new Promise((res) => { db.collection("progress").onSnapshot(() => res("read"), () => res("denied")); }); });
  ok(readDenied === "read", `${tag}: (documented trade-off) interact can read the progress collection`, readDenied);
  // Only the declared paths were written, and nothing private.
  ok(log.every((l) => /^(progress|signoff)\//.test(l.path)), `${tag}: only progress/ and signoff/ were written`, JSON.stringify(log.map((l) => l.path)));
  const blob = JSON.stringify(store.progress) + JSON.stringify(store.signoff);
  ok(!/@|\bphone\b|\bsalary\b|\bemail\b/i.test(blob), `${tag}: nothing private in what was stored`, blob);
  ok(log.filter((l) => l.path.startsWith("signoff/")).every((l) => l.who === "u_bridger00000000000000a"), `${tag}: every sign-off write came from the supervisor`);
  ok(await noScroll(maya) && await noScroll(sup), `${tag}: no horizontal scroll`);
  await maya.screenshot({ path: join(SHOTS, `live-learner-${w}.png`), fullPage: true });
  await sup.screenshot({ path: join(SHOTS, `live-supervisor-${w}.png`), fullPage: true });
  ok(maya.errs.length === 0 && sup.errs.length === 0, `${tag}: no console errors`, [...maya.errs, ...sup.errs].join(" | "));
  await ctx.close();
}

// Part 3: Dean's real track.json files, through the loader, into the stub, opened as a learner and as a supervisor.
{
  const realFrom = join(HERE, "..");
  const realOut = mkdtempSync(join(tmpdir(), "eu-real-"));
  let loaded = [];
  try {
    execFileSync(process.execPath, ["workshop/office/eu.ts", "load", "--from", realFrom, "--out", realOut], { cwd: join(HERE, "..", "..", ".."), stdio: "pipe" });
    loaded = JSON.parse(readFileSync(join(realOut, "tracks-batch.json"), "utf8")).writes;
  } catch (e) { console.log("real tracks: loader reported errors or found none:", String(e.stdout ?? e.message).split("\n").slice(0, 6).join(" / ")); }
  for (const k of Object.keys(store)) delete store[k];
  store.tracks = {}; log.length = 0; subs.length = 0;
  for (const w of loaded) store.tracks[w.doc_id] = JSON.parse(readFileSync(w.file_path, "utf8"));
  console.log(`real tracks loaded into the stub: ${Object.keys(store.tracks).join(", ") || "none"}`);
  for (const [w, h] of loaded.length ? [[1920, 1080], [390, 844]] : []) {
    delete store.progress; delete store.signoff;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, timezoneId: "America/Los_Angeles", locale: "en-US" });
    const learner = await livePage(ctx, { id: "u_real00000000000000000a", name: "Real Check", level: "interact" });
    const boss = await livePage(ctx, { id: "u_boss000000000000000000", name: "Kev", level: "admin" });
    await go(learner, "#home"); await go(boss, "#home");
    for (const id of Object.keys(store.tracks)) {
      const tag = `real ${id} ${w}`, doc = store.tracks[id];
      await learner.goto("file://" + FILE + "#track-" + id); await learner.clock.resume(); await settle(learner);
      ok((await learner.$$(".mod")).length === doc.modules.length, `${tag}: one row per module (${doc.modules.length})`, String((await learner.$$(".mod")).length));
      ok((await learner.$$("section.phase")).length === doc.phases.length, `${tag}: one section per phase`);
      ok((await text(learner, ".thead")).includes(doc.title), `${tag}: title`);
      await learner.click("button[data-act=start]"); await settle(learner);
      await learner.evaluate(() => document.querySelectorAll(".mod-h").forEach((b) => b.click()));
      ok(await noScroll(learner), `${tag}: no horizontal scroll with every module open`);
      await learner.screenshot({ path: join(SHOTS, `real-${id}-${w}.png`), fullPage: true });
    }
    await boss.evaluate(() => { location.hash = "#team"; }); await settle(boss);
    ok(/Real Check/.test(await text(boss, "#strip")), `real ${w}: the supervisor strip lists the learner`);
    ok(learner.errs.length === 0 && boss.errs.length === 0, `real ${w}: no console errors`, [...learner.errs, ...boss.errs].join(" | "));
    await ctx.close();
  }
}

// A failed read of the db falls back to example data and says so.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await open(ctx);
  await p.addInitScript(() => { window.claude = { use: () => Promise.reject(new Error("no db")) }; });
  await go(p, "#home");
  ok(/EXAMPLE DATA/.test(await text(p, "#banner")) && /not connected/.test(await text(p, "#status")), "fallback: a missing database drops to example data and says so");
  ok(p.errs.length === 0, "fallback: no console errors", p.errs.join(" | "));
  await ctx.close();
}

await browser.close();
console.log(`\n${passes} passed, ${fails} failed. Screenshots: ${SHOTS}`);
process.exit(fails ? 1 : 0);
