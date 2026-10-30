// Command Center · family.js (split from eden-office.html, 30 Oct 2026). Family wing: the look-ahead card (private; closes under Screen share).
// Panel files share the page's global scope and load in this order: core.js, floor.js, pulse.js, strip.js, family.js, desks.js, today.js, boot.js. Edit here, not in the html.
'use strict';
  /* ---------- Hawk's look-ahead card, inside the Family office wing (Kev, 30 Oct: "should we add our planning scheduler and a widget down here?") ----------
     Reads meta/lookahead, which Hawk writes: titles, dates and owners only, never a note. Private: hidden whole and unsubscribed under Screen share, like the wing. */
  function laDay(d, short2) {
    var x = new Date(d + 'T12:00:00Z'); if (isNaN(x)) return d;
    return x.toLocaleDateString('en-US', short2 ? { month: 'short', day: 'numeric', timeZone: 'UTC' } : { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }
  function laWhen(x, today) {
    if (x.start === today) return 'Today'; if (x.start === Game.addDays(today, 1) && !(x.end && x.end > x.start)) return 'Tomorrow';
    if (x.end && x.end > x.start) { var a = laDay(x.start, true), b = laDay(x.end, true); return a.split(' ')[0] === b.split(' ')[0] ? a + '–' + b.split(' ')[1] : a + ' – ' + b; }
    return laDay(x.start);
  }
  function laRow(x, today, withTag) {
    var ti = h('span', { class: 'ti' });
    if (withTag && x.kind === 'travel') ti.appendChild(h('span', { class: 'tag', text: 'Trip' }));
    if (withTag && x.kind === 'milestone') ti.appendChild(h('span', { class: 'tag ms', text: 'Milestone' }));
    ti.appendChild(document.createTextNode(x.title + (x.time ? ' · ' + x.time : '')));
    return h('li', null, h('span', { class: 'd', text: laWhen(x, today) }), ti, h('span', { class: 'o', text: x.owner || '' }));
  }
  function renderLookahead() {
    var box = $('#la'); if (!box) return;
    box.textContent = '';
    if (S.share) { box.hidden = true; return; }
    box.hidden = false;
    var d = S.look, today = Game.pacificDate(Date.now());
    box.appendChild(h('div', { class: 'la-h' }, h('span', { class: 'eyebrow', text: 'Look-ahead · Hawk' }), h('span', { class: 'eyebrow', text: d && d.week && d.week.start ? 'Week of ' + laDay(d.week.start, true) : '' })));
    if (!d) { box.appendChild(h('p', { class: 'none', text: 'Hawk has not written the look-ahead yet. It shows here after the next nightly run.' })); return; }
    var w = d.week || {}, wk = h('div');
    wk.appendChild(h('h4', { text: 'This week' }));
    if (w.one) wk.appendChild(h('p', { class: 'one', text: w.one }));
    if (w.work) wk.appendChild(h('p', { class: 'ln' }, h('b', { text: 'Work' }), w.work));
    if (w.family) wk.appendChild(h('p', { class: 'ln' }, h('b', { text: 'Family' }), w.family));
    if (!w.one && !w.work && !w.family) wk.appendChild(h('p', { class: 'none', text: 'No focus set for this week yet.' }));
    box.appendChild(wk);
    var decs = Array.isArray(d.decisions) ? d.decisions : [], decIds = {}; decs.forEach(function (x) { decIds[x.id] = true; });
    var nx = (Array.isArray(d.next) ? d.next : []).filter(function (x) { return !decIds[x.id]; });
    var cap = S.laAll ? nx.length : 6, nb = h('div'); nb.appendChild(h('h4', { text: 'Next 3 weeks' }));
    if (nx.length) {
      var ul = h('ul'); nx.slice(0, cap).forEach(function (x) { ul.appendChild(laRow(x, today, true)); }); nb.appendChild(ul);
      if (nx.length > 6) { var mb = h('button', { class: 'mini txt', type: 'button', text: S.laAll ? 'Show fewer' : '+' + (nx.length - 6) + ' more' }); mb.addEventListener('click', function () { S.laAll = !S.laAll; renderAll(); }); nb.appendChild(mb); }
    } else nb.appendChild(h('p', { class: 'none', text: 'Nothing dated in the next three weeks.' }));
    box.appendChild(nb);
    if (decs.length) {
      var db = h('div'); db.appendChild(h('h4', { text: 'Open decisions · decide by' }));
      var dl = h('ul'); decs.forEach(function (x) { dl.appendChild(h('li', null, h('span', { class: 'd', text: x.start === today ? 'Today' : laDay(x.start) }), h('span', { class: 'ti', text: x.title }), h('span', { class: 'o', text: x.owner || '' }))); }); db.appendChild(dl);
      box.appendChild(db);
    }
    var old = Date.now() - t(d.asOf) > 36 * HOUR, f = h('div', { class: 'foot2' });
    if (typeof d.url === 'string' && /^https:\/\//.test(d.url)) f.appendChild(h('a', { class: 'mini', href: d.url, target: '_blank', rel: 'noopener', text: 'Open the 12-week look-ahead' }));
    f.appendChild(h('span', { class: 'asof' + (old ? ' warn' : ''), text: 'as of ' + (d.asOf ? ptStamp(d.asOf) : 'unknown') + (old ? ' · older than a day' : '') }));
    box.appendChild(f);
  }
