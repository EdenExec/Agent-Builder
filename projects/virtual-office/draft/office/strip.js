// Command Center · strip.js (split from eden-office.html, 30 Oct 2026). The Needs Kev strip and the Clear the stack sheet.
// Panel files share the page's global scope and load in this order: core.js, floor.js, pulse.js, strip.js, family.js, desks.js, today.js, boot.js. Edit here, not in the html.
'use strict';
  /* ---------- Needs Kev: answer it where you read it (Kev, 30 Oct: "this isn't working well right now, how do we make it easier to move on stuff?") ----------
     Four taps per line, Done / Later / Drop / Talk. A tap writes actions/alert-<alertKey> (source "strip", applied false) and the line hides at once, with ten
     seconds of Undo. Radar's runner applies it (ticket-runner step 9a). Approving a spend, a send or a publish is never a tap here: QC keeps its two taps. */
  var STACK_DAYS = 7, STRANK = { urgent: 0, reply: 1, review: 2, blocked: 3 };
  var STRIP_ACTS = [['done', 'Done', 'I handled it myself'], ['later', 'Later', 'Back on the next weekday at 7:00 am'], ['drop', 'Drop', 'No longer needed'], ['talk', 'Talk', 'Put it on the hit list for our next block']];
  var STRIP_WORD = { done: 'Done', later: 'Later', drop: 'Dropped', talk: 'Talk' };
  var stripUndo = [];
  /* Hidden: Kev answered it on the strip and Radar has not applied it yet (a Talk stays hidden: it is on the hit list), or Radar snoozed it (snoozeUntil in the future). */
  function stripHidden(key, a) {
    var x = S.actions['alert-' + key];
    if (x && x.source === 'strip') {
      if (/^ticket-/.test(key)) {                          // a ticket line has no alert doc for Radar to flip, so the page keeps the answer itself; Later wakes on the next workday at 7
        if (x.action !== 'later') return true;
        if (t(x.at) && Date.now() < at(nextWorkday(new Date(t(x.at))), 7).getTime()) return true;
      } else if (!x.applied || x.action === 'talk') return true;
    }
    return !!(a && a.snoozeUntil && t(a.snoozeUntil) > Date.now());
  }
  /* Everything open for Kev: raised in the last 7 days first (urgent, reply, review, blocked; newest first inside each), then the stale ones the same way. */
  function stackList() {
    var now = Date.now();
    return allItems().filter(function (i) { return i.needsKev && !i.seen && STRANK[i.light] !== undefined; })
      .map(function (i) { i.stale = !(t(i.raisedAt) && now - t(i.raisedAt) <= STACK_DAYS * DAY); return i; })
      .sort(function (a, b) { return (a.stale - b.stale) || (STRANK[a.light] - STRANK[b.light]) || (t(b.raisedAt) - t(a.raisedAt)); });
  }
  function stackGroup(i) {
    if (i.stale) return 'stale';
    var k = i.key || '';
    if (/^sync-qc-/.test(k) || i.kind === 'qc' || /^ticket-.+-gated$/.test(k)) return 'decide';   // spend, send, publish: QC and gated tickets
    if (i.kind === 'inbox' || /^sync-inbox-/.test(k) || i.light === 'reply') return 'reply';
    if (i.light === 'review') return 'review';                                     // finished work and cleared gates, ready to look at
    return 'unblock';                                                              // blocked agents, routines without a trigger, sign-ins, overdue ledger rows
  }
  function stripTap(i, action) {
    var key = 'alert-' + i.key, doc = { key: key, agent: i.agent || null, title: i.title || '', action: action, alertKey: i.key, at: new Date().toISOString(), by: 'kev', applied: false, source: 'strip' };
    S.actions[key] = doc;
    var u = { key: key, action: action, title: i.title || '' };
    stripUndo = stripUndo.filter(function (x) { return x.key !== key; }); stripUndo.push(u);
    setTimeout(function () { stripUndo = stripUndo.filter(function (x) { return x !== u; }); S.forceSheet = true; renderAll(); }, 10000);
    S.forceSheet = true; renderAll();
    if (S.live && S.db && S.canWrite) S.db.doc('actions/' + key).set(doc).catch(function () { if (S.actions[key] === doc) delete S.actions[key]; stripUndo = stripUndo.filter(function (x) { return x !== u; }); S.flash = 'That did not save. Try again.'; S.forceSheet = true; renderAll(); });
  }
  function answerSeg(i) {
    var seg = h('span', { class: 'seg', role: 'group', 'aria-label': 'Answer: ' + clip1(i.title, 50) });
    STRIP_ACTS.forEach(function (o) {
      var b = h('button', { class: 'mini', type: 'button', text: o[1], title: o[2], 'data-stk': o[0], 'aria-label': o[1] + ': ' + clip1(i.title, 60) }); b.disabled = !S.canWrite;
      b.addEventListener('click', function (ev) { ev.stopPropagation(); stripTap(i, o[0]); });
      seg.appendChild(b);
    });
    return seg;
  }
  /* A QC item keeps its own two-tap approval: the link opens the alert's own page. Anything else opens only when the link is worth opening. */
  function stripOpen(i, acts) {
    if (/^sync-qc-/.test(i.key || '')) { if (i.link) acts.appendChild(h('a', { class: 'mini txt', href: linkUrl(i.link), target: '_blank', rel: 'noopener', 'data-stk-open': 'qc', text: 'Approve in QC' })); }
    else if (usefulLink(i.link)) acts.appendChild(h('a', { class: 'mini txt', href: linkUrl(i.link), target: '_blank', rel: 'noopener', text: openLabel(i.link) }));
  }
  function undoLines(tag) {
    return stripUndo.map(function (u) {
      var b = h('button', { class: 'mini txt', type: 'button', text: 'Undo', 'data-undo': u.key }); b.disabled = !S.canWrite;
      return h(tag, { class: 'undo', 'data-stk-undo': u.key }, h('span', { class: 't', text: STRIP_WORD[u.action] + ' · ' + clip1(u.title, 70) }), b);
    });
  }
  function renderStrip() {
    var ol = $('#strip'); ol.textContent = '';
    var all = stackList(), every = all.filter(function (i) { return i.key !== bannerKey; });
    var items = every.filter(function (i) { return i.light === 'urgent' || inFocusAgent(i.agent); }), heldN = every.length - items.length, L = laneOf(S.focus);   // red always comes through a focus lane (Kev, 26 Oct)
    $('.strip-h .eyebrow').textContent = L ? 'Needs Kev · ' + L.name.toLowerCase() + ' only' + (heldN ? ' · ' + heldN + ' held' : '') : 'Needs Kev · ranked · three at most';
    if (!items.length) ol.appendChild(h('li', null, h('button', { class: 'smain', disabled: 'disabled' }, h('span'), h('span', { class: 'who', text: 'Clear' }), h('span', { class: 'what', text: L ? 'Nothing in this lane needs you. Head down.' : 'Nothing needs you.' }))));
    items.slice(0, 3).forEach(function (i) {
      var main = h('button', { class: 'smain', 'data-id': i.agent }, led(i.light, true), h('span', { class: 'who', text: nameOf(i.agent) }), h('span', { class: 'what', text: i.title }));
      main.setAttribute('aria-label', WORD[i.light] + ', ' + nameOf(i.agent) + ': ' + i.title);
      var acts = h('span', { class: 'sacts' });
      stripOpen(i, acts); acts.appendChild(answerSeg(i));
      ol.appendChild(h('li', { 'data-key': i.key }, main, acts));
    });
    undoLines('li').forEach(function (u) { ol.appendChild(u); });
    $('#strip-count').textContent = '';
    var sb = $('#stack-btn'); sb.hidden = !all.length; sb.textContent = 'Clear the stack · ' + all.length;
    var more = $('#more'), rest = items.slice(3), staleN = rest.filter(function (i) { return i.stale; }).length;
    more.hidden = !rest.length;
    more.textContent = rest.length ? rest.length + ' more waiting' + (staleN ? ' · ' + staleN + ' stale' : '') + ' · open the stack' : '';
  }
  function stackRow(i) {
    var row = h('div', { class: 'stk-r', 'data-key': i.key });
    row.appendChild(h('span', { class: 'stk-t' }, led(i.light, true), h('span', { class: 'who', text: nameOf(i.agent) }), h('b', { text: i.title, title: i.title })));
    row.appendChild(h('span', { class: 'ago', text: short(i.raisedAt) }));
    var acts = h('span', { class: 'stk-a' }); stripOpen(i, acts); acts.appendChild(answerSeg(i)); row.appendChild(acts);
    return row;
  }
  var STACK_GROUPS = [['decide', 'Decide', 'spend, send, publish'], ['reply', 'Reply', 'inbox'], ['unblock', 'Unblock', 'waiting on you'], ['review', 'Review', 'finished, ready to look'], ['stale', 'Stale', 'over 7 days']];
  function stackSheet(p) {
    var all = stackList();
    p.appendChild(head('Clear the stack', null, all.length ? all.length + ' open · one tap each' : 'Nothing open', 'Needs Kev'));
    var body = h('div', { class: 'panel-b one stk' }); p.appendChild(body);
    var ul = undoLines('div'); if (ul.length) { var us = h('section'); ul.forEach(function (u) { us.appendChild(u); }); body.appendChild(us); }
    if (S.flash) body.appendChild(h('section', null, h('p', { class: 'small', text: S.flash })));
    if (!all.length) { body.appendChild(h('section', null, h('p', { class: 'small', text: 'Nothing needs you. The stack is clear.' }))); return; }
    STACK_GROUPS.forEach(function (g) {
      var xs = all.filter(function (i) { return stackGroup(i) === g[0]; }); if (!xs.length) return;
      var sec = h('section', { 'data-group': g[0] }, h('h3', null, h('span', { text: g[1] + ' · ' + xs.length }), h('span', { class: 'hint', text: g[2] })));
      xs.forEach(function (i) { sec.appendChild(stackRow(i)); });
      body.appendChild(sec);
    });
  }
