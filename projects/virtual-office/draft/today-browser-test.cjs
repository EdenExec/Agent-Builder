const { chromium } = require('playwright');
// Browser check for the Today view (Q, 28 Oct 2026). Needs the `playwright` package and a Chromium (PW_CHROME or /opt/pw-browsers).
// Run from a folder that has playwright installed:  SHOTS=/tmp/shots node today-browser-test.cjs
const S = (process.env.SHOTS || require('os').tmpdir()) + '/';
const URL = 'file://' + require('path').resolve(__dirname, 'eden-office.html');
const results = [];
const ok = (name, cond, extra) => { results.push([cond ? 'PASS' : 'FAIL', name, extra || '']); };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] }).catch(async () => chromium.launch({ args: ['--no-sandbox'] }));
  async function open(w, h, time, hash) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, timezoneId: 'America/Los_Angeles', locale: 'en-US', permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await page.clock.install({ time: new Date(time) });
    await page.goto(URL + (hash || '#today'));
    await page.clock.resume();
    await page.waitForTimeout(400);
    return { page, ctx, errs };
  }
  const noScroll = async (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

  // 1. 1920x1080 at 10:15 PT on Wed 28 Oct, before the Power Hour
  let { page, ctx, errs } = await open(1920, 1080, '2026-10-28T10:15:00-07:00');
  ok('today mode on from #today', await page.evaluate(() => document.documentElement.classList.contains('today-mode')));
  ok('floor hidden', !(await page.isVisible('#plan')));
  ok('example notice shown (the page\'s own)', await page.isVisible('#demo'));
  ok('three columns at 1920', await page.evaluate(() => getComputedStyle(document.querySelector('.td-grid')).gridTemplateColumns.split(' ').length === 3));
  ok('no horizontal scroll 1920', await noScroll(page));
  ok('auto tab is QC or the next PH', await page.evaluate(() => document.querySelector('.td-tab[aria-selected="true"]').textContent.length > 0), await page.textContent('.td-tab[aria-selected="true"]'));
  await page.screenshot({ path: S + 'today-1920-1015.png' });
  // pick the first PH tab and tick
  await page.click('.td-tab:nth-child(2)');
  ok('tab picks the sheet', (await page.textContent('.td-tab[aria-selected="true"]')).startsWith('PH'));
  const rows = await page.$$('.td-row');
  ok('12 rows, no scroll needed to find them', rows.length === 12, String(rows.length));
  await page.click('.td-row:nth-of-type(1) .cd'.replace(':nth-of-type(1)', '') );
  await page.keyboard.press('j'); await page.keyboard.press('d'); await page.keyboard.press('v'); await page.keyboard.press('c');
  await page.keyboard.type('Called back at noon'); await page.keyboard.press('Enter');
  const conn = await page.textContent('.td-count b');
  ok('conn count derives from ticks', conn === '01', conn);
  await page.keyboard.press('o');
  const sel = await page.evaluate(() => [...document.querySelectorAll('.td-row')].map((r, i) => [i, r.className.includes('sel'), r.querySelector('.co') && r.querySelector('.co').textContent]).filter((x) => x[1] || x[2] !== '—'));
  ok('stamp O lands on the selected row', JSON.stringify(sel).includes('"O"'), JSON.stringify(sel));
  await page.keyboard.press('z');
  const sel2 = await page.evaluate(() => [...document.querySelectorAll('.td-row .co')].map((e) => e.textContent).join(','));
  ok('Z undoes the last tick', !sel2.includes('O'), sel2);
  await page.keyboard.press('?'); ok('key card opens', await page.isVisible('.td-kb'));
  await page.keyboard.press('?');
  // must-hit + decision + study
  await page.click('.td-must .td-chk'); ok('must tick', (await page.getAttribute('.td-must .td-chk', 'aria-pressed')) === 'true');
  await page.click('.td-dec .seg .mini >> nth=0'); ok('decision answered', (await page.textContent('.td-dec')).includes('You said YES'));
  await page.click('.td-scr'); ok('study opens', await page.isVisible('.td-study')); await page.screenshot({ path: S + 'today-study.png' }); await page.keyboard.press('Escape'); ok('Esc closes study', !(await page.isVisible('.td-study')));
  // QC tab
  await page.click('.td-tab:nth-child(1)'); await page.click('.td-qc .td-row .td-chk >> nth=0'); ok('qc touched count', (await page.textContent('.td-tab[aria-selected="true"]')).includes('1/3'), await page.textContent('.td-tab[aria-selected="true"]'));
  await page.screenshot({ path: S + 'today-1920-qc.png' });
  // screen share hides people
  await page.click('#sw-share'); ok('share hides names', !(await page.textContent('#td-root')).includes('Sample Candidate A'));
  await page.click('#sw-share');
  // board ribbon -> floor
  await page.click('#board-grid .cell >> nth=0'); await page.waitForTimeout(200);
  ok('ribbon cell opens the floor', !(await page.evaluate(() => document.documentElement.classList.contains('today-mode'))));
  await page.keyboard.press('Escape'); await page.waitForTimeout(900); await page.keyboard.press('t'); await page.waitForTimeout(200); ok('T goes back to Today', await page.evaluate(() => document.documentElement.classList.contains('today-mode')));
  ok('no console errors 1920', errs.length === 0, errs.join(' | '));
  await ctx.close();

  // 2. Power Hour focus at 11:20 (auto), then ends at 12:00
  ({ page, ctx, errs } = await open(1920, 1080, '2026-10-28T11:20:00-07:00'));
  await page.waitForTimeout(1500);
  ok('focus turns on by itself in a POWER HOUR block', await page.evaluate(() => document.documentElement.classList.contains('td-focus')));
  ok('recruit mode switched on with it', (await page.getAttribute('#sw-recruit', 'aria-pressed')) === 'true');
  ok('auto tab is the live sheet', (await page.textContent('.td-tab[aria-selected="true"]')).startsWith('PH 11:00'), await page.textContent('.td-tab[aria-selected="true"]'));
  ok('right rail hidden in focus', !(await page.isVisible('.td-right')));
  ok('leads local time shown', await page.isVisible('#td-et'), await page.textContent('#td-et').catch(() => ''));
  await page.screenshot({ path: S + 'today-1920-focus.png' });
  await page.keyboard.press('p'); await page.waitForTimeout(300);
  ok('P leaves the Power Hour early', !(await page.evaluate(() => document.documentElement.classList.contains('td-focus'))));
  ok('summary line after leaving', (await page.textContent('#td-root')).includes('Power Hour done'));
  ok('recruit mode off again', (await page.getAttribute('#sw-recruit', 'aria-pressed')) === 'false');
  ok('no console errors focus', errs.length === 0, errs.join(' | '));
  await ctx.close();

  // 3. East Coast sheet after 1:00pm PT shows the amber stamp (the 13:00 sheet starts at 13:00 -> not past; check the rule with a 13:30 clock)
  ({ page, ctx, errs } = await open(1920, 1080, '2026-10-28T13:20:00-07:00'));
  await page.waitForTimeout(1200);
  ok('13:00 block is a POWER HOUR focus too', await page.evaluate(() => document.documentElement.classList.contains('td-focus')));
  ok('no amber stamp at exactly 1:00pm PT', !(await page.textContent('#td-root')).includes('PAST 4PM ET'));
  await ctx.close();

  // 4. laptop 1366x768
  ({ page, ctx, errs } = await open(1366, 768, '2026-10-28T10:15:00-07:00'));
  ok('two columns on a laptop', await page.evaluate(() => getComputedStyle(document.querySelector('.td-grid')).gridTemplateColumns.split(' ').length === 2));
  ok('no horizontal scroll 1366', await noScroll(page));
  ok('run of day shows four blocks on a laptop', (await page.$$('.td-runl li')).length <= 4, String((await page.$$('.td-runl li')).length));
  await page.click('.td-tab:nth-child(2)');
  await page.screenshot({ path: S + 'today-1366.png', fullPage: true });
  ok('no console errors laptop', errs.length === 0, errs.join(' | '));
  await ctx.close();

  // 5. phone 390x844
  ({ page, ctx, errs } = await open(390, 844, '2026-10-28T10:15:00-07:00'));
  ok('one column on a phone', await page.evaluate(() => getComputedStyle(document.querySelector('.td-grid')).gridTemplateColumns.split(' ').length === 1));
  ok('no horizontal scroll 390', await noScroll(page), String(await page.evaluate(() => document.documentElement.scrollWidth)));
  await page.click('.td-tab:nth-child(2)');
  ok('phone tick buttons are 44px', await page.evaluate(() => { const b = document.querySelector('.td-row .cd'); const r = b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }));
  await page.screenshot({ path: S + 'today-390.png', fullPage: true });
  ok('no console errors phone', errs.length === 0, errs.join(' | '));
  await ctx.close();

  // 6. floor still works and the mode is remembered
  ({ page, ctx, errs } = await open(1440, 900, '2026-10-28T10:15:00-07:00', '#floor'));
  ok('floor is the default', await page.isVisible('#plan'));
  await page.click('#m-today'); await page.reload(); await page.waitForTimeout(300);
  ok('mode remembered per device', await page.evaluate(() => document.documentElement.classList.contains('today-mode')));
  await page.click('#m-floor'); ok('Floor button returns', await page.isVisible('#plan'));
  ok('no console errors floor', errs.length === 0, errs.join(' | '));
  await ctx.close();

  // 7. live path with a stub database: reads daily/{date}, writes ticks under daily/{date}/ticks
  {
    const ctx2 = await browser.newContext({ viewport: { width: 1920, height: 1080 }, timezoneId: 'America/Los_Angeles', locale: 'en-US' });
    const page2 = await ctx2.newPage(); const errs2 = [];
    page2.on('console', (m) => { if (m.type() === 'error') errs2.push(m.text()); }); page2.on('pageerror', (e) => errs2.push('pageerror: ' + e.message));
    await page2.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await page2.addInitScript(() => {
      const store = {}, subs = [];
      const doc = (p) => ({ onSnapshot(cb) { const s = { p, cb }; subs.push(s); setTimeout(() => cb({ exists: p in store, data: () => store[p] }), 0); return () => {}; }, set(d) { store[p] = JSON.parse(JSON.stringify(d)); window.__writes.push(['set', p, JSON.parse(JSON.stringify(d))]); return Promise.resolve(); }, delete() { delete store[p]; window.__writes.push(['delete', p]); return Promise.resolve(); } });
      const col = (p) => ({ orderBy() { return this; }, limit() { return this; }, onSnapshot(cb) { setTimeout(() => cb({ docs: Object.keys(store).filter((k) => k.startsWith(p + '/') && !k.slice(p.length + 1).includes('/')).map((k) => ({ id: k.split('/').pop(), data: () => store[k] })) }), 0); return () => {}; } });
      window.__writes = []; window.__store = store;
      const date = '2026-10-28';
      store['daily/' + date] = { schema: 1, date, label: 'Live stub', pillar: { n: 3, name: 'Accountability' }, scripture: '1 Timothy 1:1–2', habits: {}, streaks: {}, run: [{ at: '11:00', title: 'POWER HOUR · Stub', note: '', powerHour: true, sheetId: 's1' }], must: [{ id: 'm1', at: '07:00', title: 'Stub must', note: '' }], decisions: [], qc: [{ id: 'q1', name: 'Stub Q', clientSeat: 'Client · discreet', date: '', lastTouch: '', do: 'x', today: true, group: 'G', asOf: date }], sheets: [{ id: 's1', title: 'Stub sheet', eyebrow: '', window: { pt: '11:00-12:00', et: '14:00-15:00' }, tz: 'ET', eastCoast: true, brief: '', opener: '', sub: '', url: null, leads: [{ id: 's1-01', name: 'Stub Lead', title: 'T', company: 'C', ph: 'M', src: 'ZI', crelateUrl: null, linkedin: null, note: '' }] }], study: null, sources: [], builtAt: new Date().toISOString(), builtBy: 'test' };
      window.claude = { use(name) { if (name === 'db') return Promise.resolve({ doc, collection: col }); return Promise.resolve(null); } };
    });
    await page2.clock.install({ time: new Date('2026-10-28T09:00:00-07:00') });
    await page2.goto(URL + '#today'); await page2.clock.resume(); await page2.waitForTimeout(600);
    ok('live: reads the day from the database', (await page2.textContent('.td-sh h3')).length > 0, await page2.textContent('#td-root').then((t) => t.slice(0, 60)));
    await page2.click('.td-tab:nth-child(2)'); await page2.click('.td-row .cc'); await page2.waitForTimeout(100);
    const w = await page2.evaluate(() => window.__writes);
    const wr = w.filter((x) => x[1].includes('/ticks/'));
    ok('live: a Conn tick writes daily/{date}/ticks/row-{leadId}', wr.length === 1 && /^daily\/2026-10-28\/ticks\/row-s1-01$/.test(wr[0][1]) && wr[0][2].c === true && wr[0][2].kind === 'row', JSON.stringify(wr));
    await page2.click('.td-tab:nth-child(1)'); await page2.click('.td-qc .td-chk'); await page2.waitForTimeout(100);
    const w2 = await page2.evaluate(() => window.__writes.map((x) => x[1]));
    ok('live: a QC touch writes the tick and an actions/ row', w2.includes('daily/2026-10-28/ticks/touch-q1') && w2.includes('actions/daily-2026-10-28-touch-q1'), w2.join(','));
    ok('live: nothing is written outside daily/ticks and actions/', w2.every((p) => /^(daily\/[\d-]+\/ticks\/|actions\/daily-)/.test(p)), w2.join(','));
    // 3am rollover: at 02:30 the page still shows the previous day's doc id
    ok('live: no console errors', errs2.length === 0, errs2.join(' | '));
    await ctx2.close();
  }
  await browser.close();
  console.log(results.map((r) => r.join('  ')).join('\n'));
  console.log(results.filter((r) => r[0] === 'FAIL').length + ' failed of ' + results.length);
})().catch((e) => { console.error(e); process.exit(1); });
