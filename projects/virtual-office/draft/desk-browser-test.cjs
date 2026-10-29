const { chromium } = require('playwright');
// Browser check for the desk sheets by project and the NEEDS YOUR INPUT list (Q, 29 Oct 2026; Kev's comments of 29 Oct on the Command Center).
// Needs the `playwright` package and a Chromium (PW_CHROME or /opt/pw-browsers).  Run:
//   NODE_PATH=/opt/node-tools/node_modules SHOTS=/some/dir node projects/virtual-office/draft/desk-browser-test.cjs
const S = (process.env.SHOTS || require('os').tmpdir()) + '/';
const URL = 'file://' + require('path').resolve(__dirname, 'eden-office.html');
const results = [];
const ok = (name, cond, extra) => { results.push([cond ? 'PASS' : 'FAIL', name, extra || '']); };
const NOW = '2026-10-29T10:15:00-07:00';
const iso = (msAgo) => new Date(Date.parse(NOW) - msAgo).toISOString();
const H = 3600000, D = 24 * H;
const BLOB = 'https://github.com/EdenExec/Agent-Builder/blob/claude/pensive-brown-18gll8/';

// A stub Office database (invented rows): agents with projects, tickets that belong to them, and a write log.
const live = {
  agents: {
    pm: { id: 'pm', name: 'Pam', role: 'Special projects PM', desk: 'projects', light: 'idle', counts: {}, task: 'Chasing quotes', lastHeard: iso(H), updated: iso(H), projects: [
      { id: 'eden-staffing', title: 'Eden Staffing', status: '3 of 40 rows done, 1 slipped, 1 at risk', statusAuto: false, owner: 'pm', keywords: ['Eden Staffing', 'EOR'], link: BLOB + 'projects/eden-staffing/schedule.md', items: [
        { title: 'ES-01 Owners and dates confirmed', state: 'needs', link: BLOB + 'employees/pm/briefs/x.md', at: null, note: 'Kev confirms the batch.' },
        { title: 'ES-03 Trades list for the quote requests', state: 'open', link: '', at: null, note: 'Nick sends the trades.' },
        { title: 'AB-01 First drafts from Docket', state: 'shipped', link: BLOB + 'projects/eden-staffing/legal', at: iso(2 * D), note: 'Five drafts.' },
        { title: 'Old sync ticket item', state: 'open', link: '', at: null, ticket: 'gone' }] }] },
    q: { id: 'q', name: 'Q', role: 'Engineering', desk: 'recruiting', light: 'blocked', counts: {}, task: 'Feed', lastHeard: iso(H), updated: iso(H), projects: [
      { id: 'eden-crm', title: 'Eden CRM', status: 'x', statusAuto: true, owner: 'q', keywords: ['Eden CRM'], items: [] },
      { id: 'cloudtalk-nightly', title: 'CloudTalk nightly load', status: 'x', statusAuto: true, owner: 'q', keywords: ['CloudTalk nightly'], items: [] }] },
    radar: { id: 'radar', name: 'Radar', role: 'Chief of staff', desk: 'centre', light: 'idle', counts: {}, task: 'Sweep', lastHeard: iso(H), updated: iso(H) },
    dean: { id: 'dean', name: 'Dean', role: 'Workforce', desk: 'recruiting', sensitive: true, light: 'idle', counts: {}, lastHeard: iso(H), updated: iso(H) },
  },
  tickets: {
    t1: { id: 't1', agent: 'pm', ask: 'Draft the quote request pack for the EOR providers. It needs one assumptions sheet covering the trades, the three states and twenty five workers, plus the request text for Docket to review before anything goes out.', title: 'Quote request pack drafted', project: 'eden-staffing', status: 'done', createdAt: iso(5 * H), doneAt: iso(H), result: { summary: 'Pack drafted; Docket reviews the wording next.', link: BLOB + 'projects/eden-staffing/nick-chase-draft.md' } },
    t2: { id: 't2', agent: 'q', ask: 'Load tonight\'s lead sheet into CloudTalk', project: 'cloudtalk-nightly', status: 'blocked', createdAt: iso(5 * H), updatedAt: iso(3 * H), blockedOn: 'CloudTalk connector sign-in expired; reconnect it so the load can run' },
    t3: { id: 't3', agent: 'q', ask: 'Draft the Crelate mirror schema from the API field list', status: 'working', pickedAt: iso(H), createdAt: iso(2 * H), updatedAt: iso(H), title: 'Crelate mirror schema', project: 'eden-crm' },
    t4: { id: 't4', agent: 'q', ask: 'Tidy the ZoomInfo pull notes for Scout. Remove the stale columns and add the exclusion list reference.', status: 'open', createdAt: iso(30 * 60000) },
    t5: { id: 't5', agent: 'dean', ask: 'Draft a day-one page', status: 'gated', createdAt: iso(D), proposed: { kind: 'send_message', exact: 'To: Kev (review copy) Subject: Next steps before you start', qc: 'q1', hash: 'h1' } },
    t6: { id: 't6', agent: 'radar', ask: 'Pick the ledger view for the Family bench', status: 'blocked', createdAt: iso(7 * H), updatedAt: iso(6 * H), blockedOn: 'Which Notion ledger view should the Family bench read?', blockedLink: 'https://www.notion.so/example' },
  },
};
const stubInit = (L) => {
  const writes = []; window.__writes = writes;
  const mk = (rows) => ({ docs: Object.keys(rows).map((id) => ({ id, data: () => rows[id] })) });
  const col = (p) => ({ orderBy() { return this; }, limit() { return this; }, onSnapshot(cb) { setTimeout(() => cb(mk(L[p] || {})), 0); return () => {}; } });
  const dd = (p) => ({ onSnapshot(cb) { setTimeout(() => cb({ exists: false, data: () => null }), 0); return () => {}; }, set(d) { writes.push([p, d]); return Promise.resolve(); }, delete() { return Promise.resolve(); } });
  window.claude = { use(name) { return Promise.resolve(name === 'db' ? { doc: dd, collection: col } : null); } };
};

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] }).catch(async () => chromium.launch({ args: ['--no-sandbox'] }));
  async function open(w, h, hash, stub) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, timezoneId: 'America/Los_Angeles', locale: 'en-US' });
    const page = await ctx.newPage(); const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    if (stub) await page.addInitScript(stubInit, stub);
    await page.clock.install({ time: new Date(NOW) });
    await page.goto(URL + (hash || '')); await page.clock.resume(); await page.waitForTimeout(500);
    return { page, ctx, errs };
  }
  const noScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1 && document.querySelector('#panel').scrollWidth <= document.querySelector('#panel').clientWidth + 1);
  const sit = async (page, id) => { await page.click(id === 'radar' ? '#radar' : `.desk[data-id="${id}"]`); await page.waitForSelector('#panel .panel-h'); await page.waitForTimeout(450); };
  const titles = (page) => page.$$eval('#panel .prj .pt', (e) => e.map((x) => x.textContent));
  const linksOk = (page) => page.$$eval('#panel .it a, #panel .prj-r a, #panel .need a', (as) => as.every((a) => /^https?:\/\//.test(a.getAttribute('href')) && a.tagName === 'A'));

  for (const mode of ['example', 'live']) {
    for (const [w, h] of [[1920, 1080], [1366, 768], [390, 844]]) {
      const tag = `${mode} ${w}`;
      const stub = mode === 'live' ? live : undefined;
      let { page, ctx, errs } = await open(w, h, '#floor', stub);
      // ---- Pam
      await sit(page, 'pm');
      ok(`${tag}: Pam's desk opens`, (await page.textContent('#sheet-title')) === 'Pam');
      ok(`${tag}: header has the name, role, Session button and the light`, await page.evaluate(() => { const hd = document.querySelector('#panel .panel-h'); return !!hd.querySelector('.led') && /Special projects PM/.test(hd.textContent) && !!hd.querySelector('a.sess'); }));
      ok(`${tag}: no needs block when nothing needs Kev`, (await page.$('#panel section.needs')) === null);
      ok(`${tag}: Eden Staffing is a project row`, (await titles(page)).includes('Eden Staffing'), JSON.stringify(await titles(page)));
      const open1 = await page.getAttribute('#panel .prj[data-project="eden-staffing"] .prj-h', 'aria-expanded');
      ok(`${tag}: the project with something needing input is open by default`, open1 === 'true');
      const chips = await page.$$eval('#panel .prj[data-project="eden-staffing"] .chip', (e) => e.map((x) => x.textContent));
      ok(`${tag}: chips read open, needs you, shipped`, chips.length >= 2 && chips.every((c) => /^\d+ (open|needs you|shipped)$/.test(c)), JSON.stringify(chips));
      const groups = await page.$$eval('#panel .prj[data-project="eden-staffing"] .gh', (e) => e.map((x) => x.textContent.replace(/ · \d+$/, '')));
      ok(`${tag}: items grouped Needs input / Open / Shipped`, JSON.stringify(groups) === JSON.stringify(['Needs input', 'Open', 'Shipped · last 7 days']), JSON.stringify(groups));
      ok(`${tag}: every link is an <a> with an http(s) href`, await linksOk(page) && (await page.$$('#panel .it a')).length >= 1);
      ok(`${tag}: no feed, blotter or log blurbs`, !(await page.textContent('#panel')).match(/Feed ·|Blotter|Last five|Done and follow-ups/));
      ok(`${tag}: no horizontal scroll`, await noScroll(page));
      if (mode === 'example' && w === 1920) await page.screenshot({ path: S + 'desk-pam-1920.png' });
      if (mode === 'example') {
        ok(`${tag}: example Pam item "Old" absent, ES-01 present`, (await page.textContent('#panel')).includes('ES-01'));
      } else {
        ok(`${tag}: live: the done ticket shows under Shipped from the live tickets, with its short title`, (await page.textContent('#panel .prj[data-project="eden-staffing"]')).includes('Quote request pack drafted'));
        ok(`${tag}: live: a sync item whose ticket id is stale is replaced, not shown`, !(await page.textContent('#panel')).includes('Old sync ticket item'));
      }
      // expand an item (click) and check the clip + more
      const itemBtn = await page.$('#panel .prj[data-project="eden-staffing"] button.it-t');
      if (itemBtn) {
        const before = await itemBtn.getAttribute('aria-expanded'); await itemBtn.click();
        ok(`${tag}: an item expands on click`, before === 'false' && (await itemBtn.getAttribute('aria-expanded')) === 'true');
      }
      if (mode === 'live') {
        const sh = await page.$('#panel .prj[data-project="eden-staffing"] .it.shipped button.it-t');
        await sh.click();
        const clip = await page.evaluate(() => { const p = document.querySelector('#panel .it.shipped .it-x:not([hidden]) .clip'); return p ? getComputedStyle(p).webkitLineClamp : null; });
        ok(`${tag}: the full text shows clipped to 2 lines`, clip === '2', String(clip));
      }
      // keyboard on a collapsed row (Q's desk) later; here Pam's first row toggles by Enter and Space
      await page.focus('#panel .prj[data-project="eden-staffing"] .prj-h');
      await page.keyboard.press('Enter');
      ok(`${tag}: Enter collapses a project row`, (await page.getAttribute('#panel .prj[data-project="eden-staffing"] .prj-h', 'aria-expanded')) === 'false');
      await page.keyboard.press('Space');
      ok(`${tag}: Space expands it again`, (await page.getAttribute('#panel .prj[data-project="eden-staffing"] .prj-h', 'aria-expanded')) === 'true');
      ok(`${tag}: focus stays on the row`, await page.evaluate(() => document.activeElement.classList.contains('prj-h')));
      ok(`${tag}: Pam: no console errors`, errs.length === 0, errs.join(' | '));

      // ---- Q
      await page.keyboard.press('Escape'); await page.waitForTimeout(250);
      await sit(page, 'q');
      const needsQ = await page.$$('#panel section.needs .need');
      ok(`${tag}: Q has the blocked ticket under NEEDS YOUR INPUT`, needsQ.length >= 1 && (await page.textContent('#panel section.needs h3')).startsWith('Needs your input'), String(needsQ.length));
      const needSel = '#panel section.needs .need:has(.nl:text("CloudTalk"))';
      const need0 = await page.textContent(needSel);
      ok(`${tag}: the need line says what is wanted (12 words or fewer)`, /CloudTalk connector/.test(need0) && (await page.$eval(needSel + ' .nl', (e) => e.textContent.split(/\s+/).length)) <= 14, need0.slice(0, 160));
      ok(`${tag}: the title is 8 words or fewer`, (await page.$eval(needSel + ' .nt b', (e) => e.textContent.replace(/…$/, '').split(/\s+/).length)) <= 8);
      const btns = await page.$$eval(needSel + ' .nacts .mini', (e) => e.map((x) => x.textContent));
      ok(`${tag}: controls on the line: connectors link, Done (I handled it), Follow up`, btns.includes('Open connectors') && btns.includes('Done (I handled it)') && btns.includes('Follow up'), JSON.stringify(btns));
      ok(`${tag}: the connectors link points at the connector settings`, (await page.getAttribute(needSel + ' a.mini', 'href')) === 'https://claude.ai/settings/connectors');
      const projQ = await titles(page);
      ok(`${tag}: Q's projects listed, only the first with input open`, projQ.length >= 2 && (await page.$$eval('#panel .prj-h[aria-expanded="true"]', (e) => e.length)) === 1, JSON.stringify(projQ));
      const colHead = await page.$('#panel .prj-h[aria-expanded="false"]');
      await colHead.focus(); await page.keyboard.press('Enter');
      ok(`${tag}: Enter expands a collapsed row`, (await colHead.getAttribute('aria-expanded')) === 'true');
      ok(`${tag}: other open work lists the project-less ticket on one line`, mode === 'live' ? (await page.textContent('#panel .other')).includes('Tidy the ZoomInfo pull notes') : true);
      ok(`${tag}: Hand a ticket is behind a button`, (await page.isVisible('#panel .desk-foot .key')) && !(await page.$('#panel .desk-foot form')));
      await page.click('#panel .desk-foot .key'); ok(`${tag}: the button opens the form`, await page.isVisible('#panel .desk-foot form')); await page.click('#panel .desk-foot .key');
      ok(`${tag}: chat is still below`, await page.isVisible('#panel .chat'));
      ok(`${tag}: Q no horizontal scroll`, await noScroll(page));
      // Follow up with a note
      await page.click(needSel + ' .nacts .mini:text("Follow up")');
      ok(`${tag}: Follow up opens a short text box with focus`, await page.evaluate(() => document.activeElement.classList.contains('fu')));
      await page.keyboard.type('Use the new login'); await page.keyboard.press('Enter');
      await page.waitForTimeout(150);
      ok(`${tag}: after Follow up the row leaves NEEDS and shows with Undo`, (await page.$$('#panel .handled')).length >= 1, String((await page.$$('#panel section.needs .need')).length));
      ok(`${tag}: a handled line with Undo is shown`, (await page.textContent('#panel .handled-s')).includes('Sent back'));
      if (mode === 'live') {
        const w2 = await page.evaluate(() => window.__writes);
        const act = w2.find((x) => /^actions\/ticket-t2-blocked/.test(x[0]));
        ok(`${tag}: live: the follow-up writes actions/ticket-t2-blocked with the note`, !!act && act[1].action === 'followup' && act[1].note === 'Use the new login', JSON.stringify(w2).slice(0, 300));
      }
      if (mode === 'example' && w === 1920) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); await sit(page, 'radar'); await page.screenshot({ path: S + 'desk-radar-1920.png' }); }
      // ---- Radar: a blocked ticket with a link, and Done writes
      await page.keyboard.press('Escape'); await page.waitForTimeout(250);
      await sit(page, 'radar');
      const rn = await page.$$eval('#panel section.needs .need', (e) => e.map((x) => x.textContent));
      ok(`${tag}: Radar's blocked ticket is on the line`, rn.some((x) => /Notion|ledger/i.test(x)), JSON.stringify(rn).slice(0, 200));
      const rl = await page.$$eval('#panel section.needs .need a.mini', (e) => e.map((x) => x.getAttribute('href')));
      ok(`${tag}: its link is the thing to act on`, mode === 'live' ? rl.includes('https://www.notion.so/example') : rl.includes('https://www.notion.so/'), JSON.stringify(rl));
      const doneBtn = await page.$('#panel section.needs .need:has(.nl:text("Notion")) button:text("Done (I handled it)")');
      if (doneBtn && mode === 'live') {
        await doneBtn.click(); await page.waitForTimeout(100);
        ok(`${tag}: live: Done writes the action`, (await page.evaluate(() => window.__writes)).some((x) => /^actions\/ticket-t6-blocked/.test(x[0]) && x[1].action === 'done'));
      }
      ok(`${tag}: Radar: no console errors`, errs.length === 0, errs.join(' | '));
      await page.keyboard.press('Escape'); await page.waitForTimeout(250);

      // ---- Today view: the same list in the decisions column
      await page.click('#m-today'); await page.waitForTimeout(500);
      const tn = await page.$$('#td-root .td-needs .need');
      ok(`${tag}: Today: NEEDS YOUR INPUT sits in the decisions column`, (await page.$$('#td-root .td-dec-box .td-needs')).length === 1 && tn.length >= 1, String(tn.length));
      ok(`${tag}: Today: each row names its agent and has controls`, await page.$$eval('#td-root .td-needs .need', (rows) => rows.every((r) => !!r.querySelector('.who') && !!r.querySelector('.nacts .mini'))));
      ok(`${tag}: Today: a gated row keeps Approve`, mode === 'live' ? (await page.$$eval('#td-root .td-needs .need .mini', (e) => e.some((x) => x.textContent === 'Approve'))) : true);
      if (mode === 'example' && w === 1920) await page.screenshot({ path: S + 'today-needs-1920.png' });
      ok(`${tag}: Today: no horizontal scroll`, await noScroll(page));
      const fb = await page.$('#td-root .td-needs .need .mini:text("Follow up")');
      if (fb) { await fb.click(); ok(`${tag}: Today: Follow up gives a text box with focus`, await page.evaluate(() => document.activeElement.classList.contains('fu'))); await page.keyboard.type('Check this first'); await page.waitForTimeout(100); await page.evaluate(() => 0); ok(`${tag}: Today: typing in the box does not trigger Today shortcuts`, (await page.inputValue('.need input.fu')) === 'Check this first'); }
      // Screen share
      await page.click('#sw-share'); await page.waitForTimeout(250);
      ok(`${tag}: Screen share: private desks' needs leave the Today list`, !(await page.textContent('#td-root')).includes('Dean'));
      await page.click('#m-floor'); await page.waitForTimeout(250);
      await page.click(`.desk[data-id="dean"]`, { force: true }).catch(() => {});
      await page.waitForTimeout(300);
      ok(`${tag}: Screen share: a sensitive desk stays hidden`, !(await page.isVisible('#panel section.needs')) );
      ok(`${tag}: no console errors at the end`, errs.length === 0, errs.join(' | '));
      await ctx.close();
    }
  }
  await browser.close();
  let failed = 0; for (const [s, n, e] of results) { if (s === 'FAIL') failed++; console.log(s.padEnd(5), n, e ? ' ' + String(e).slice(0, 200) : ''); }
  console.log(`${failed} failed of ${results.length}`);
  process.exit(failed ? 1 : 0);
})();
