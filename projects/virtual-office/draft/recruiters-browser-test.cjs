const { chromium } = require('playwright');
// Browser check for "Recruiters · Crelate · this week" on the Command Center page (Q, 28 Oct 2026).
// Needs the `playwright` package and a Chromium (PW_CHROME or /opt/pw-browsers).  Run:
//   NODE_PATH=/opt/node-tools/node_modules SHOTS=/some/dir node projects/virtual-office/draft/recruiters-browser-test.cjs
const S = (process.env.SHOTS || require('os').tmpdir()) + '/';
const URL = 'file://' + require('path').resolve(__dirname, 'eden-office.html');
const results = [];
const ok = (name, cond, extra) => { results.push([cond ? 'PASS' : 'FAIL', name, extra || '']); };
const NOW = '2026-10-28T10:15:00-07:00';

// a stub Office database whose meta/crelate is whatever the test hands it (names and counts are invented)
const doc = (over) => Object.assign({
  schema: 1, asOf: '2026-10-28T17:05:00Z', syncedAt: '2026-10-28T17:05:10Z', source: 'Crelate, read-only (API v3, pulled by the hourly office run)', live: true, ageMin: 5,
  weekOf: '2026-10-26', through: '2026-10-28', weekIsCurrent: true, todayCurrent: true, weekBasis: 'monday', perDay: 15, weekdaysCounted: 3,
  recruiters: [
    { name: 'Wren', inGoal: true, week: { rps: 12, mps: 0, ptcs: 1, subs: 0, ftis: 0 }, today: { rps: 2, mps: 0, ptcs: 0, subs: 0, ftis: 0 }, standardToDate: 30, gap: -18, behind: true },
    { name: 'Rowan', inGoal: true, week: { rps: 47, mps: 1, ptcs: 3, subs: 2, ftis: 1 }, today: { rps: 9, mps: 0, ptcs: 1, subs: 0, ftis: 0 }, standardToDate: 30, gap: 17, behind: false },
    { name: 'Jules', inGoal: false, week: { rps: 0, mps: 0, ptcs: 0, subs: 0, ftis: 0 }, today: { rps: 0, mps: 0, ptcs: 0, subs: 0, ftis: 0 }, standardToDate: null, gap: null, behind: false },
  ],
  team: { week: { rps: 59, mps: 1, ptcs: 4, subs: 2, ftis: 1 }, today: { rps: 11, mps: 0, ptcs: 1, subs: 0, ftis: 0 }, standardToDate: 60, gap: -1, behind: 1, people: 3 },
  notes: ['Standard: 15 RPs a day.'],
}, over || {});
const stubInit = (crelateDoc) => {
  const store = { 'meta/crelate': crelateDoc }, un = []; window.__un = un;
  const dd = (p) => ({ onSnapshot(cb) { setTimeout(() => cb({ exists: p in store, data: () => store[p] }), 0); const f = () => { window.__unsubbed = (window.__unsubbed || []).concat(p); }; un.push(p); return f; }, set() { return Promise.resolve(); }, delete() { return Promise.resolve(); } });
  const col = (p) => ({ orderBy() { return this; }, limit() { return this; }, onSnapshot() { return () => {}; } });
  window.claude = { use(name) { return Promise.resolve(name === 'db' ? { doc: dd, collection: col } : null); } };
};

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] }).catch(async () => chromium.launch({ args: ['--no-sandbox'] }));
  async function open(w, h, hash, initDoc) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, timezoneId: 'America/Los_Angeles', locale: 'en-US' });
    const page = await ctx.newPage(); const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    if (initDoc !== undefined) await page.addInitScript(stubInit, initDoc);
    await page.clock.install({ time: new Date(NOW) });
    await page.goto(URL + (hash || '#floor')); await page.clock.resume(); await page.waitForTimeout(500);
    return { page, ctx, errs };
  }
  const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const names = (page) => page.$$eval('.lb-rec tr.rec-row:not(.us) td.nm', (els) => els.map((e) => e.textContent.replace(/\s*behind pace$/, '').trim()));

  // 1. Floor, 1920x1080, example data
  let { page, ctx, errs } = await open(1920, 1080, '#floor');
  ok('1920 floor: the Recruiters block is in the leaderboard', await page.isVisible('.lb-rec'));
  ok('1920 floor: heading', (await page.textContent('.lb-rec h3')) === 'Recruiters · Crelate · this week');
  ok('1920 floor: columns Pos, Recruiter, RPs / std, PTC, Sub, FTI', JSON.stringify(await page.$$eval('.lb-rec th', (e) => e.map((x) => x.textContent))) === JSON.stringify(['Pos', 'Recruiter', 'RPs / std', 'PTC', 'Sub', 'FTI']));
  ok('1920 floor: three columns beside the agents table and the records', await page.evaluate(() => getComputedStyle(document.querySelector('#lb-body')).gridTemplateColumns.split(' ').length === 3));
  ok('1920 floor: the agents table is still there', await page.isVisible('#lb-body > div:first-child table.golf'));
  const n1 = await names(page);
  ok('1920 floor: sorted by RPs, trainee last', JSON.stringify(n1) === JSON.stringify(['Rowan', 'Sasha', 'Tate', 'Wren', 'Jules']), JSON.stringify(n1));
  ok('1920 floor: a team total row', (await page.textContent('.lb-rec tr.us')).startsWith('Team'));
  ok('1920 floor: red mark on the recruiter behind pace (and only that one)', (await page.$$('.lb-rec tr.behind')).length === 1 && (await page.textContent('.lb-rec tr.behind td.nm')).includes('Wren'));
  ok('1920 floor: the mark is red, not decoration only (a hidden word for readers)', await page.evaluate(() => { const m = document.querySelector('.lb-rec tr.behind .mk'); return !!m && getComputedStyle(m).backgroundColor === 'rgb(176, 58, 46)' && /behind pace/.test(document.querySelector('.lb-rec tr.behind td.nm').textContent); }));
  ok('1920 floor: RPs shown with the standard to date', (await page.textContent('.lb-rec tr.rec-row td.rp')).replace(/\s+/g, ' ').trim() === '41 / 30');
  const foot = await page.textContent('.lb-rec');
  ok('1920 floor: footer says as of and Crelate, read-only', /As of .* PT/.test(foot) && /Crelate, read-only/.test(foot), foot.slice(-260));
  ok('1920 floor: table fits without its own scroll', await page.evaluate(() => { const s = document.querySelector('.lb-rec .scroll'); return s.scrollWidth <= s.clientWidth + 1; }));
  ok('1920 floor: no page scroll sideways', await noScroll(page));
  await page.locator('#lb').screenshot({ path: S + 'rec-1920-floor.png' });
  await page.click('.lb-rec tr.rec-row >> nth=0'); await page.waitForTimeout(200);
  ok('1920 floor: a row opens the sheet for that recruiter', await page.isVisible('#sheet') && (await page.textContent('#sheet-title')) === 'Rowan');
  const sheet = (await page.textContent('#panel')).replace(/\s+/g, ' ');
  const cells = await page.$$eval('#panel table tr', (rs) => rs.map((r) => [...r.children].map((c) => c.textContent.trim())));
  ok('1920 floor: sheet has today against the week and the standard', JSON.stringify(cells[0]) === JSON.stringify(['Measure', 'Today', 'This week', 'Standard to date']) && JSON.stringify(cells[1]) === JSON.stringify(['RPs (recruiting calls)', '9', '41', '30 \u00b7 15 a day']) && cells.length === 6, JSON.stringify(cells));
  ok('1920 floor: sheet says ahead or behind', /RPs ahead of the standard to date/.test(sheet));
  await page.screenshot({ path: S + 'rec-1920-sheet.png' });
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  ok('1920 floor: Esc stands up', !(await page.isVisible('#sheet')));
  await page.focus('.lb-rec tr.rec-row >> nth=3'); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  ok('1920 floor: keyboard Enter opens a row too (Wren, behind)', (await page.textContent('#sheet-title')) === 'Wren' && /RPs behind the standard to date/.test(await page.textContent('#panel')));
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await page.click('.lb-rec tr.us'); await page.waitForTimeout(200);
  ok('1920 floor: the Team row opens a team sheet', (await page.textContent('#sheet-title')) === 'Team' && /behind pace/.test(await page.textContent('#panel')));
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await page.click('#sw-share'); await page.waitForTimeout(150);
  ok('1920 floor: Screen share hides the recruiters', !(await page.isVisible('.lb-rec')) && (await page.$$('.lb-rec')).length === 0 && !(await page.textContent('#lb-body')).includes('Rowan'));
  ok('1920 floor: the agents leaderboard stays under Screen share', await page.isVisible('#lb-body table.golf'));
  await page.click('#sw-share'); await page.waitForTimeout(150);
  ok('1920 floor: and comes back when sharing stops', await page.isVisible('.lb-rec'));
  ok('1920 floor: no console errors', errs.length === 0, errs.join(' | '));
  await ctx.close();

  // 2. 1366 laptop keeps three columns (the page is 1200 wide at most); 1000 wide drops the recruiters to a full-width row beneath the other two
  ({ page, ctx, errs } = await open(1366, 800, '#floor'));
  ok('1366: three columns, table fits without its own scroll', await page.evaluate(() => getComputedStyle(document.querySelector('#lb-body')).gridTemplateColumns.split(' ').length === 3 && (() => { const s = document.querySelector('.lb-rec .scroll'); return s.scrollWidth <= s.clientWidth + 1; })()));
  ok('1366: no page scroll sideways', await noScroll(page));
  await page.locator('#lb').screenshot({ path: S + 'rec-1366.png' });
  ok('1366: no console errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
  ({ page, ctx, errs } = await open(1000, 800, '#floor'));
  ok('1000: recruiters take the full row under the agents and records', await page.evaluate(() => { const r = document.querySelector('.lb-rec').getBoundingClientRect(), l = document.querySelector('#lb-body > div:first-child').getBoundingClientRect(); return r.top >= l.bottom - 1 && r.width > l.width * 1.5; }));
  ok('1000: no page scroll sideways', await noScroll(page));
  await page.locator('#lb').screenshot({ path: S + 'rec-1000.png' });
  ok('1000: no console errors', errs.length === 0, errs.join(' | '));
  await ctx.close();

  // 3. Phone 390x844
  ({ page, ctx, errs } = await open(390, 844, '#floor'));
  ok('390: the leaderboard starts closed on a phone', !(await page.evaluate(() => document.querySelector('#lb').open)));
  await page.click('#lb > summary'); await page.waitForTimeout(150);
  ok('390: the recruiters table shows', await page.isVisible('.lb-rec table'));
  ok('390: one column', await page.evaluate(() => getComputedStyle(document.querySelector('#lb-body')).gridTemplateColumns.split(' ').length === 1));
  ok('390: no page scroll sideways', await noScroll(page), String(await page.evaluate(() => document.documentElement.scrollWidth)));
  ok('390: red mark present', (await page.$$('.lb-rec tr.behind')).length === 1);
  await page.locator('#lb').screenshot({ path: S + 'rec-390.png' });
  await page.click('.lb-rec tr.rec-row >> nth=1'); await page.waitForTimeout(250);
  ok('390: a row opens the sheet', await page.isVisible('#sheet') && (await page.textContent('#sheet-title')) === 'Sasha');
  ok('390: the sheet does not scroll the page sideways', await noScroll(page));
  await page.screenshot({ path: S + 'rec-390-sheet.png' });
  ok('390: no console errors', errs.length === 0, errs.join(' | '));
  await ctx.close();

  // 4. Today mode, 1920 and 390: the ribbon is unchanged and the leaderboard stays out of the way
  for (const [w, hgt] of [[1920, 1080], [390, 844]]) {
    ({ page, ctx, errs } = await open(w, hgt, '#today'));
    ok(`today ${w}: today mode on`, await page.evaluate(() => document.documentElement.classList.contains('today-mode')));
    ok(`today ${w}: the leaderboard (and the recruiters) are not in Today`, !(await page.isVisible('#lb')) && !(await page.isVisible('.lb-rec')));
    ok(`today ${w}: the ribbon still has its seven cells`, (await page.$$('#board-grid .cell')).length === 7 || w === 390, String((await page.$$('#board-grid .cell')).length));
    ok(`today ${w}: no page scroll sideways`, await noScroll(page));
    await page.screenshot({ path: S + `rec-today-${w}.png` });
    await page.click('#m-floor'); await page.waitForTimeout(250);
    ok(`today ${w}: back to Floor shows the recruiters (open it on a phone)`, w === 390 ? (await page.click('#lb > summary'), await page.isVisible('.lb-rec')) : await page.isVisible('.lb-rec'));
    ok(`today ${w}: no console errors`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // 5. Live path, 1920: reads meta/crelate, names the age of a stale file, drops it under Screen share
  ({ page, ctx, errs } = await open(1920, 1080, '#floor', doc()));
  ok('live: reads meta/crelate and sorts by RPs', JSON.stringify(await names(page)) === JSON.stringify(['Rowan', 'Wren', 'Jules']), JSON.stringify(await names(page)));
  ok('live: no stale warning on a fresh live read', !(await page.isVisible('.lb-rec p.warn')));
  ok('live: team standard shown', (await page.textContent('.lb-rec tr.us td.rp')).replace(/\s+/g, ' ').trim() === '59 / 60');
  ok('live: Jules (trainee) has no standard and no red mark', (await page.textContent('.lb-rec tr.rec-row:not(.us) >> nth=2 >> td.rp')).replace(/\s+/g, ' ').trim() === '0 / –');
  await page.locator('#lb').screenshot({ path: S + 'rec-live-1920.png' });
  await page.click('#sw-share'); await page.waitForTimeout(150);
  ok('live: Screen share unsubscribes from meta/crelate and clears it', await page.evaluate(() => (window.__unsubbed || []).includes('meta/crelate')) && (await page.$$('.lb-rec')).length === 0 && !(await page.textContent('#lb-body')).includes('Rowan'));
  await page.click('#sw-share'); await page.waitForTimeout(250);
  ok('live: and resubscribes when sharing stops', (await names(page)).length === 3);
  ok('live: no console errors', errs.length === 0, errs.join(' | '));
  await ctx.close();

  // 5b. A saved file five days old: the true age and "not a live pull" show
  ({ page, ctx, errs } = await open(1920, 1080, '#floor', doc({ asOf: '2026-10-23T16:56:26.747Z', live: false, weekOf: '2026-10-19', through: '2026-10-23', weekIsCurrent: false, todayCurrent: false, source: 'Round Table board file', recruiters: doc().recruiters.map((r) => Object.assign({}, r, { today: null })), team: Object.assign({}, doc().team, { today: null }) })));
  const stale = await page.textContent('.lb-rec');
  ok('stale file: says 5d ago and not a live pull', /5d ago/.test(stale) && /not a live pull/.test(stale), stale.slice(-330));
  ok('stale file: warns it is another week', /not this week/.test(stale));
  await page.click('.lb-rec tr.rec-row >> nth=0'); await page.waitForTimeout(200);
  ok('stale file: the sheet has no Today figure and says why', /Today is blank/.test(await page.textContent('#panel')) && /–/.test(await page.textContent('#panel')));
  await page.screenshot({ path: S + 'rec-stale-sheet.png' });
  ok('stale file: no console errors', errs.length === 0, errs.join(' | '));
  await ctx.close();

  // 5c. Live database but no document yet
  ({ page, ctx, errs } = await open(1920, 1080, '#floor', undefined));
  await ctx.close();
  {
    const ctx3 = await browser.newContext({ viewport: { width: 1920, height: 1080 }, timezoneId: 'America/Los_Angeles', locale: 'en-US' });
    const p3 = await ctx3.newPage(); const e3 = [];
    p3.on('console', (m) => { if (m.type() === 'error') e3.push(m.text()); }); p3.on('pageerror', (e) => e3.push('pageerror: ' + e.message));
    await p3.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await p3.addInitScript(stubInit, null); await p3.addInitScript(() => { const o = window.claude.use; window.claude.use = (n) => o(n).then((db) => db && Object.assign({}, db, { doc: (p) => ({ onSnapshot(cb) { setTimeout(() => cb({ exists: false, data: () => null }), 0); return () => {}; } }) })); });
    await p3.clock.install({ time: new Date(NOW) }); await p3.goto(URL + '#floor'); await p3.clock.resume(); await p3.waitForTimeout(500);
    ok('no document yet: the block says it is waiting, not zeros', /Waiting for the office run/.test(await p3.textContent('.lb-rec')));
    ok('no document yet: no console errors', e3.length === 0, e3.join(' | '));
    await ctx3.close();
  }
  await browser.close();
  console.log(results.map((r) => r.join('  ')).join('\n'));
  console.log(results.filter((r) => r[0] === 'FAIL').length + ' failed of ' + results.length);
})().catch((e) => { console.error(e); process.exit(1); });
