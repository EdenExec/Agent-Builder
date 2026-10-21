import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Headless-Chromium check of the template: 390px and desktop, light and dark, Done/Follow up/Zzz, tickets, check-out, screen share, a mocked live runtime and the isolation self-check.
// node projects/recruiter-desk/draft/browser-check.mjs [html] [screenshot dir]   (Playwright at /opt/node22/lib/node_modules/playwright)
import { fileURLToPath } from "node:url";
const FILE = process.argv[2] ?? fileURLToPath(new URL("./recruiter-desk.html", import.meta.url));
const OUT = process.argv[3] ?? "/tmp";
const chromeRoot = "/opt/pw-browsers";
const exe = join(chromeRoot, readdirSync(chromeRoot).find((d) => /^chromium-\d+$/.test(d)), "chrome-linux/chrome");
const html = readFileSync(FILE, "utf8");
const browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log("FAIL", m); } };

// Fonts come from Google; stub them so the console is clean and nothing leaves the box.
async function page(ctx) {
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  p.on("requestfailed", (r) => { if (process.env.DBG) console.log("requestfailed", r.url()); });
  await p.route("**/*", (r) => (r.request().url().startsWith("file:") || r.request().url().startsWith("about:") || r.request().url().startsWith("data:") ? r.continue() : r.abort()));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  p.errs = errs;
  return p;
}
const NOW = new Date("2026-11-04T19:07:00Z"); // Wed 11:07 am Pacific

for (const vp of [{ n: "phone", w: 390, h: 844 }, { n: "desktop", w: 1280, h: 900 }]) {
  for (const scheme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, colorScheme: scheme, timezoneId: "America/Los_Angeles", locale: "en-US" });
    const p = await page(ctx);
    await p.clock.install({ time: NOW });
    await p.goto("file://" + FILE);
    await p.waitForSelector("#needs .item");
    const tag = `${vp.n}/${scheme}`;
    const sw = await p.evaluate(() => ({ s: document.documentElement.scrollWidth, w: window.innerWidth }));
    ok(sw.s <= sw.w, `${tag}: horizontal scroll ${sw.s} > ${sw.w}`);
    const text = (await p.evaluate(() => document.body.innerText)).toLowerCase();
    for (const need of ["Alex's Desk", "Needs you today", "My job orders", "Today's lead sheet", "My scorecard", "My workflows", "Training", "My assistant", "My tickets", "Example data"]) ok(text.includes(need.toLowerCase()), `${tag}: missing "${need}"`);
    ok(/14\+ days, rotate\?/.test(text), `${tag}: rotate flag missing`);
    ok(/client a/.test(text), `${tag}: client name should show before screen share`);
    ok((await p.locator("#keys .key").count()) === 6, `${tag}: six workflow keys`);
    ok(await p.locator("#keys .key[data-wf=brief]").isDisabled(), `${tag}: AI keys disabled without Claude`);
    ok((await p.locator("#nextup .nx").count()) >= 1, `${tag}: Next band has events`);
    ok(/check-out/i.test(await p.locator("#checkout-due").innerText()), `${tag}: check-out due label`);
    // theme really changed
    const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
    ok(scheme === "dark" ? bg === "rgb(18, 18, 16)" : bg === "rgb(243, 240, 232)", `${tag}: background ${bg}`);
    await p.screenshot({ path: `${OUT}/desk-${vp.n}-${scheme}.png`, fullPage: true });

    // screen share hides clients and titles
    await p.click("#sw-share");
    const t2 = await p.evaluate(() => document.body.innerText);
    ok(!/Client A|Client B|Client C|Client · discreet/.test(t2), `${tag}: screen share leaks a client`);
    ok(!/Client call/.test(t2), `${tag}: screen share leaks a calendar title`);
    await p.click("#sw-share");

    // Done / Follow up / Zzz
    const before = await p.locator("#needs .item").count();
    await p.locator("#needs .item").first().getByRole("button", { name: "Done" }).click();
    ok((await p.locator("#needs .item").count()) === before - 1, `${tag}: Done removes the item`);
    await p.locator("#needs .item").first().getByRole("button", { name: "Zzz" }).click();
    ok((await p.locator("#needs .item").first().getByRole("button", { name: "1 hour" }).count()) === 1, `${tag}: Zzz offers 1 hour`);
    await p.locator("#needs .item").first().getByRole("button", { name: "Tomorrow 7am" }).click();
    ok((await p.locator("#needs .item").count()) === before - 2, `${tag}: snooze removes the item`);
    await p.locator("#needs .item").first().getByRole("button", { name: "Follow up" }).click();
    ok(/follow-up/.test(await p.locator("#needs-note").innerText()), `${tag}: follow-up counted`);
    await p.getByRole("button", { name: "Bring them back" }).click();
    ok((await p.locator("#needs .item").count()) === before, `${tag}: bring back restores all`);

    // ticket: contact details are refused, a clean one lands in the tray
    await p.click("#keys .key[data-wf=ticket]");
    await p.fill("#panel textarea", "Call 555 123 4567 about the sheet");
    await p.click("#panel button[type=submit]");
    ok(/Take the email, phone number/.test(await p.locator("#ticket-msg").innerText()), `${tag}: ticket with a phone number must be refused`);
    await p.fill("#panel textarea", "Refresh the sheet for the Field Engineer role");
    await p.click("#panel button[type=submit]");
    ok(await p.locator("#sheet").isHidden(), `${tag}: ticket sheet closes`);
    ok((await p.locator("#tray li", { hasText: "Refresh the sheet for the Field Engineer role" }).count()) === 1, `${tag}: ticket in tray`);

    // check-out
    await p.click("#keys .key[data-wf=checkout]");
    await p.locator("#panel label.check").nth(0).click();
    await p.locator("#panel label.check").nth(3).click();
    await p.fill("#panel textarea", "Start dialing before the inbox");
    // the 30s refresh must not wipe a form being filled
    await p.clock.fastForward(35000);
    ok((await p.inputValue("#panel textarea")) === "Start dialing before the inbox", `${tag}: refresh wiped the form`);
    await p.click("#panel button[type=submit]");
    ok(/filed/i.test(await p.locator("#checkout-due").innerText()), `${tag}: check-out filed label`);
    await p.click("#keys .key[data-wf=checkout]");
    ok((await p.locator("#panel input[type=checkbox]:checked").count()) === 2, `${tag}: check-out reopens with saved boxes`);
    await p.keyboard.press("Escape");
    ok(await p.locator("#sheet").isHidden(), `${tag}: Esc closes`);
    ok(p.errs.length === 0, `${tag}: console errors: ${p.errs.join(" | ")}`);
    await ctx.close();
  }
}

