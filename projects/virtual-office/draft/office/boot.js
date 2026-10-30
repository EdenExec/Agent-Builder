// Command Center · boot.js (split from eden-office.html, 30 Oct 2026). Load-time wiring in the original order (listeners, switches, timers), then boot().
// Panel files share the page's global scope and load in this order: core.js, floor.js, pulse.js, strip.js, family.js, desks.js, today.js, boot.js. Edit here, not in the html.
'use strict';
  LEVERS.photo = { title: 'Upload for an agent', build: function (sec) {
    var ph = S.photo; if (!ph) { sec.appendChild(h('p', { class: 'small', text: 'Nothing picked.' })); return; }
    ph.files.forEach(function (f) {
      if (/^image\//.test(f.type)) sec.appendChild(h('img', { class: 'thumb', src: f.preview || (f.preview = URL.createObjectURL(f)), alt: f.name }));
      else sec.appendChild(h('div', { class: 'ticket' }, f.name, h('small', { text: kb(f.size) + (/\.xlsx?$/i.test(f.name) ? ' · each sheet goes over as a CSV' : '') })));
    });
    var f = h('form'), sel = h('select');
    visibleAgents().forEach(function (a) { sel.appendChild(h('option', { value: a.id, text: a.name })); });
    if (!S.agents.radar) sel.insertBefore(h('option', { value: 'radar', text: 'Radar' }), sel.firstChild);
    sel.value = ph.agent || 'radar';
    var note = h('textarea', { maxlength: '500', placeholder: 'What is it, or what should they do? Leave blank and Radar makes sense of it.' });
    f.appendChild(h('label', null, 'Hand it to', sel)); f.appendChild(h('label', { class: 'full' }, 'Note', note));
    var go = h('button', { class: 'key', type: 'submit', text: ph.busy ? 'Uploading...' : 'Send' }); go.disabled = !!ph.busy || !S.canWrite;
    f.appendChild(h('div', null, go));
    f.appendChild(h('p', { class: 'small full', text: ph.error || 'Photos, PDFs, CSVs, spreadsheets and text, up to 20 MB each. Saved privately in the Office; it becomes a ticket the agent picks up on the next sweep (or say "go" in chat).' }));
    f.addEventListener('submit', function (ev) {
      ev.preventDefault(); if (ph.busy) return; ph.busy = true; ph.error = ''; ph.agent = sel.value; var text = note.value.trim(); S.forceSheet = true; renderSheet();
      Promise.all(ph.files.map(prepare)).then(function (lists) {
        var parts = [].concat.apply([], lists);
        return Promise.all(parts.map(function (x) { return S.assets.upload(x.blob, { type: x.type }).then(function (r) { return { asset: r.id, type: r.contentType, name: x.name }; }); }));
      }).then(function (att) {
        var what = att.length === 1 ? (/^image\//.test(att[0].type) ? 'this photo' : att[0].name) : 'these ' + att.length + ' files';
        makeTicket({ agent: ph.agent, ask: text || 'Make sense of ' + what + ' and file ' + (att.length === 1 ? 'it' : 'them') + ' where ' + (att.length === 1 ? 'it belongs.' : 'they belong.'), priority: 'today', lever: 'upload', attachments: att });
        ph.files.forEach(function (x) { if (x.preview) URL.revokeObjectURL(x.preview); }); S.photo = null; S.flash = 'Sent to ' + nameOf(ph.agent) + '.'; S.sheet = { kind: 'desk', id: ph.agent }; S.forceSheet = true; renderAll();
      }, function (e) {
        ph.busy = false; ph.error = (e && e.code === 'unsupported_type') ? 'One of those file types is not supported. Photos, PDFs, CSVs, Excel and text work.' : (e && e.code === 'too_large') ? 'Too big: 20 MB a file.' : 'Upload did not go through' + (e && e.code ? ' (' + e.code + ')' : '') + '. Try again.'; S.forceSheet = true; renderSheet();
      });
    });
    sec.appendChild(f);
  } };
  LEVERS.focus = { title: 'Deep work', build: function (sec) {
    sec.appendChild(h('p', { class: 'small', text: 'Pick what you are on. Everything else greys out, its lights stop blinking, and its items wait in the strip until you are done. Urgent (red) still comes through. The bar up top points you at the desks and tools for it.' }));
    var f = h('form'), sel = h('select'), L = lanes();
    var g1 = h('optgroup', { label: 'A lane' });
    Object.keys(L).forEach(function (k) { if (S.share && L[k].sensitive) return; g1.appendChild(h('option', { value: k, text: L[k].name })); });
    var g2 = h('optgroup', { label: 'One desk' });
    visibleAgents().filter(function (a) { return a.id !== 'radar'; }).forEach(function (a) { g2.appendChild(h('option', { value: 'desk:' + a.id, text: a.name + (a.role ? ' · ' + a.role : '') })); });
    sel.appendChild(g1); sel.appendChild(g2);
    if (S.focus && S.focus.lane) sel.value = S.focus.lane;
    var task = h('input', { type: 'text', maxlength: '120', placeholder: 'What are you working on? e.g. Calls for the controller search' });
    if (S.focus && S.focus.task) task.value = S.focus.task;
    var dur = h('select'); [['50', '50 minutes'], ['25', '25 minutes'], ['90', '90 minutes'], ['0', 'Until I end it']].forEach(function (o) { dur.appendChild(h('option', { value: o[0], text: o[1] })); });
    f.appendChild(h('label', null, 'Working in', sel)); f.appendChild(h('label', null, 'For', dur));
    f.appendChild(h('label', { class: 'full' }, 'The task (optional)', task));
    var go = h('button', { class: 'key', type: 'submit', text: S.focus ? 'Switch focus' : 'Start deep work' });
    var row = h('div', { class: 'full sacts', style: 'padding:0;justify-content:flex-start' }, go);
    if (S.focus) { var end = h('button', { class: 'mini', type: 'button', text: 'End focus' }); end.addEventListener('click', function () { endFocus(); stand(); }); row.appendChild(end); }
    f.appendChild(row);
    f.addEventListener('submit', function (ev) {
      ev.preventDefault(); var mins = parseInt(dur.value, 10) || 0;
      startFocus({ lane: sel.value, task: task.value.trim(), kind: 'deep', until: mins ? new Date(Date.now() + mins * MIN).toISOString() : null });
      stand();
    });
    sec.appendChild(f);
  } };
  document.addEventListener('click', function (e) {
    var bc = e.target.closest('[data-card]'); if (bc) { openSheet('board', bc.getAttribute('data-card'), bc); return; }
    var gb = e.target.closest('[data-go]'); if (gb) { if (S.sheet && S.sheet.kind === 'board') stand(); goBoard(gb.getAttribute('data-go')); return; }
    var ak = e.target.closest('[data-autopsy]'); if (ak) { askAutopsy(ak.getAttribute('data-autopsy')); return; }
    var sb = e.target.closest('[data-seen]'); if (sb) { markSeen(sb.getAttribute('data-seen')); return; }
    var ab = e.target.closest('[data-act]'); if (ab) { markAction(ab.getAttribute('data-key'), ab.getAttribute('data-act')); return; }
    var ub = e.target.closest('[data-undo]'); if (ub) { undoAction(ub.getAttribute('data-undo')); return; }
    var tc = e.target.closest('[data-tk]'); if (tc && !tc.classList.contains('ghost')) { var ta = S.agents[tc.getAttribute('data-tk-agent')]; if (ta && hidden(ta)) return; openSheet('desk', tc.getAttribute('data-tk-agent'), tc); return; }
    var el = e.target.closest('[data-id],[data-stand],.bench,[data-lever],#radar');
    if (!el) return;
    if (el.hasAttribute('data-stand')) return stand();
    if (el.hasAttribute('data-lever')) return openSheet('lever', el.getAttribute('data-lever'), el);
    if (el.classList.contains('bench')) return openSheet('bench', el.getAttribute('data-bench'), el);
    if (el.id === 'radar') return openSheet('desk', 'radar', el);
    var id = el.getAttribute('data-id'); if (id) { var a = S.agents[id]; if (a && hidden(a) && el.classList.contains('smain')) return; openSheet('desk', id, $('.desk[data-id="' + id + '"]') || $('#radar')); }
  });
  /* Esc stands up from any desk, bench or lever, even while typing in the chat; captured first so nothing inside the sheet can swallow it */
  window.addEventListener('keydown', function (e) { if ((e.key === 'Escape' || e.key === 'Esc') && S.sheet) { e.preventDefault(); stand(); } }, true);
  document.addEventListener('keydown', function (e) {
    var bc = e.target && e.target.closest && e.target.closest('[data-card]'); if (bc && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openSheet('board', bc.getAttribute('data-card'), bc); return; }
    var gb = e.target && e.target.closest && e.target.closest('[data-go]'); if (gb && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); goBoard(gb.getAttribute('data-go')); }
  });
  toggle($('#sw-share'), setShare, 'eo-share');
  toggle($('#sw-still'), function (on) { root.classList.toggle('still', on); }, 'eo-still');
  toggle($('#sw-sound'), function (on) { S.sound = on; if (on) playClick(); }, 'eo-sound');
  toggle($('#sw-notes'), function (on) { root.classList.toggle('notes', on); });
  toggle($('#sw-theme'), function (on) { root.setAttribute('data-theme', on ? 'dark' : 'light'); });     // follows the device until switched (Kev to confirm)
  if (matchMedia('(prefers-color-scheme: dark)').matches) $('#sw-theme').setAttribute('aria-pressed', 'true');
  try {
    if (localStorage.getItem('eo-sound') === '0') { S.sound = false; $('#sw-sound').setAttribute('aria-pressed', 'false'); }
    if (localStorage.getItem('eo-still') === '1') { root.classList.add('still'); $('#sw-still').setAttribute('aria-pressed', 'true'); }
    if (localStorage.getItem('eo-share') === '1') { $('#sw-share').setAttribute('aria-pressed', 'true'); S.share = true; root.classList.add('share'); }
  } catch (x) {}
  addEventListener('resize', drawNotes); addEventListener('resize', drawFlow);
  $('#sw-recruit').addEventListener('click', function () {
    if (S.focus && S.focus.kind === 'recruit') endFocus(); else startFocus({ lane: 'recruiting', task: '', kind: 'recruit', until: null });
  });
  $('#focus-btn').addEventListener('click', function () { openSheet('lever', 'focus', $('#focus-btn')); });
  $('#stack-btn').addEventListener('click', function () { openSheet('stack', 'stack', $('#stack-btn')); });
  $('#more').addEventListener('click', function () { openSheet('stack', 'stack', $('#stack-btn')); });
  try { var fsaved = JSON.parse(localStorage.getItem('eo-focus') || 'null'); if (fsaved && fsaved.lane && (!fsaved.until || t(fsaved.until) > Date.now())) S.focus = fsaved; } catch (x) {}
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tg = e.target, typing = tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT' || tg.isContentEditable);
    if (typing) return;
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === 't' && !S.sheet) { e.preventDefault(); setMode(TD.mode === 'today' ? 'floor' : 'today'); return; }
    if (TD.mode !== 'today') return;
    if (k === 'Escape' && TD.study) { TD.study = false; renderAll(); return; }
    if (S.sheet || TD.study || !TD.doc) return;
    var sh = tdCurSheet(), tab = sh ? sh.id : 'qc', i = TD.sel[tab] == null ? 0 : TD.sel[tab], lead = sh && sh.leads[i], q = !sh && TD.doc.qc && TD.doc.qc[i];
    if (k === 'j' || k === 'ArrowDown') { e.preventDefault(); tdMove(1); }
    else if (k === 'k' || k === 'ArrowUp') { e.preventDefault(); tdMove(-1); }
    else if (k === 'Enter') { var nm = lead ? lead.name : q && q.name; if (nm && !S.share) { e.preventDefault(); tdCopy(nm); } }
    else if (k === 'd') { e.preventDefault(); if (lead) tdPut('row', lead.id, { d: !tdTick('row', lead.id).d }); else if (q) tdTouch(q, !tdTick('touch', q.id).value); }
    else if (k === 'v' && lead) { e.preventDefault(); tdPut('row', lead.id, { v: !tdTick('row', lead.id).v }); tdMove(1); }
    else if (k === 'c' && lead) { e.preventDefault(); tdPut('row', lead.id, { c: !tdTick('row', lead.id).c }); var n1 = document.querySelector('[data-td-in="note-' + lead.id + '"]'); if (n1) n1.focus(); }
    else if (k === 'n' && lead) { e.preventDefault(); var n2 = document.querySelector('[data-td-in="note-' + lead.id + '"]'); if (n2) n2.focus(); }
    else if ((k === 'o' || k === 'f') && lead) { e.preventDefault(); var want = k === 'o' ? 'O' : 'F.U.', cur = tdTick('row', lead.id).out; tdPut('row', lead.id, { out: cur === want ? '' : want }); }
    else if (k === 'z') { e.preventDefault(); tdUndoLast(); }
    else if (k === '[') { e.preventDefault(); tdTabStep(-1); }
    else if (k === ']') { e.preventDefault(); tdTabStep(1); }
    else if (k === 'p') { e.preventDefault(); tdLeaveBlock(); }
    else if (k === '?') { e.preventDefault(); TD.kb = !TD.kb; renderAll(); }
  });
  document.addEventListener('click', function (e) { if (TD.mode === 'today' && e.target.closest && e.target.closest('#board-grid [data-card]')) setMode('floor', true); }, true);
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-td-close]') && TD.study) { TD.study = false; renderAll(); } });
  setInterval(tdTickSecond, 1000);
  $('#m-floor').addEventListener('click', function () { setMode('floor'); });
  $('#m-today').addEventListener('click', function () { setMode('today'); });
  addEventListener('hashchange', function () { var hh = location.hash.slice(1); if (hh === 'today' && TD.mode !== 'today') setMode('today', true); });
  addEventListener('resize', function () { if (TD.mode === 'today') renderAll(); });
  boot();

