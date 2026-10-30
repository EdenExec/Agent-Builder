// Command Center · today.js (split from eden-office.html, 30 Oct 2026). The Today view: run of day, call sheets, QC rows and notes, habits, decisions, check-out.
// Panel files share the page's global scope and load in this order: core.js, floor.js, pulse.js, strip.js, family.js, desks.js, today.js, boot.js. Edit here, not in the html.
'use strict';
  /* ---------- TODAY: the Eden Daily inside the Command Center (Kev, 28 Oct 2026; spec research/today-view-design.md; data projects/virtual-office/daily-schema.md) ----------
     Reads daily/{date} (Radar sets it the night before) and daily/{date}/ticks (Kev's live marks). Writes only ticks, plus actions/ rows (decisions, QC touches) and one ticket (check-out Send).
     The date rolls over at 3:00am local. No paper for the date: calendar plus "Paper not built"; yesterday's sheet is never shown as today's. */
  var TD = { mode: 'floor', date: null, doc: null, ticks: {}, loaded: false, err: '', un: [], tab: null, sel: {}, undo: [], timers: {}, autoRecruit: false, focusOn: false, left: null, summary: null, study: false, ckOpen: null, fullRun: false, kb: false, flash: '' };
  var HABITS = [['bible', 'Bible'], ['rps', 'RPs'], ['mps', 'MPs'], ['workout', 'Work'], ['drinks', 'Drink'], ['wisdom', 'Wisd'], ['agency', 'Agcy'], ['growth', 'Grow'], ['weight', 'Wt']];
  var FRIEZE = ['RIGHTEOUSNESS', 'WINNING', 'ACCOUNTABILITY', 'DISCIPLINE', 'TRANSPARENCY', 'GROWTH', 'EXECUTION'];
  function tdDate(ms) { var d = new Date((ms || Date.now()) - 3 * HOUR); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function tdAtMs(date, hhmm) { var p = String(hhmm || '').split(':'), d = new Date(date + 'T00:00:00'); d.setHours(+p[0] || 0, +p[1] || 0, 0, 0); return d.getTime(); }
  function tdClock(ms) { return tf.format(new Date(ms)); }
  function tdLabel(date) { var d = new Date(date + 'T12:00:00'); return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); }
  function tdShort(date) { var d = new Date(date + 'T12:00:00'); return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }); }
  function tdName(s) { return S.share ? '••••••' : s; }
  function tdTick(kind, ref) { return TD.ticks[kind + '-' + ref] || {}; }

  /* ---- data: subscribe to the day, and to its ticks ---- */
  function tdUnwatch() { TD.un.forEach(function (f) { try { f(); } catch (e) {} }); TD.un = []; }
  function tdWatch() {
    var date = tdDate();
    if (!S.live || !S.db) { if (!TD.doc || TD.date !== date) { TD.date = date; TD.doc = tdExample(date); TD.ticks = {}; TD.loaded = true; } return; }
    if (TD.date === date && TD.un.length) return;
    tdUnwatch(); TD.date = date; TD.doc = null; TD.ticks = {}; TD.loaded = false; TD.err = ''; TD.tab = null; TD.sel = {}; TD.undo = []; TD.summary = null;
    TD.un.push(S.db.doc('daily/' + date).onSnapshot(function (s) { if (TD.date !== date) return; TD.doc = s.exists ? s.data() : null; TD.loaded = true; TD.err = ''; renderAll(); }, function () { TD.err = 'Could not read the paper.'; TD.loaded = true; renderAll(); }));
    TD.un.push(S.db.collection('daily/' + date + '/ticks').onSnapshot(function (snap) {
      if (TD.date !== date) return;
      snap.docs.forEach(function (d) { var v = d.data(), mine = TD.ticks[d.id]; if (v && (!mine || t(v.at) >= t(mine.at)) && !TD.timers[d.id]) TD.ticks[d.id] = v; });
      renderAll();
    }, function () {}));
  }
  /* Kev's marks are written whole (one document per thing ticked), locally first, so the phone and the big monitor agree. Notes wait 600ms after typing stops. */
  function tdPut(kind, ref, patch, delay) {
    var id = kind + '-' + ref, prev = TD.ticks[id] || null, doc = Object.assign({ kind: kind, ref: ref }, prev || {}, patch, { at: new Date().toISOString() });
    TD.undo.push({ id: id, prev: prev }); if (TD.undo.length > 10) TD.undo.shift();
    TD.ticks[id] = doc;
    tdSave(id, delay || 0); renderAll();
  }
  function tdSave(id, delay) {
    clearTimeout(TD.timers[id]);
    TD.timers[id] = setTimeout(function () {
      delete TD.timers[id];
      if (S.live && S.db && S.canWrite && TD.ticks[id]) S.db.doc('daily/' + TD.date + '/ticks/' + id).set(TD.ticks[id]).catch(function () { TD.flash = 'That mark did not save. Try again.'; renderAll(); });
    }, delay);
  }
  function tdUndoLast() {
    var u = TD.undo.pop(); if (!u) return;
    var back = u.prev ? Object.assign({}, u.prev) : (function () { var p = u.id.split('-'), k = p.shift(); return { kind: k, ref: p.join('-'), d: false, v: false, c: false, out: '', note: '', value: false }; })();
    back.at = new Date().toISOString(); TD.ticks[u.id] = back; tdSave(u.id, 0); renderAll();
  }
  function tdAction(key, action, title) {
    var doc = { key: key, agent: 'radar', title: title, action: action, at: new Date().toISOString(), by: 'kev', applied: false, source: 'daily' };
    S.actions[key] = doc; renderAll();
    if (S.live && S.db && S.canWrite) S.db.doc('actions/' + key).set(doc).catch(function () { delete S.actions[key]; renderAll(); });
  }

  /* ---- the run of day: the live calendar when it answers, Radar's snapshot otherwise ---- */
  function tdRun() {
    var doc = TD.doc, date = TD.date, snap = (doc && doc.run) || [], out = [], live = false;
    var evs = S.cal && S.cal.events ? S.cal.events.filter(function (e) { return e.start.toDateString() === new Date(date + 'T12:00:00').toDateString(); }) : [];
    if (evs.length) {
      live = true;
      evs.forEach(function (e) {
        var ph = /^\s*power hour/i.test(e.title), sid = null;
        if (ph) {
          var m = snap.filter(function (r) { return r.powerHour && r.sheetId && Math.abs(tdAtMs(date, r.at) - e.start.getTime()) < 10 * MIN; })[0];
          if (!m && doc && doc.sheets) { var s2 = doc.sheets.filter(function (sh) { var w = String(sh.title).split(/[^A-Za-z]+/)[0]; return w && e.title.toLowerCase().indexOf(w.toLowerCase()) >= 0; })[0]; if (s2) sid = s2.id; }
          else if (m) sid = m.sheetId;
        }
        out.push({ start: e.start.getTime(), end: e.end.getTime(), title: e.title, note: '', ph: ph, sheetId: sid, join: e.join });
      });
    } else {
      snap.forEach(function (r) { out.push({ start: tdAtMs(date, r.at), title: r.title, note: r.note || '', ph: !!r.powerHour, sheetId: r.sheetId || null }); });
      out.sort(function (a, b) { return a.start - b.start; });
      out.forEach(function (r, i) { var nx = out.filter(function (o) { return o.start > r.start; })[0]; r.end = nx ? Math.min(nx.start, r.start + 90 * MIN) : r.start + 30 * MIN; });
    }
    out.live = live; return out;
  }
  function tdSheets() { return (TD.doc && TD.doc.sheets) || []; }
  function tdSheetFor(it) { var ss = tdSheets(); return it && it.sheetId ? ss.filter(function (s) { return s.id === it.sheetId; })[0] : (it && it.ph && ss.length === 1 ? ss[0] : null); }
  function tdCounts() {
    var c = { conn: 0, dial: 0, vm: 0 };
    tdSheets().forEach(function (s) { s.leads.forEach(function (l) { var k = tdTick('row', l.id); if (k.c) c.conn++; if (k.d) c.dial++; if (k.v) c.vm++; }); });
    return c;
  }
  function tdQcDone() { var q = (TD.doc && TD.doc.qc) || []; return q.filter(function (x) { return tdTick('touch', x.id).value; }).length; }

  /* ---- which tab: the clock picks (the QC block, then each Power Hour) until Kev picks one ---- */
  function tdTabs() {
    var tabs = [], doc = TD.doc; if (!doc) return tabs;
    if ((doc.qc || []).length) tabs.push({ id: 'qc', label: 'QC · ' + tdQcDone() + '/' + doc.qc.length });
    tdSheets().forEach(function (s) { var run = (doc.run || []).filter(function (r) { return r.sheetId === s.id; })[0]; tabs.push({ id: s.id, label: 'PH ' + (run ? tdClock(tdAtMs(TD.date, run.at)) : s.window.pt.split('-')[0]) + ' · ' + String(s.title).split(/[·—-]/)[0].trim().slice(0, 14) }); });
    return tabs;
  }
  function tdAutoTab(run) {
    var now = Date.now(), tabs = tdTabs(); if (!tabs.length) return null;
    var ph = run.filter(function (r) { return r.ph && r.start <= now && r.end > now; })[0], s = ph && tdSheetFor(ph);
    if (s) return s.id;
    var qc = run.filter(function (r) { return /\bQC\b/i.test(r.title) && r.start <= now && r.end > now; })[0];
    if (qc && tabs[0].id === 'qc') return 'qc';
    var nextPh = run.filter(function (r) { return r.ph && r.start > now; })[0], np = nextPh && tdSheetFor(nextPh);
    if (np) return np.id;
    var lastPh = run.filter(function (r) { return r.ph; }).pop(), lp = lastPh && tdSheetFor(lastPh);
    return lp ? lp.id : tabs[0].id;
  }
  function tdTabNow(run) { var tabs = tdTabs(), want = TD.tab && tabs.filter(function (x) { return x.id === TD.tab; })[0] ? TD.tab : tdAutoTab(run); return want; }

  /* ---- Power Hour focus: on by itself when a POWER HOUR block starts (Kev, 28 Oct); P leaves early ---- */
  function tdFocusCheck() {
    if (TD.mode !== 'today' || !TD.doc) return;
    var run = tdRun(), now = Date.now(), ph = run.filter(function (r) { return r.ph && r.start <= now && r.end > now; })[0];
    if (!ph && TD.left !== null) TD.left = null;
    var on = !!ph && TD.left !== ph.start;
    if (on === TD.focusOn) return;
    if (on) {
      TD.focusOn = true; TD.summary = null;
      if (!S.focus) { TD.autoRecruit = true; startFocus({ lane: 'recruiting', task: '', kind: 'recruit', until: null }); }
    } else {
      TD.focusOn = false; var c = tdCounts();
      TD.summary = { text: 'Power Hour done · Dials ' + c.dial + ' · VM ' + c.vm + ' · Conn ' + c.conn, at: Date.now() };
      if (TD.autoRecruit && S.focus && S.focus.kind === 'recruit') endFocus();
      TD.autoRecruit = false;
    }
    renderAll();
  }
  function tdLeaveBlock() { var run = tdRun(), now = Date.now(), ph = run.filter(function (r) { return r.ph && r.start <= now && r.end > now; })[0]; if (ph) { TD.left = ph.start; tdFocusCheck(); } }

  /* ---- mode ---- */
  function setMode(m, keep) {
    TD.mode = m; root.classList.toggle('today-mode', m === 'today');
    $('#m-floor').setAttribute('aria-pressed', String(m === 'floor')); $('#m-today').setAttribute('aria-pressed', String(m === 'today'));
    $('#td-root').hidden = m !== 'today';
    if (!keep) { try { localStorage.setItem('eo-mode', m); } catch (e) {} try { history.replaceState(null, '', m === 'today' ? '#today' : location.pathname + location.search); } catch (e) {} }
    if (m !== 'today') { TD.focusOn = false; TD.left = null; if (TD.autoRecruit && S.focus && S.focus.kind === 'recruit') endFocus(); TD.autoRecruit = false; }
    tdWatch(); renderAll();
    if (m === 'floor') { try { dispatchEvent(new Event('resize')); } catch (e) {} }
  }

  /* ---- render ---- */
  function chk(on, label, fn, attrs) {
    var b = h('button', Object.assign({ class: 'td-chk', 'aria-pressed': String(!!on), 'aria-label': label, title: label }, attrs || {}), h('i', null, svgTick()));
    b.disabled = !S.canWrite; if (fn) b.addEventListener('click', function (e) { e.stopPropagation(); fn(); }); return b;
  }
  function svgTick() { var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 16 16'); var p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', 'M2.5 8.5l3.5 3.5 7.5-8'); s.appendChild(p); return s; }
  function keepFocus(fn) {
    var a = document.activeElement, id = a && a.getAttribute && a.getAttribute('data-td-in'), s0 = a && a.selectionStart, s1 = a && a.selectionEnd;
    fn();
    if (id) { var n = document.querySelector('[data-td-in="' + id + '"]'); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(s0, s1); } catch (e) {} } }
  }
  function tdInput(id, value, cls, ph, fn, delay) {
    var i = h('input', { class: cls || 'td-notei', type: 'text', 'data-td-in': id, placeholder: ph || '', 'aria-label': ph || 'Note', maxlength: '600' }); i.value = value || ''; i.disabled = !S.canWrite;
    i.addEventListener('input', function () { fn(i.value); });
    i.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); i.blur(); } else if (e.key === 'Enter') { e.preventDefault(); i.blur(); if (cls !== 'x') tdMove(1); } });
    return i;
  }
  function renderToday() {
    if (TD.mode !== 'today') return;
    tdWatch(); keepFocus(tdRenderInner);
  }
  function tdRenderInner() {
    var box = $('#td-root'); box.textContent = '';
    if (Game.isSabbathAt(Date.now())) {
      box.appendChild(h('div', { class: 'td-empty', text: 'The Sabbath · Today rests until sundown Saturday' })); root.classList.remove('td-focus'); return;
    }
    var doc = TD.doc, run = tdRun(), now = Date.now(), day = (new Date(TD.date + 'T12:00:00').getDay() + 6) % 7;
    root.classList.toggle('td-focus', TD.focusOn);
    var head = h('div', { class: 'td-head' });
    var fr = h('div', { class: 'td-frieze' });
    FRIEZE.forEach(function (p, n) { if (n) fr.appendChild(document.createTextNode(' · ')); fr.appendChild(n === day ? h('b', { text: p }) : document.createTextNode(p)); });
    head.appendChild(h('div', null, h('h2', { text: tdLabel(TD.date) + ' · Pillar ' + pad2(day + 1) + ' ' + PILLARS[day] }), fr));
    var tools = h('div', { class: 'td-tools' });
    var kb = h('button', { class: 'mini', text: 'Keys ?', 'aria-pressed': String(TD.kb) }); kb.addEventListener('click', function () { TD.kb = !TD.kb; renderAll(); });
    var fs = h('button', { class: 'mini', text: 'Full screen' }); fs.addEventListener('click', function () { try { var r = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); if (r && r.catch) r.catch(function () {}); } catch (e) {} });
    tools.appendChild(kb); tools.appendChild(fs); head.appendChild(tools); box.appendChild(head);
    if (TD.err) box.appendChild(h('div', { class: 'td-note amber', text: TD.err }));
    if (TD.flash) box.appendChild(h('div', { class: 'td-note amber', text: TD.flash }));
    if (TD.summary && now - TD.summary.at < 20 * MIN) box.appendChild(h('div', { class: 'td-note', text: TD.summary.text }));
    var cur = run.filter(function (r) { return r.start <= now && r.end > now; }).pop(), curSheet = cur && cur.ph ? tdSheetFor(cur) : null;
    if (curSheet && curSheet.eastCoast && tdAtMs(TD.date, curSheet.window.pt.split('-')[0]) > tdAtMs(TD.date, '13:00')) box.appendChild(h('div', { class: 'td-note amber', text: 'PAST 4PM ET · East Coast sheet after 1:00pm Pacific (rule of 27 Oct)' }));
    if (TD.kb) box.appendChild(h('div', { class: 'td-box' }, h('div', { class: 'td-kb' }, tdKeys())));

    if (!doc) {
      box.appendChild(h('div', { class: 'td-note', text: TD.loaded ? 'Paper not built for ' + tdShort(TD.date) + '. The calendar below is live; Radar builds the sheets in the stand-up.' : 'Reading the paper…' }));
    }
    var grid = h('div', { class: 'td-grid' });
    var left = h('div', { class: 'td-left' }), right = h('div', { class: 'td-right' });
    left.appendChild(tdNowBox(run, now)); left.appendChild(tdRunBox(run, now)); if (doc) left.appendChild(tdHabitBox());
    var cb = doc && tdCallsBox(); if (cb) left.appendChild(cb);
    grid.appendChild(left); grid.appendChild(tdMid(run)); if (doc) { right.appendChild(tdMustBox()); }
    var decBox = tdDecBox(); if (decBox) right.appendChild(decBox);
    var ctBox = tdCrelateTasksBox(); if (ctBox) right.appendChild(ctBox);
    if (doc) { right.appendChild(tdScriptureBox()); right.appendChild(tdCheckoutBox()); } grid.appendChild(right);
    box.appendChild(grid);
    if (TD.study && doc && doc.study) box.appendChild(tdStudy());
  }
  function tdKeys() {
    var rows = [['J / K', 'next, previous name'], ['Enter', 'copy name for Crelate'], ['D / V / C', 'dial, voicemail, connected (V moves on, C opens the note)'], ['N', 'write a note'], ['O / F', 'continue chasing, follow-up email'], ['Z', 'undo the last tick'], ['[ ] ', 'previous, next sheet'], ['P', 'leave the Power Hour'], ['T', 'Floor or Today']];
    var f = document.createDocumentFragment(); rows.forEach(function (r) { f.appendChild(h('div', null, h('b', { text: r[0] }), ' ' + r[1])); }); return f;
  }
  function tdNowBox(run, now) {
    var cur = run.filter(function (r) { return r.start <= now && r.end > now; }).pop(), nx = run.filter(function (r) { return r.start > now; })[0];
    var b = h('div', { class: 'td-now td-now-box' }, h('span', { class: 'eyebrow', text: cur && cur.ph ? 'Power Hour' : 'Now' }), h('div', { class: 'td-clock', id: 'td-clock', text: tdClock(now) }));
    b.appendChild(h('div', { class: 'td-cur', text: cur ? (S.share ? 'In an event' : cur.title) : (nx ? 'Open until ' + tdClock(nx.start) : 'Open the rest of the day') }));
    b.appendChild(h('div', { class: 'td-bar' }, h('i', { id: 'td-bar', style: 'width:' + (cur ? Math.min(100, Math.round((now - cur.start) / (cur.end - cur.start) * 100)) : 0) + '%' })));
    if (cur) b.appendChild(h('div', { class: 'td-et', id: 'td-left', text: Math.max(0, Math.round((cur.end - now) / MIN)) + ' min left' }));
    var sh = cur && cur.ph && tdSheetFor(cur);
    if (sh && /ET/.test(sh.tz || '')) b.appendChild(h('div', { class: 'td-et', id: 'td-et', text: new Date(now).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET for the leads' }));
    if (nx) b.appendChild(h('div', { class: 'td-nx' }, h('span', { text: 'Next · ' + (S.share ? 'Event' : nx.title) }), h('span', { text: tdClock(nx.start) + ' · ' + inLabel(nx.start - now) })));
    if (cur && cur.join && !S.share) b.appendChild(h('a', { class: 'mini', href: cur.join, target: '_blank', rel: 'noopener', text: 'Join' }));
    return b;
  }
  function tdRunBox(run, now) {
    var compact = matchMedia('(max-width:1599px)').matches && !TD.fullRun, list = run;
    if (compact) { var i0 = Math.max(0, run.findIndex(function (r) { return r.end > now; })); list = run.slice(i0, i0 + 4); }
    var ol = h('ol', { class: 'td-runl' });
    list.forEach(function (r) {
      var isNow = r.start <= now && r.end > now, li = h('li', { class: (r.end <= now ? 'past ' : '') + (isNow ? 'now ' : '') + (r.ph ? 'ph' : '') });
      var w = h('span', { class: 'w' }, document.createTextNode(S.share ? 'Event' : r.title));
      if (r.ph) { w.appendChild(h('span', { class: 'stamp2', text: 'POWER HOUR' })); w.addEventListener('click', function () { var s = tdSheetFor(r); if (s) { TD.tab = s.id; renderAll(); } }); }
      if (r.note && !S.share) w.appendChild(h('span', { class: 'n', text: r.note }));
      li.appendChild(h('span', { class: 't', text: tdClock(r.start) })); li.appendChild(w); ol.appendChild(li);
    });
    if (!list.length) ol.appendChild(h('li', null, h('span'), h('span', { class: 'w', text: S.cal && S.cal.error ? S.cal.error : 'Nothing on the calendar.' })));
    var bx = h('div', { class: 'td-box td-runbox' }, h('div', { class: 'eyebrow' }, h('span', { text: 'Run of day' }), h('span', { text: run.live ? 'Live' : 'Radar snapshot' })), ol);
    if (matchMedia('(max-width:1599px)').matches) { var more = h('button', { class: 'mini txt', text: TD.fullRun ? 'Next four' : 'Full day' }); more.style.margin = '0 12px 10px'; more.addEventListener('click', function () { TD.fullRun = !TD.fullRun; renderAll(); }); bx.appendChild(more); }
    return bx;
  }
  function tdHabitBox() {
    var doc = TD.doc, st = doc.streaks || {};
    var g = h('div', { class: 'td-habits' }); HABITS.forEach(function (x) { var v = tdTick('habit', x[0]).value, n = st[x[0]]; g.appendChild(h('div', { title: x[1] + ' streak (read only)' }, h('b', { text: n == null ? '·' : String(n) }), x[1])); });
    return h('div', { class: 'td-box td-habbox' }, h('div', { class: 'eyebrow' }, h('span', { text: 'Habit streaks' }), h('span', { text: 'read only' })), g);
  }
  /* Phones · CloudTalk: dials and pick-ups per person, this week against the same days last week, with a daily strip.
     Counts only, written into daily/{date}.calls by the stand-up from read-only CloudTalk stats. Hidden under screen share. */
  function tdCallsBox() {
    var c = TD.doc.calls; if (!c || !(c.people || []).length || S.share) return null;
    var w = h('div', { class: 'td-calls' }), keys = c.dayKeys || [];
    w.appendChild(h('div', { class: 'td-cr hd' }, h('span', { text: 'Who' }), h('span', { text: keys.length ? 'Daily dials' : '' }), h('span', { class: 'n', text: 'Wk' }), h('span', { class: 'n', text: 'vs last' }), h('span', { class: 'n', text: 'Pick' })));
    var people = c.people.slice().sort(function (a, b) { return b.week.dials - a.week.dials || b.prior.dials - a.prior.dials; });
    var tot = { w: 0, p: 0 };
    people.forEach(function (p) {
      tot.w += p.week.dials; tot.p += p.prior.dials;
      var max = Math.max.apply(null, [1].concat(p.days.filter(function (x) { return x != null; }))), sp = h('span', { class: 'td-spark', title: keys.map(function (k, i) { return tdShort(k) + ': ' + (p.days[i] == null ? 'not read' : p.days[i]); }).join('\n') });
      p.days.forEach(function (x, i) { sp.appendChild(h('i', { class: x == null ? 'na' : !x ? 'z' : i === p.days.length - 1 ? 'last' : '', style: x ? 'height:' + Math.max(8, Math.round(x / max * 100)) + '%' : '' })); });
      var d = p.week.dials - p.prior.dials, tr = !p.prior.dials ? (p.week.dials ? ['new', 'up'] : ['–', 'fl']) : [(d >= 0 ? '▲' : '▼') + Math.abs(Math.round(d / p.prior.dials * 100)) + '%', Math.abs(d / p.prior.dials) < 0.1 ? 'fl' : d > 0 ? 'up' : 'dn'];
      w.appendChild(h('div', { class: 'td-cr', title: p.name + ' · ' + (c.dayLabel || 'yesterday') + ': ' + p.day.dials + ' dials, ' + p.day.conn + ' picked up · ' + (c.priorLabel || 'last week') + ': ' + p.prior.dials + ' dials' },
        h('span', { class: 'nm', text: p.name.split(' ')[0] }), sp, h('span', { class: 'n', text: String(p.week.dials) }), h('span', { class: 'tr ' + tr[1], text: tr[0] }),
        h('span', { class: 'n', text: p.week.dials ? Math.round(p.week.conn / p.week.dials * 100) + '%' : '–' })));
      if (p.inbound && p.inbound.missed) w.appendChild(h('div', { class: 'td-cin', text: p.name.split(' ')[0] + ': ' + p.inbound.missed + ' of ' + p.inbound.total + ' inbound missed this week' }));
    });
    if ((c.notes || []).length) { var ul = h('ul', { class: 'td-cnotes' }), all = !!TD.callsAll; (all ? c.notes : c.notes.slice(0, 3)).forEach(function (n) { ul.appendChild(h('li', { text: n })); }); w.appendChild(ul);
      if (c.notes.length > 3) { var mb = h('button', { class: 'mini txt', text: all ? 'Fewer notes' : '+' + (c.notes.length - 3) + ' more' }); mb.addEventListener('click', function () { TD.callsAll = !all; renderAll(); }); w.appendChild(h('div', { class: 'td-cfoot' }, mb)); } }
    w.appendChild(h('div', { class: 'td-cfoot', text: 'CloudTalk · ' + (c.weekLabel || 'this week') + ' vs ' + (c.priorLabel || 'last week') + ' · team ' + tot.w + ' vs ' + tot.p + ' · read ' + new Date(t(c.asOf)).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) + ' ' + tdClock(t(c.asOf)) }));
    return h('div', { class: 'td-box td-callbox' }, h('div', { class: 'eyebrow' }, h('span', { text: 'Phones · CloudTalk' }), h('span', { text: c.weekLabel || 'this week' })), w);
  }
  function tdMid(run) {
    var mid = h('main', { class: 'td-mid' }), doc = TD.doc;
    if (!doc) { mid.appendChild(h('div', { class: 'td-empty', text: 'No paper yet · the calendar is live' })); return mid; }
    var tabs = tdTabs(), cur = tdTabNow(run), auto = !TD.tab || !tabs.filter(function (x) { return x.id === TD.tab; })[0];
    if (!tabs.length) { mid.appendChild(h('div', { class: 'td-empty', text: 'No call sheets today' })); return mid; }
    var tb = h('div', { class: 'td-tabs', role: 'tablist' });
    tabs.forEach(function (x) { var b = h('button', { class: 'td-tab', role: 'tab', 'aria-selected': String(x.id === cur), text: x.label }); b.addEventListener('click', function () { TD.tab = x.id; renderAll(); }); tb.appendChild(b); });
    var ab = h('button', { class: 'td-tab auto', text: auto ? 'Following the clock' : 'Follow the clock' }); ab.disabled = auto; ab.addEventListener('click', function () { TD.tab = null; renderAll(); }); tb.appendChild(ab);
    mid.appendChild(tb);
    if (cur === 'qc') mid.appendChild(tdQc()); else { var sh = tdSheets().filter(function (s) { return s.id === cur; })[0]; if (sh) mid.appendChild(tdSheet(sh)); }
    return mid;
  }
  function tdSheet(sh) {
    var f = document.createDocumentFragment(), c = tdCounts(), run = (TD.doc.run || []).filter(function (r) { return r.sheetId === sh.id; })[0];
    var hd = h('div', { class: 'td-sh' }, h('span', { class: 'eyebrow', text: (sh.eyebrow ? sh.eyebrow + ' · ' : '') + 'Power Hour ' + sh.window.pt.replace('-', '–') + ' PT · ' + sh.window.et.replace('-', '–') + ' ET · ' + sh.leads.length + ' names' }), h('h3', { text: S.share ? 'Call sheet' : sh.title }));
    if (sh.brief && !S.share) hd.appendChild(h('p', { text: sh.brief })); if (sh.opener && !S.share) hd.appendChild(h('p', { text: 'Opener: ' + sh.opener })); if (sh.sub && !S.share) hd.appendChild(h('p', { text: sh.sub }));
    if (sh.url && /^https:\/\//.test(sh.url) && !S.share) hd.appendChild(h('a', { class: 'mini txt', href: sh.url, target: '_blank', rel: 'noopener', text: 'Open the Drive sheet' }));
    f.appendChild(hd);
    var cn = h('div', { class: 'td-count' }, h('span', null, 'Conn ', h('b', { text: pad2(c.conn) }), ' / 20'));
    var dots = h('span', { class: 'td-dots', 'aria-hidden': 'true' }); for (var i = 0; i < 20; i++) dots.appendChild(h('i', { class: i < c.conn ? 'on' : '' })); cn.appendChild(dots);
    cn.appendChild(h('span', { text: 'Dials ' + c.dial + ' · VM ' + c.vm }));
    if (sh.eastCoast && tdAtMs(TD.date, sh.window.pt.split('-')[0]) > tdAtMs(TD.date, '13:00')) cn.appendChild(h('span', { class: 'td-stamp', text: 'PAST 4PM ET' }));
    var bar = h('div', { class: 'td-stick' }); bar.appendChild(cn); f.appendChild(bar);   // Kev, 28 Oct: the count and column bar lock in place while the names scroll
    bar.appendChild(h('div', { class: 'td-cols', role: 'row' }, h('span', { text: 'Name' }), h('span', { text: 'Title / company' }), h('span', { text: 'Ph' }), h('span', { text: 'Src' }), h('span', { text: 'Dial' }), h('span', { text: 'VM' }), h('span', { text: 'Conn' }), h('span', { text: 'Stamp' }), h('span', { text: 'Notes' })));
    var sel = TD.sel[sh.id] == null ? 0 : TD.sel[sh.id];
    sh.leads.forEach(function (l, i) {
      var k = tdTick('row', l.id), row = h('div', { class: 'td-row' + (i === sel ? ' sel' : '') + (k.c ? ' done' : ''), 'data-lead': l.id, role: 'row' });
      var nm = h('button', { class: 'nm', text: tdName(l.name), title: 'Select' }); nm.addEventListener('click', function () { TD.sel[sh.id] = i; renderAll(); });
      row.appendChild(nm);
      var tc = h('div', { class: 'tc' }, document.createTextNode(S.share ? '••••••' : l.title), h('small', { text: S.share ? '••••••' : l.company }));
      row.appendChild(tc);
      row.appendChild(h('span', { class: 'ph', text: l.ph })); row.appendChild(h('span', { class: 'src', text: l.src || '' }));
      var cd = chk(k.d, 'Dialed', function () { TD.sel[sh.id] = i; tdPut('row', l.id, { d: !k.d }); }); cd.classList.add('cd');
      var cv = chk(k.v, 'Voicemail', function () { TD.sel[sh.id] = i; tdPut('row', l.id, { v: !k.v }); }); cv.classList.add('cv');
      var cc = chk(k.c, 'Connected', function () { TD.sel[sh.id] = i; tdPut('row', l.id, { c: !k.c }); }); cc.classList.add('cc');
      row.appendChild(cd); row.appendChild(cv); row.appendChild(cc);
      var out = h('button', { class: 'td-out co', text: k.out || '—', 'aria-label': 'Stamp: continue chasing or follow-up email', title: 'O = continue chasing · F.U. = follow-up email' }); if (k.out) out.setAttribute('data-v', '1');
      out.addEventListener('click', function () { TD.sel[sh.id] = i; tdPut('row', l.id, { out: k.out === 'O' ? 'F.U.' : k.out === 'F.U.' ? '' : 'O' }); }); out.disabled = !S.canWrite; row.appendChild(out);
      var nt = h('div', { class: 'nt' }, tdInput('note-' + l.id, k.note || '', 'td-notei', S.share ? '' : (l.note || 'Note'), function (v) { var cur = TD.ticks['row-' + l.id] || {}; TD.ticks['row-' + l.id] = Object.assign({ kind: 'row', ref: l.id }, cur, { note: v, at: new Date().toISOString() }); tdSave('row-' + l.id, 600); }));
      if (S.share) nt.firstChild.disabled = true;
      if (l.addedAt) nt.appendChild(h('span', { class: 'td-added', text: 'added ' + tdClock(t(l.addedAt)) }));
      var lk = h('span', { class: 'lkcell' }); if (l.crelateUrl && /^https:\/\//.test(l.crelateUrl) && !S.share) lk.appendChild(h('a', { class: 'lk', href: l.crelateUrl, target: '_blank', rel: 'noopener', text: 'CR' })); if (l.linkedin && /^https:\/\//.test(l.linkedin) && !S.share) lk.appendChild(h('a', { class: 'lk', href: l.linkedin, target: '_blank', rel: 'noopener', text: 'in' }));
      if (lk.firstChild) tc.appendChild(lk);
      row.appendChild(nt); f.appendChild(row);
    });
    f.appendChild(h('div', { class: 'td-legend', text: 'O = continue chasing · F.U. = follow-up email · a follow-up becomes a draft that waits for your yes; nothing is sent.' }));
    var w = h('div'); w.appendChild(f); return w;
  }
  function tdQc() {
    var q = TD.doc.qc || [], w = h('div', { class: 'td-qc' }), last = '';
    w.appendChild(h('div', { class: 'td-sh' }, h('span', { class: 'eyebrow', text: 'Quality control · must-calls · ' + tdQcDone() + ' of ' + q.length + ' touched' }), h('h3', { text: 'Candidates in process · touch every one' }), h('p', { text: 'A touch here also tells Radar to log it on the Team Hub so the red row clears.' })));
    w.appendChild(h('div', { class: 'td-cols td-stick' }, h('span', { text: 'Candidate' }), h('span', { text: 'Client · seat' }), h('span', { text: 'Last touch' }), h('span', { text: 'Do' }), h('span', { text: 'Touched' })));
    var sel = TD.sel.qc == null ? 0 : TD.sel.qc;
    q.forEach(function (x, i) {
      if (x.group && x.group !== last) { last = x.group; w.appendChild(h('div', { class: 'td-grp', text: x.group + (x.asOf && x.asOf !== TD.date ? ' · as of ' + tdShort(x.asOf) : '') })); }
      var k = tdTick('touch', x.id), row = h('div', { class: 'td-row' + (i === sel ? ' sel' : '') + (k.value ? ' done' : ''), 'data-qc': x.id });
      var nm = h('button', { class: 'nm', text: tdName(x.name) }); nm.addEventListener('click', function () { TD.sel.qc = i; renderAll(); });
      if (x.today && !k.value) nm.appendChild(h('span', { class: 'td-today', text: 'TODAY' }));
      row.appendChild(nm);
      row.appendChild(h('div', { class: 'tc' }, document.createTextNode(S.share ? '••••••' : x.clientSeat), h('small', { text: S.share ? '' : x.date })));
      row.appendChild(h('div', { class: 'tc lt', text: S.share ? '' : x.lastTouch }));
      row.appendChild(h('div', { class: 'tc nt', text: S.share ? '' : x['do'] }));
      var c = chk(k.value, 'Touched', function () { TD.sel.qc = i; tdTouch(x, !k.value); }); c.classList.add('ct'); row.appendChild(c);
      if (!S.share) { var qa = S.actions['daily-' + TD.date + '-note-' + x.id];
        row.appendChild(h('div', { class: 'qn' }, tdInput('qcnote-' + x.id, k.note || '', 'td-notei', 'Note for Radar: what happened, what is next', function (v) { tdQcNote(x, v); }), h('small', { text: !k.note ? '' : qa && qa.applied ? 'Radar logged it' : 'Radar picks this up' }))); }
      w.appendChild(row);
    });
    w.appendChild(h('div', { class: 'td-legend', text: 'TODAY = no touch yet, or a start inside a week. Notes go to Radar, who logs them on the Team Hub. Never pay or personal detail in a note.' }));
    return w;
  }
  /* A QC note (Kev, 30 Oct: "leave notes for Radar on this as we move through the day"): saved on the touch tick, and one actions/ row per candidate per day
     that Radar's runner applies (Team Hub log; Crelate only once Kev says yes to write-back). The row is rewritten as the note changes. */
  function tdQcNote(x, v) {
    var id = 'touch-' + x.id, cur = TD.ticks[id] || {}, key = 'daily-' + TD.date + '-note-' + x.id;
    TD.ticks[id] = Object.assign({ kind: 'touch', ref: x.id, value: false }, cur, { note: v, at: new Date().toISOString() }); tdSave(id, 600);
    clearTimeout(TD.timers[key]);
    TD.timers[key] = setTimeout(function () {
      delete TD.timers[key];
      var doc = { key: key, agent: 'radar', title: 'QC note: ' + x.name + ' (' + TD.date + ')', action: 'note', note: String(v).slice(0, 600), ref: x.id, at: new Date().toISOString(), by: 'kev', applied: false, source: 'daily' };
      S.actions[key] = doc; if (S.live && S.db && S.canWrite) S.db.doc('actions/' + key).set(doc).catch(function () {});
    }, 1500);
  }
  function tdTouch(x, on) {
    tdPut('touch', x.id, { value: on });
    if (on) tdAction('daily-' + TD.date + '-touch-' + x.id, 'touched', 'QC touch: ' + x.name + ' (' + TD.date + ')');
    else if (S.actions['daily-' + TD.date + '-touch-' + x.id]) { var key = 'daily-' + TD.date + '-touch-' + x.id; delete S.actions[key]; if (S.live && S.db && S.canWrite) S.db.doc('actions/' + key).delete().catch(function () {}); }
  }
  function tdMustBox() {
    var m = TD.doc.must || [], ol = h('ol', { class: 'td-must' });
    m.forEach(function (x) {
      var k = tdTick('must', x.id), li = h('li', { class: k.value ? 'done' : '' });
      li.appendChild(chk(k.value, 'Done: ' + x.title, function () { tdPut('must', x.id, { value: !k.value }); }));
      li.appendChild(h('div', null, h('div', { class: 'mt' }, h('span', { text: tdClock(tdAtMs(TD.date, x.at)) }), document.createTextNode(S.share ? 'Must-hit' : x.title)), x.note && !S.share ? h('div', { class: 'mn', text: x.note }) : null));
      ol.appendChild(li);
    });
    if (!m.length) ol.appendChild(h('li', null, h('span'), h('span', { class: 'mn', text: 'No must-hits set.' })));
    var done = m.filter(function (x) { return tdTick('must', x.id).value; }).length;
    return h('div', { class: 'td-box td-must-box' }, h('div', { class: 'eyebrow' }, h('span', { text: 'Must-hits' }), h('span', { text: done + ' / ' + m.length })), ol);
  }
  /* Decisions, then NEEDS YOUR INPUT (Kev, 29 Oct: "so he never has to open a desk to unblock an agent"): every agent's blocked or gated ticket and needs-Kev alert,
     with the same answer controls as on the desk. */
  var TD_NEED_CAP = 6;
  function tdDecBox() {
    var d = (TD.doc && TD.doc.decisions) || [], bx = h('div', { class: 'td-box td-dec-box' }), needs = allNeeds();
    if (!TD.doc && !needs.length) return null;
    if (TD.doc) {
      var open = d.filter(function (x) { return !S.actions['daily-' + TD.date + '-' + x.id]; }).length;
      bx.appendChild(h('div', { class: 'eyebrow' }, h('span', { text: 'Decisions · answer first' }), h('span', { text: open + ' open' })));
      d.forEach(function (x) {
        var key = 'daily-' + TD.date + '-' + x.id, a = S.actions[key], el = h('div', { class: 'td-dec' + (a ? ' ans' : '') });
        el.appendChild(h('div', { class: 'dt', text: S.share ? 'Decision' : x.text }));
        if (x.pick && !S.share) el.appendChild(h('div', { class: 'pk', text: 'My pick: ' + x.pick }));
        var row = h('span', { class: 'sacts', style: 'padding:0;justify-content:flex-start' });
        if (a) { row.appendChild(h('span', { class: 'pk', text: 'You said ' + String(a.action).toUpperCase() + ' · ' + tdClock(t(a.at)) })); var u = h('button', { class: 'mini txt', text: 'Undo' }); u.addEventListener('click', function () { delete S.actions[key]; if (S.live && S.db && S.canWrite) S.db.doc('actions/' + key).delete().catch(function () {}); renderAll(); }); row.appendChild(u); }
        else { var seg = h('span', { class: 'seg', role: 'group', 'aria-label': 'Answer' }); [['yes', 'Yes'], ['no', 'No'], ['talk', 'Talk']].forEach(function (o) { var b = h('button', { class: 'mini' + (o[0] === 'yes' ? ' primary' : ''), text: o[1] }); b.disabled = !S.canWrite; b.addEventListener('click', function () { tdAction(key, o[0], x.text); }); seg.appendChild(b); }); row.appendChild(seg); }
        el.appendChild(row); bx.appendChild(el);
      });
      if (!d.length) bx.appendChild(h('div', { class: 'td-in' }, h('span', { class: 'pk', text: 'No decisions filed.' })));
    }
    if (needs.length) {
      var all = !!TD.needAll, shown = all ? needs : needs.slice(0, TD_NEED_CAP);
      bx.appendChild(h('div', { class: 'eyebrow td-needh' }, h('span', { text: 'Needs your input' }), h('span', { text: needs.length + ' open' })));
      var nl = h('div', { class: 'td-needs' }); shown.forEach(function (i) { nl.appendChild(needRow(i, true)); }); bx.appendChild(nl);
      if (needs.length > TD_NEED_CAP) { var mb = h('button', { class: 'mini txt', text: all ? 'Show fewer' : '+' + (needs.length - TD_NEED_CAP) + ' more' }); mb.addEventListener('click', function () { TD.needAll = !all; renderAll(); }); bx.appendChild(h('div', { class: 'td-in' }, mb)); }
    }
    return bx;
  }
  /* Crelate tasks (Kev, 30 Oct: "if its severely outdated/old, move on from it and remove it from my queue"): his open tasks from meta/crelate-tasks,
     someone else's assignment first, then most overdue. Severely stale ones are counted, not listed; they stay open in Crelate. Hidden under screen share. */
  var TD_CT_CAP = 5;
  function tdCrelateTasksBox() {
    var c = S.ctasks; if (!c || S.share) return null;
    var act = c.active || [], all = !!TD.ctAll, shown = all ? act : act.slice(0, TD_CT_CAP), ol = h('ol', { class: 'td-must td-ct' });
    shown.forEach(function (x) {
      var when = x.overdueDays ? x.overdueDays + 'd late' : x.due ? new Date(x.due + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'no date';
      var sub = [x.record ? x.record.name : '', x.assignedBy === 'other' ? 'from ' + (x.assignerName || 'a teammate') : ''].filter(Boolean).join(' · ');
      ol.appendChild(h('li', { class: x.assignedBy === 'other' ? 'other' : '' }, h('span', { class: 'ctw' + (x.overdueDays ? ' late' : ''), text: when }),
        h('div', null, h('div', { class: 'mt', text: x.title }), sub ? h('div', { class: 'mn', text: sub }) : null)));
    });
    if (!act.length) ol.appendChild(h('li', null, h('span'), h('span', { class: 'mn', text: 'Nothing open that still matters.' })));
    var bx = h('div', { class: 'td-box td-ct-box' }, h('div', { class: 'eyebrow' }, h('span', { text: 'Crelate tasks' }), h('span', { text: act.length + ' open' })), ol);
    if (act.length > TD_CT_CAP) { var mb = h('button', { class: 'mini txt', text: all ? 'Show fewer' : '+' + (act.length - TD_CT_CAP) + ' more' }); mb.addEventListener('click', function () { TD.ctAll = !all; renderAll(); }); bx.appendChild(h('div', { class: 'td-in' }, mb)); }
    var mo = c.movedOn || {};
    bx.appendChild(h('div', { class: 'td-cfoot', title: c.screening || '', text: (mo.count ? mo.count + ' older moved on' + (mo.oldestDue ? ' (back to ' + tdShort(mo.oldestDue) + ')' : '') + ', still open in Crelate · ' : '') + 'read ' + tdClock(t(c.asOf)) }));
    return bx;
  }
  function tdScriptureBox() {
    var doc = TD.doc, st = doc.study, k = tdTick('scripture', 'read');
    var b = h('button', { class: 'td-scr', 'aria-label': 'Open the study' }, h('span', null, h('span', { class: 'eyebrow', text: 'Scripture' }), h('div', { text: doc.scripture || (st && st.ref) || '' })), h('span', { class: 'mini txt', text: k.value ? 'Read' : 'Open' }));
    b.addEventListener('click', function () { TD.study = true; renderAll(); }); if (!st) b.disabled = true;
    return h('div', { class: 'td-box td-scr-box' }, b);
  }
  function tdStudy() {
    var st = TD.doc.study, k = tdTick('scripture', 'read'), wrap = h('div', { class: 'td-sheetmodal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Study' });
    wrap.appendChild(h('div', { class: 'sheet-bg', 'data-td-close': '' }));
    var p = h('div', { class: 'td-study' });
    p.appendChild(h('div', { class: 'tools', style: 'justify-content:space-between' }, h('span', { class: 'eyebrow', text: 'Scripture · ESV' }), h('span', null, chk(k.value, 'Mark the study read', function () { tdPut('scripture', 'read', { value: !k.value }); }), h('button', { class: 'stand', 'data-td-close': '', text: 'Close · Esc' }))));
    p.appendChild(h('h3', { text: st.ref })); if (st.text) p.appendChild(h('blockquote', { text: st.text }));
    if (st.setting) { p.appendChild(h('h4', { text: 'The setting' })); p.appendChild(h('p', { text: st.setting })); }
    if (st.words && st.words.length) { p.appendChild(h('h4', { text: 'Word by word' })); var dl = h('dl'); st.words.forEach(function (w) { dl.appendChild(h('dt', { text: '“' + w.word + '”' + (w.orig ? ' · ' + w.orig : '') })); dl.appendChild(h('dd', { text: w.note })); }); p.appendChild(dl); }
    if (st.reflect && st.reflect.length) { p.appendChild(h('h4', { text: 'Reflect' })); var ol = h('ol'); st.reflect.forEach(function (r) { ol.appendChild(h('li', { text: r })); }); p.appendChild(ol); }
    if (st.prayer) { p.appendChild(h('h4', { text: 'Pray' })); p.appendChild(h('p', { text: st.prayer })); }
    if (st.memory) { p.appendChild(h('h4', { text: 'Memory verse' })); p.appendChild(h('p', { text: st.memory })); }
    wrap.appendChild(p); return wrap;
  }
  function tdCheckoutBox() {
    var c = tdCounts(), open = TD.ckOpen == null ? new Date().getHours() >= 17 : TD.ckOpen, sent = tdTick('checkout', 'sent');
    var rps = tdTick('checkout', 'rps').value, conn = tdTick('checkout', 'conn').value;
    var bx = h('div', { class: 'td-box td-chk-box' });
    var line = h('button', { class: 'td-scr', 'aria-expanded': String(open) }, h('span', null, h('span', { class: 'eyebrow', text: 'Check-out 5:30' }), h('div', { text: 'RPs ' + (rps == null || rps === '' ? '–' : rps) + '/15 · Conn ' + (conn == null || conn === '' ? c.conn : conn) + '/20' + (sent.value ? ' · sent' : '') })), h('span', { class: 'mini txt', text: open ? 'Close' : 'Open' }));
    line.addEventListener('click', function () { TD.ckOpen = !open; renderAll(); }); bx.appendChild(line);
    if (!open) return bx;
    var body = h('div', { class: 'td-in' }), l = h('div', { class: 'td-ckl' });
    function num(label, id, val, max) { var i = h('input', { type: 'number', min: '0', max: String(max), 'data-td-in': 'ck-' + id, 'aria-label': label }); i.value = val == null ? '' : val; i.disabled = !S.canWrite; i.addEventListener('input', function () { var v = i.value === '' ? '' : Math.max(0, Math.min(max, Math.round(+i.value))); var cur = TD.ticks['checkout-' + id] || {}; TD.ticks['checkout-' + id] = Object.assign({ kind: 'checkout', ref: id }, cur, { value: v, at: new Date().toISOString() }); tdSave('checkout-' + id, 600); }); return h('label', null, h('span', { class: 'eyebrow', text: label }), i); }
    l.appendChild(num('RPs / 15', 'rps', rps, 15)); l.appendChild(num('Connections / 20', 'conn', conn == null || conn === '' ? c.conn : conn, 20));
    body.appendChild(l);
    ['win', 'miss'].forEach(function (id) { body.appendChild(h('label', null, h('span', { class: 'eyebrow', text: id === 'win' ? 'One win' : 'One miss' }), tdInput('ck-' + id, tdTick('checkout', id).value || '', 'x', '', function (v) { var cur = TD.ticks['checkout-' + id] || {}; TD.ticks['checkout-' + id] = Object.assign({ kind: 'checkout', ref: id }, cur, { value: v, at: new Date().toISOString() }); tdSave('checkout-' + id, 600); }))); });
    var hb = h('div', { class: 'td-hab' }); HABITS.forEach(function (x) { var i = tdInput('hab-' + x[0], String(tdTick('habit', x[0]).value || ''), 'x', x[1], function (v) { var cur = TD.ticks['habit-' + x[0]] || {}; TD.ticks['habit-' + x[0]] = Object.assign({ kind: 'habit', ref: x[0] }, cur, { value: v, at: new Date().toISOString() }); tdSave('habit-' + x[0], 600); }); i.style.cssText = 'border:1px solid var(--line);padding:6px;width:100%'; i.setAttribute('aria-label', x[1] + ' today'); hb.appendChild(i); });
    body.appendChild(h('span', { class: 'eyebrow', text: 'Habits today' })); body.appendChild(hb);
    var send = h('button', { class: 'key', text: sent.value ? 'Send again' : 'Send to Radar' }); send.disabled = !S.canWrite;
    send.addEventListener('click', function () {
      tdPut('checkout', 'sent', { value: true });
      makeTicket({ agent: 'radar', ask: 'My check-out for ' + TD.date + ' is in the Today view (daily/' + TD.date + '/ticks). Read it, use it for tomorrow\'s paper and habit strip, and log the connections.', priority: 'today', lever: 'checkout' });
    });
    body.appendChild(send); bx.appendChild(body); return bx;
  }
  /* once a second: the clock, the minutes left and the Power Hour focus, without rebuilding the page */
  function tdTickSecond() {
    if (TD.mode !== 'today') return;
    var c = $('#td-clock'); if (c) c.textContent = tdClock(Date.now());
    var run = TD.doc ? tdRun() : [], now = Date.now(), cur = run.filter(function (r) { return r.start <= now && r.end > now; }).pop();
    var b = $('#td-bar'); if (b && cur) b.style.width = Math.min(100, Math.round((now - cur.start) / (cur.end - cur.start) * 100)) + '%';
    var l = $('#td-left'); if (l && cur) l.textContent = Math.max(0, Math.round((cur.end - now) / MIN)) + ' min left';
    var e = $('#td-et'); if (e) e.textContent = new Date(now).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET for the leads';
    tdFocusCheck();
    if (tdDate() !== TD.date) { tdWatch(); renderAll(); }
  }
  /* ---- keys (Today only; off while typing) ---- */
  function tdCurSheet() { var run = TD.doc ? tdRun() : [], id = tdTabNow(run); return id === 'qc' ? null : tdSheets().filter(function (s) { return s.id === id; })[0]; }
  function tdMove(n) {
    var sh = tdCurSheet(), tab = sh ? sh.id : 'qc', len = sh ? sh.leads.length : ((TD.doc && TD.doc.qc) || []).length; if (!len) return;
    var i = TD.sel[tab] == null ? 0 : TD.sel[tab]; TD.sel[tab] = Math.max(0, Math.min(len - 1, i + n)); renderAll();
    var r = document.querySelector('.td-row.sel'); if (r && r.scrollIntoView) r.scrollIntoView({ block: 'nearest' });
  }
  function tdCopy(name) {
    try { var p = navigator.clipboard && navigator.clipboard.writeText(name); if (p && p.catch) p.catch(function () { tdSelectName(); }); else if (!p) tdSelectName(); } catch (e) { tdSelectName(); }
  }
  function tdSelectName() { var n = document.querySelector('.td-row.sel .nm'); if (n) { var r = document.createRange(); r.selectNodeContents(n); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } }
  function tdTabStep(n) { var tabs = tdTabs(), run = TD.doc ? tdRun() : [], cur = tdTabNow(run), i = tabs.findIndex(function (x) { return x.id === cur; }); if (i < 0) return; var j = Math.max(0, Math.min(tabs.length - 1, i + n)); TD.tab = tabs[j].id; renderAll(); }