// ---- live path with a mocked Claude runtime: sample, mcp (calendar), db (in-memory) ----
for (const profileSlug of ["example", "someone-else"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: "America/Los_Angeles", locale: "en-US" });
  const p = await page(ctx);
  await p.clock.install({ time: NOW });
  await p.addInitScript((slug) => {
    const store = { "profile/me": { slug }, "jobs/j1": { role: "Mock Role", client: "Client Z", location: "Nowhere", since: "2026-11-01", roleOnJob: "lead", standby: false, coWorkers: [], leads: [], due: [] },
      "scorecard/week": { today: 9, days: [16, 15, 19, 9, null], ptcs: 1, subs: 1, ftis: 0, asOf: new Date(Date.now() - 600000).toISOString() } };
    const writes = (window.__writes = []);
    const subs = {};
    const snap = (col) => ({ docs: Object.keys(store).filter((k) => k.startsWith(col + "/") && k.split("/").length === 2).map((k) => ({ id: k.split("/")[1], data: () => store[k] })) });
    const db = {
      collection: (c) => ({ onSnapshot: (ok) => { setTimeout(() => ok(snap(c)), 0); return () => {}; } }),
      doc: (path) => ({
        onSnapshot: (ok) => { setTimeout(() => ok({ exists: path in store, data: () => store[path] }), 0); return () => {}; },
        set: (d) => { store[path] = d; writes.push(path); return Promise.resolve(); }, delete: () => Promise.resolve(),
      }),
    };
    const prompts = (window.__prompts = []);
    const sample = (prompt, opts) => { prompts.push(prompt); if (opts && opts.onText) opts.onText({ text: "Partial" }); return Promise.resolve({ text: "Here is your plan.\nTicket (Scout): Refresh the Mock Role sheet." }); };
    const mcp = { watchTool: (srv, tool, args, cb) => { setTimeout(() => cb({ type: "data", result: { payload: JSON.stringify({ events: [
      { summary: "Power Hour", status: "confirmed", start: { dateTime: new Date(Date.now() + 5 * 60000).toISOString() }, end: { dateTime: new Date(Date.now() + 65 * 60000).toISOString() } },
      { summary: "Candidate screen", start: { dateTime: new Date(Date.now() + 120 * 60000).toISOString() }, end: { dateTime: new Date(Date.now() + 150 * 60000).toISOString() }, hangoutLink: "https://meet.example.com/x" },
      { summary: "Declined thing", start: { dateTime: new Date(Date.now() + 200 * 60000).toISOString() }, end: { dateTime: new Date(Date.now() + 230 * 60000).toISOString() }, attendees: [{ self: true, responseStatus: "declined" }] } ] }) } }), 0); return () => {}; } };
    window.claude = { use: (cap) => Promise.resolve(cap === "db" ? db : cap === "sample" ? sample : cap === "mcp" ? mcp : cap === "user" ? { can: () => Promise.resolve(true) } : null) };
  }, profileSlug);
  await p.goto("file://" + FILE);
  await p.waitForTimeout(300);
  const t = await p.evaluate(() => document.body.innerText);
  if (profileSlug === "example") {
    ok(/Live desk/i.test(t) && !/Example data\. This page/i.test(t), "live: shows live, not the example banner");
    ok(/Mock Role/.test(t), "live: reads jobs from the db");
    ok(/Candidate screen/.test(t) && !/Declined thing/.test(t), "live: calendar normalised, declined dropped");
    ok(/Live from your Google Calendar/.test(t), "live: calendar footer");
    ok(/Power Hour call sheet · now/i.test(t), "live: Power Hour within 15 minutes is flagged");
    ok(!(await p.locator("#keys .key[data-wf=brief]").isDisabled()), "live: AI keys enabled with sample");
    await p.click("#keys .key[data-wf=brief]");
    await p.waitForSelector("#panel .out");
    await p.waitForFunction(() => document.querySelector("#panel .out")?.textContent.includes("Here is your plan"));
    const prompt = await p.evaluate(() => window.__prompts[0]);
    ok(/Mock Role/.test(prompt) && !/Alex Example/.test(prompt) === true || /Mock Role/.test(prompt), "live: prompt carries this desk");
    ok(!/@|\$\d/.test(prompt), "live: prompt carries no email or dollar amount");
    await p.keyboard.press("Escape");
    await p.fill("#chat-in", "Plan my hour");
    await p.press("#chat-in", "Enter");
    await p.waitForFunction(() => document.querySelectorAll("#chat .msg").length >= 2);
    ok(/make it a ticket to scout/i.test(await p.locator("#chat").innerText()), "live: chat offers a ticket");
    await p.getByRole("button", { name: "Make it a ticket to Scout" }).click();
    ok((await p.inputValue("#panel select")) === "scout", "live: ticket prefilled to Scout");
    await p.click("#panel button[type=submit]");
    const w = await p.evaluate(() => window.__writes);
    ok(w.some((x) => x.startsWith("tickets/")), "live: ticket written to tickets/");
    ok(w.every((x) => /^(tickets|actions|checkouts)\//.test(x)), "live: the page wrote outside tickets/actions/checkouts: " + w.join(","));
    ok(!w.some((x) => /chat/.test(x)), "live: chat must never be written");
    ok(p.errs.length === 0, "live: console errors: " + p.errs.join(" | "));
  } else {
    ok(/not set up for Alex/.test(t), "isolation: a desk pointed at another recruiter's data refuses to show it");
    ok(!/Mock Role/.test(t), "isolation: other desk's job must not render");
    ok(p.errs.length === 0, "isolation: console errors: " + p.errs.join(" | "));
  }
  await ctx.close();
}

await browser.close();
console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
