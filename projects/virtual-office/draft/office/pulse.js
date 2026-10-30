// Command Center · pulse.js (split from eden-office.html, 30 Oct 2026). Team pulse: dials and RPs by day per recruiter and team, weekly goals, the recruiter sheet.
// Panel files share the page's global scope and load in this order: core.js, floor.js, pulse.js, strip.js, family.js, desks.js, today.js, boot.js. Edit here, not in the html.
'use strict';
  /* ---------- Team pulse (Kev, 30 Oct 2026: "add to the virtual office charts with trends for each guy or for the team") ----------
     Per recruiter: CloudTalk dials by day (meta/phones, written by the stand-up) and Crelate RPs by day (meta/crelate rpDays, the hourly run), the last 10 weekdays,
     with the week so far against the same days last week, the 15-a-day line, progress to 75, and MPs / PTCs / submittals / first interviews.
     Counts and first names only. There is no dials goal, so dials show the trend alone. Hidden whole under Screen share and on the Sabbath, like the scoreboard it sits under. */
  function plFirst(n) { return String(n || '').split(' ')[0].toLowerCase(); }
  function plGrid(c, ph) {                   // the 10 weekdays: last week Mon to Fri, this week Mon to Fri
    if (c && c.dayKeys && c.dayKeys.length) return c.dayKeys;
    var last = c && c.weekOf ? c.weekOf : (ph && ph.dayKeys && ph.dayKeys.length ? ph.dayKeys[ph.dayKeys.length - 1] : null);
    if (!last) return [];
    var mon = Game.addDays(last, -((Game.dayOfWeek(last) + 6) % 7)), out = [];
    [-7, 0].forEach(function (o) { for (var i = 0; i < 5; i++) out.push(Game.addDays(mon, o + i)); });
    return out;
  }
  function plMap(keys, srcKeys, vals) { return keys.map(function (k) { var i = (srcKeys || []).indexOf(k); return i < 0 || !vals || vals[i] == null ? null : vals[i]; }); }
  function plSum(lists) {                    // add day by day; a day nobody has is null (no data), never zero
    return (lists[0] || []).map(function (_, i) { var v = lists.map(function (l) { return l[i]; }).filter(function (x) { return x != null; }); return v.length ? v.reduce(function (a, b) { return a + b; }, 0) : null; });
  }
  function plMax(lists, floor) { var m = floor; lists.forEach(function (l) { (l || []).forEach(function (x) { if (x != null && x > m) m = x; }); }); return m; }
  function plTrend(w, p) {
    var d = w - p;
    return !p ? (w ? ['new', 'up'] : ['–', 'fl']) : [(d >= 0 ? '▲' : '▼') + Math.abs(Math.round(d / p * 100)) + '%', Math.abs(d / p) < 0.1 ? 'fl' : d > 0 ? 'up' : 'dn'];
  }
  function plTip(keys, vals, what) { return keys.map(function (k, i) { return tdShort(k) + ': ' + (vals[i] == null ? 'no data' : vals[i] + ' ' + what); }).join('\n'); }
  function plSpark(vals, keys, o) {          // the Today panel's sparkline, ten days, a gap between the two weeks
    var sp = h('span', { class: 'td-spark pl-spark', title: plTip(keys, vals, o.what) });
    vals.forEach(function (x, i) {
      var cls = x == null ? 'na' : !x ? 'z' : keys[i] === o.today ? 'last' : (o.line && x < o.line ? 'lo' : '');
      if (i === 5) cls += ' wk';
      sp.appendChild(h('i', { class: cls.trim(), style: x ? 'height:' + Math.max(6, Math.round(x / o.max * 100)) + '%' : '' }));
    });
    if (o.line) sp.appendChild(h('b', { class: 'pl-ln', style: 'bottom:' + Math.min(100, Math.round(o.line / o.max * 100)) + '%' }));
    return sp;
  }
  function plBig(vals, keys, o) {            // the same ten days, larger, with a value above each bar and the weekday below
    var box = h('div', { class: 'pl-big', role: 'img', 'aria-label': o.label });
    [0, 5].forEach(function (from, wi) {
      var wk = h('div', { class: 'pl-wk' }, h('div', { class: 'pl-cap', text: (wi ? 'This week · ' : 'Last week · ') + tdShort(keys[from]).replace(/^\w+, /, '') + ' to ' + tdShort(keys[from + 4]).replace(/^\w+, /, '') })), cols = h('div', { class: 'pl-cols' });
      for (var i = from; i < from + 5; i++) {
        var x = vals[i], cls = x == null ? 'na' : !x ? 'z' : keys[i] === o.today ? 'last' : (o.line && x < o.line ? 'lo' : '');
        var bar = h('div', { class: 'bar' }, h('i', { class: cls, style: x ? 'height:' + Math.max(3, Math.round(x / o.max * 100)) + '%' : '' }));
        if (o.line) bar.appendChild(h('b', { class: 'pl-ln', style: 'bottom:' + Math.min(100, Math.round(o.line / o.max * 100)) + '%' }));
        cols.appendChild(h('div', { class: 'pl-col' }, h('span', { class: 'v' + (x == null ? ' na' : ''), text: x == null ? '–' : String(x) }), bar, h('span', { class: 'd', text: new Date(keys[i] + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }) })));
      }
      wk.appendChild(cols); box.appendChild(wk);
    });
    return box;
  }
  function plData() {                         // one pass over meta/crelate and meta/phones: what the panel and the sheet both draw
    var c = S.crelate, ph = S.phones; if (!c || !c.recruiters || S.share) return null;
    var keys = plGrid(c, ph), perDay = c.perDay || 15, goals = c.goals || { rpsWeek: perDay * 5, mpsWeek: 100 };
    var haveRp = c.dayKeys && c.dayKeys.length === keys.length;
    var rows = recRank(c.recruiters.map(function (r) { return Object.assign({}, r); })).map(function (r) {
      var p = ph && ph.people ? ph.people.filter(function (x) { return plFirst(x.name) === plFirst(r.name); })[0] : null;
      return { r: r, ph: p || null, dials: p ? plMap(keys, ph.dayKeys, p.days) : null, rp: haveRp && r.rpDays && r.rpDays.length === keys.length ? r.rpDays : null };
    });
    var withPh = rows.filter(function (x) { return x.ph; }), goalN = rows.filter(function (x) { return x.r.inGoal; }).length;
    var team = {
      dials: withPh.length ? plSum(withPh.map(function (x) { return x.dials; })) : null, wk: withPh.reduce(function (a, x) { return a + x.ph.week.dials; }, 0), pr: withPh.reduce(function (a, x) { return a + x.ph.prior.dials; }, 0), people: withPh.length,
      rp: haveRp && c.team.rpDays && c.team.rpDays.length === keys.length ? c.team.rpDays : null, goalN: goalN, rpGoal: goalN * goals.rpsWeek, mpGoal: goalN * goals.mpsWeek, line: goalN * perDay,
    };
    return { c: c, ph: ph, keys: keys, perDay: perDay, goals: goals, rows: rows, team: team,
      dmax: plMax(rows.map(function (x) { return x.dials; }), 20), rmax: Math.max(plMax(rows.map(function (x) { return x.rp; }), 0) * 1.1, perDay * 1.35),
      tdmax: plMax([team.dials], 20), trmax: Math.max(plMax([team.rp], 0) * 1.1, team.line * 1.35 || 20),
      dtoday: ph && ph.dayKeys && ph.dayKeys.length ? ph.dayKeys[ph.dayKeys.length - 1] : null, rtoday: c.todayCurrent ? c.through : null };
  }
  function plDialsCell(D, dials, wk, pr, max, who) {
    var cell = h('div', { class: 'pl-c' }, h('div', { class: 'pl-cap', text: 'Dials · CloudTalk' }));
    if (!dials) { cell.appendChild(h('span', { class: 'td-spark pl-spark' })); cell.appendChild(h('div', { class: 'pl-sub' }, h('span', { class: 'none', text: who + ' has no CloudTalk line in the last read' }))); return cell; }
    var tr = plTrend(wk, pr);
    cell.appendChild(plSpark(dials, D.keys, { max: max, today: D.dtoday, what: 'dials' }));
    cell.appendChild(h('div', { class: 'pl-sub' }, h('b', { text: String(wk) }), h('span', { class: 'u', text: 'wk' }), tr[0] === 'new' ? null : h('span', { class: tr[1], text: tr[0] }), h('span', { text: 'vs ' + pr + ' last wk' })));
    return cell;
  }
  function plRpCell(D, rp, wk, goal, due, inGoal, behind, max, line) {
    var cell = h('div', { class: 'pl-c' }, h('div', { class: 'pl-cap', text: 'RPs · Crelate' }));
    if (!rp) { cell.appendChild(h('span', { class: 'td-spark pl-spark' })); cell.appendChild(h('div', { class: 'pl-sub' }, h('b', { text: String(wk) }), h('span', { class: 'none', text: 'wk · days arrive with the next hourly Crelate read' }))); return cell; }
    cell.appendChild(plSpark(rp, D.keys, { max: max, line: line, today: D.rtoday, what: 'RPs' }));
    var sub = h('div', { class: 'pl-sub' });
    if (inGoal) {
      var pct = Math.min(100, Math.round(wk / goal * 100)), bar = h('span', { class: 'pl-prog' + (wk >= goal ? ' hit' : behind ? ' bh' : ''), title: wk + ' of ' + goal + ' RPs this week' + (due != null ? ' · ' + due + ' due so far' : '') }, h('i', { style: 'width:' + pct + '%' }));
      if (due != null) bar.appendChild(h('s', { style: 'left:' + Math.min(100, Math.round(due / goal * 100)) + '%' }));
      sub.appendChild(bar); sub.appendChild(h('span', null, h('b', { text: String(wk) }), ' / ' + goal));
    } else { sub.appendChild(h('b', { text: String(wk) })); sub.appendChild(h('span', { text: 'wk · no standard yet' })); }
    cell.appendChild(sub); return cell;
  }
  function plNums(w, mpGoal) {
    var n = h('div', { class: 'pl-n' });
    [['MP', 'mps'], ['PTC', 'ptcs'], ['SUB', 'subs'], ['FTI', 'ftis']].forEach(function (m) {
      var b = h('b', { text: String(w[m[1]]) }); if (m[1] === 'mps' && mpGoal) b.appendChild(h('em', { text: '/' + mpGoal }));
      n.appendChild(h('span', { title: { MP: 'MPs', PTC: 'Presented to client', SUB: 'Submittals', FTI: 'First interviews' }[m[0]] + ' this week' }, h('small', { text: m[0] }), b));
    });
    return n;
  }
  /* Kev, 30 Oct: "shrink to expandable widgets with the trends... gauges for each guy, expanding from the Vancouver office as a group down into recruiters'
     scores... very bare bones in the virtual office, more details in the recruiting area for Dean and I." The floor shows one office gauge that opens
     into a gauge per recruiter; the day-by-day table lives on the Recruiting bench sheet (plTable), and each recruiter's charts in their sheet. */
  function plArc(f) {                         // a semicircle from the left, f of the way round (0 to 1); centre (44,44), radius 36
    f = Math.max(0, Math.min(1, f || 0)); var a = Math.PI * (1 - f);
    return 'M8 44 A36 36 0 0 1 ' + (44 + 36 * Math.cos(a)).toFixed(2) + ' ' + (44 - 36 * Math.sin(a)).toFixed(2);
  }
  function plGauge(val, goal, due, cls, label) {
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 88 50'); svg.setAttribute('class', 'pl-g ' + (cls || '')); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label);
    function path(d, c) { var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', c); svg.appendChild(p); }
    path(plArc(1), 'bg');
    if (goal > 0 && val > 0) path(plArc(val / goal), 'fg');
    if (goal > 0 && due != null && due > 0) { var a = Math.PI * (1 - Math.min(1, due / goal)), l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', (44 + 29 * Math.cos(a)).toFixed(2)); l.setAttribute('y1', (44 - 29 * Math.sin(a)).toFixed(2)); l.setAttribute('x2', (44 + 42 * Math.cos(a)).toFixed(2)); l.setAttribute('y2', (44 - 42 * Math.sin(a)).toFixed(2)); l.setAttribute('class', 'due'); svg.appendChild(l); }
    return svg;
  }
  function plTrendChip(wk, pr) { if (wk == null) return h('span', { class: 'pl-tr fl', text: 'no dials' }); var tr = plTrend(wk, pr); return h('span', { class: 'pl-tr ' + tr[1], text: wk + ' dials' + (tr[0] === 'new' || tr[0] === '–' ? '' : ' ' + tr[0]) }); }
  function plPtcChip(r) { var v = plRatio(r.week.ptcs, r.week.rps, 100); return h('span', { class: 'pl-tr fl', title: 'PTCs per 100 RPs this week (a dash under ' + PL_MIN + ' RPs)', text: 'PTC/100 ' + (v == null ? '–' : v.toFixed(1)) }); }
  function renderPulse() {
    var box = $('#pulse'), body = $('#pl-body'), D = plData(), sab = derived().game.sabbath;
    if (S.share || sab) { box.hidden = true; body.textContent = ''; $('#pl-asof').textContent = ''; return; }
    box.hidden = false; body.textContent = '';
    if (!D) { $('#pl-asof').textContent = ''; body.appendChild(h('p', { class: 'pl-foot', text: 'Waiting for the office run to write the Crelate counts (meta/crelate). Crelate stays the system of record.' })); return; }
    var c = D.c, ph = D.ph, T = D.team, tw = c.team.week, due = c.team.standardToDate, behindN = c.team.behind || 0;
    $('#pl-asof').textContent = (ph ? 'Dials ' + ago(ph.asOf) + ' · ' : 'No dials yet · ') + 'Crelate ' + ago(c.asOf);
    var cls = T.rpGoal && tw.rps >= T.rpGoal ? 'hit' : c.team.gap < 0 ? 'bh' : '';
    var office = h('button', { class: 'pl-office', type: 'button', 'data-card': 'rec:__team', 'aria-label': 'Vancouver office: ' + tw.rps + ' of ' + T.rpGoal + ' RPs this week. Open the team charts.' },
      plGauge(tw.rps, T.rpGoal, due, cls + ' big', 'Office RPs, ' + tw.rps + ' of ' + T.rpGoal),
      h('span', { class: 'pl-ot' }, h('span', { class: 'pl-on', text: 'Vancouver office' }), h('b', { text: tw.rps + ' / ' + T.rpGoal + ' RPs' }),
        h('span', { class: 'pl-os' }, plTrendChip(T.dials ? T.wk : null, T.pr), h('span', { class: behindN ? 'bhn' : '', text: behindN ? behindN + ' behind pace' : 'all on pace' }))));
    var who = h('details', { class: 'pl-who' }); if (S.plWho) who.open = true;
    who.addEventListener('toggle', function () { S.plWho = who.open; });
    who.appendChild(h('summary', null, h('span', { class: 'eyebrow', text: 'Recruiters · ' + D.rows.length })));
    var grid = h('div', { class: 'pl-gs' });
    D.rows.forEach(function (x) {
      var r = x.r, goal = r.inGoal ? D.goals.rpsWeek : 0, gc = r.inGoal ? (r.week.rps >= goal ? 'hit' : r.behind ? 'bh' : '') : 'ng';
      grid.appendChild(h('button', { class: 'pl-card', type: 'button', 'data-card': 'rec:' + r.name, 'aria-label': r.name + ': ' + r.week.rps + ' RPs' + (r.inGoal ? ' of ' + goal + (r.behind ? ', behind pace' : '') : '') + '. Open the day-by-day charts.' },
        plGauge(r.week.rps, goal, r.inGoal ? r.standardToDate : null, gc, r.name + ' RPs'),
        h('span', { class: 'pl-cn', text: r.name }), h('b', { text: String(r.week.rps) + (r.inGoal ? ' / ' + goal : '') }), plTrendChip(x.ph ? x.ph.week.dials : null, x.ph ? x.ph.prior.dials : 0), plPtcChip(r)));
    });
    who.appendChild(grid);
    var more = h('button', { class: 'mini txt', type: 'button', text: 'Full charts · Recruiting bench' }); more.addEventListener('click', function () { openSheet('bench', 'recruiting', more); });
    body.appendChild(h('div', { class: 'pl-top' }, office, who));
    body.appendChild(h('div', { class: 'pl-foot pl-foot2' }, h('span', { text: 'RPs this week against ' + D.goals.rpsWeek + ' each; the tick is what is due so far; dials against the same days last week.' }), more));
  }
  /* Funnel ratios (Kev, 30 Oct: "should start ratio tracking"). Dean's definitions (employees/dean/skills/trends-and-values.md), plus dials per RP.
     This week against the four Monday weeks before it; a denominator under 5 is a dash, never a 100% off one PTC. No targets until Dean or Kev sets them. */
  var PL_MIN = 5;
  var PL_RATIOS = [{ id: 'ptc', label: 'PTCs / 100 RPs', num: 'ptcs', den: 'rps', x: 100, dp: 1 }, { id: 'sub', label: 'Subs / PTC', num: 'subs', den: 'ptcs', x: 1, dp: 2 },
    { id: 'fti', label: 'FTIs / sub', num: 'ftis', den: 'subs', x: 1, dp: 2 }, { id: 'dpr', label: 'Dials / RP', num: 'dials', den: 'rps', x: 1, dp: 1, neutral: true }];
  function plRatio(n, d, x) { return n == null || d == null || d < PL_MIN ? null : n / d * x; }
  function plRatioSets(r, p) {               // {wk, four} count sets for one recruiter, dials joined from CloudTalk by first name
    var wk = Object.assign({ dials: p ? p.week.dials : null }, r.week), four = r.fourWeeks ? Object.assign({ dials: p && p.four ? p.four.dials : null }, r.fourWeeks) : null;
    return { wk: wk, four: four };
  }
  function plRatioCell(def, sets) {
    var w = plRatio(sets.wk[def.num], sets.wk[def.den], def.x), f = sets.four ? plRatio(sets.four[def.num], sets.four[def.den], def.x) : null;
    var fmt = function (v) { return v == null ? '–' : v.toFixed(def.dp); }, arrow = '', cls = 'fl';
    if (w != null && f) { var d = (w - f) / f; arrow = Math.abs(d) < 0.1 ? '≈' : d > 0 ? '▲' : '▼'; cls = def.neutral || Math.abs(d) < 0.1 ? 'fl' : d > 0 ? 'up' : 'dn'; }
    return h('span', { class: 'pl-rc', 'data-l': def.label, title: def.label + ': this week ' + fmt(w) + ' (' + (sets.wk[def.num] == null ? 'no dials' : sets.wk[def.num]) + ' / ' + sets.wk[def.den] + '), last four weeks ' + fmt(f) + (sets.four ? ' (' + (sets.four[def.num] == null ? 'no dials' : sets.four[def.num]) + ' / ' + sets.four[def.den] + ')' : '') },
      h('b', { text: fmt(w) }), arrow ? h('span', { class: 'pl-tr ' + cls, text: arrow }) : null, h('small', { text: '4 wk ' + fmt(f) }));
  }
  function plRatios(body, D) {
    var c = D.c, hd = h('div', { class: 'pl-rhd' }, h('span', { text: 'Who' }));
    PL_RATIOS.forEach(function (def) { hd.appendChild(h('span', { text: def.label })); }); body.appendChild(hd);
    function row(name, sets, cls, sub) { var el = h('div', { class: 'pl-rrow' + (cls ? ' ' + cls : '') }, h('div', { class: 'pl-nm' }, name, sub ? h('small', { text: sub }) : null)); PL_RATIOS.forEach(function (def) { el.appendChild(plRatioCell(def, sets)); }); return el; }
    var tw = { dials: 0, rps: 0 }, tf = { dials: 0, rps: 0 }, anyFour = false;
    D.rows.forEach(function (x) {
      body.appendChild(row(x.r.name, plRatioSets(x.r, x.ph)));
      if (x.ph) { tw.dials += x.ph.week.dials; tw.rps += x.r.week.rps; if (x.ph.four && x.r.fourWeeks) { anyFour = true; tf.dials += x.ph.four.dials; tf.rps += x.r.fourWeeks.rps; } }
    });
    // the team's dials per RP counts only the people CloudTalk reads, so a recruiter without a line does not dilute it
    var teamRow = row('Team', { wk: c.team.week, four: c.team.fourWeeks || null }, 'us', D.team.people + ' on phones');
    teamRow.replaceChild(plRatioCell(PL_RATIOS[3], { wk: { dials: D.team.people ? tw.dials : null, rps: tw.rps }, four: anyFour ? { dials: tf.dials, rps: tf.rps } : null }), teamRow.lastChild);
    body.appendChild(teamRow);
    body.appendChild(h('p', { class: 'pl-foot', text: 'This week (' + tdShort(c.weekOf) + ' to ' + tdShort(c.through) + ') against the four weeks from ' + (c.fourFrom ? tdShort(c.fourFrom) : '…') + '. ▲▼ = this week against the four weeks, ≈ within 10%. A dash: under ' + PL_MIN + ' in the bottom number. Dials / RP: CloudTalk dials over Crelate RPs; no colour, since fewer dials per call is not always better. Targets: not set yet (Dean and Kev).' }));
    if (!c.fourFrom) body.appendChild(h('p', { class: 'pl-foot warn', text: 'The four-week counts arrive with the next hourly office run; until then only this week shows.' }));
    else if (D.ph && !D.ph.people.some(function (p) { return p.four; })) body.appendChild(h('p', { class: 'pl-foot', text: 'Four-week dials arrive with Radar\'s next stand-up (meta/phones).' }));
  }
  /* The day-by-day table (dials and RPs by day per recruiter and the team), on the Recruiting bench sheet. */
  function plTable(body, D) {
    var c = D.c, ph = D.ph, rng = D.keys.length ? tdShort(D.keys[0]) + ' to ' + tdShort(D.keys[D.keys.length - 1]) : '';
    var hd = h('div', { class: 'pl-hd' }, h('span', { text: 'Who' }), h('span', { text: 'Dials by day · CloudTalk' }), h('span', { text: 'RPs by day · line = ' + D.perDay + ' a day' }), h('span', { class: 'n', text: 'This week' }));
    body.appendChild(hd);
    function open(row, name, label) { row.setAttribute('data-card', 'rec:' + name); row.setAttribute('role', 'button'); row.setAttribute('tabindex', '0'); row.setAttribute('aria-label', label + ' Open the day-by-day charts.'); return row; }
    D.rows.forEach(function (x) {
      var r = x.r, wk = x.ph ? x.ph.week.dials : 0, pr = x.ph ? x.ph.prior.dials : 0;
      var row = h('div', { class: 'pl-row' }, h('div', { class: 'pl-nm', text: r.name }),
        plDialsCell(D, x.dials, wk, pr, D.dmax, r.name), plRpCell(D, x.rp, r.week.rps, D.goals.rpsWeek, r.standardToDate, r.inGoal, r.behind, D.rmax, D.perDay), plNums(r.week, 0));
      body.appendChild(open(row, r.name, r.name + ': ' + r.week.rps + ' RPs' + (x.ph ? ', ' + wk + ' dials against ' + pr + ' the same days last week.' : '.')));
    });
    var T = D.team, tw = c.team.week;
    var us = h('div', { class: 'pl-row us' }, h('div', { class: 'pl-nm' }, 'Team', h('small', { text: T.people + ' on phones · ' + T.goalN + ' in goal' })),
      plDialsCell(D, T.dials, T.wk, T.pr, D.tdmax, 'The team'), plRpCell(D, T.rp, tw.rps, T.rpGoal, c.team.standardToDate, T.goalN > 0, c.team.gap < 0, D.trmax, T.line), plNums(tw, T.mpGoal));
    body.appendChild(open(us, '__team', 'Team: ' + tw.rps + ' of ' + T.rpGoal + ' RPs this week.'));
    var f = recFresh(c), stalePh = ph && Date.now() - t(ph.asOf) > 40 * HOUR;
    body.appendChild(h('p', { class: 'pl-foot', text: rng + ' · last week, then this week. Dashed line = ' + D.perDay + ' RPs a day; faded bars fell short; the tick on the bar is what is due so far. No dials goal: the trend only.' }));
    body.appendChild(h('p', { class: 'pl-foot' + (f.warn || stalePh ? ' warn' : ''), text: 'Crelate, read-only, as of ' + ptStamp(c.asOf) + (c.live === false ? ' (saved board file, not a live pull)' : '') + (ph ? ' · CloudTalk, read-only, as of ' + ptStamp(ph.asOf) + ' (' + (ph.weekLabel || 'this week') + ' vs ' + (ph.priorLabel || 'last week') + ')' + (stalePh ? ': older than a day; Radar refreshes it with each stand-up' : '') : ' · CloudTalk counts not written yet (meta/phones, from the stand-up)') }));
    var notes = ph && ph.notes && ph.notes.length ? ph.notes : [];
    if (notes.length) {
      var ul = h('ul', { class: 'pl-notes' }), all = !!S.plAll; (all ? notes : notes.slice(0, 2)).forEach(function (n) { ul.appendChild(h('li', { text: n })); }); body.appendChild(ul);
      if (notes.length > 2) { var mb = h('button', { class: 'mini txt', type: 'button', text: all ? 'Fewer notes' : '+' + (notes.length - 2) + ' more' }); mb.addEventListener('click', function () { S.plAll = !all; renderAll(); }); body.appendChild(h('div', { class: 'pl-foot' }, mb)); }
    }
  }
  function plSheetCharts(D, sec, who, x) {      // both strips, larger, in the recruiter's sheet (x = a row, or null for the team)
    var team = !x, dials = team ? D.team.dials : x.dials, rp = team ? D.team.rp : x.rp, wk = team ? D.team.wk : x.ph ? x.ph.week.dials : 0, pr = team ? D.team.pr : x.ph ? x.ph.prior.dials : 0;
    sec.appendChild(h('h3', { text: 'RPs by day · Crelate' }));
    if (rp) {
      var line = team ? D.team.line : D.perDay;
      sec.appendChild(plBig(rp, D.keys, { max: team ? D.trmax : D.rmax, line: line, today: D.rtoday, label: who + ' RPs by day, last 10 weekdays' }));
      sec.appendChild(h('p', { class: 'small pl-bigcap', text: 'Dashed line = ' + (team ? line + ' (15 a day for each of ' + D.team.goalN + ' in goal)' : D.perDay + ' a day') + '. Faded bars are days that fell short of it. Blue is today' + (D.rtoday ? '' : ' (not read today)') + '.' }));
    } else sec.appendChild(h('p', { class: 'small', text: 'RPs by day arrive with the next hourly Crelate read.' }));
    sec.appendChild(h('h3', { text: 'Dials by day · CloudTalk' }));
    if (dials) {
      var tr = plTrend(wk, pr), ph = D.ph;
      sec.appendChild(plBig(dials, D.keys, { max: team ? D.tdmax : D.dmax, today: D.dtoday, label: who + ' dials by day, last 10 weekdays' }));
      sec.appendChild(h('p', { class: 'small pl-bigcap', text: wk + ' dials ' + (ph && ph.weekLabel ? ph.weekLabel : 'this week') + ' against ' + pr + ' the same days last week' + (ph && ph.priorLabel ? ' (' + ph.priorLabel + ')' : '') + (tr[0] === 'new' || tr[0] === '–' ? '' : ' (' + tr[0] + ')') + '. No dials goal is set: the trend only. As of ' + ptStamp(ph.asOf) + '.' }));
    } else sec.appendChild(h('p', { class: 'small', text: team ? 'No CloudTalk counts written yet (meta/phones, from the stand-up).' : who + ' is not in the last CloudTalk read.' }));
  }
  function recruiterSheet(p, key) {
    var c = S.crelate, team = key === 'rec:__team', name = key.slice(4);
    var r = c && c.recruiters ? (team ? null : c.recruiters.filter(function (x) { return x.name === name; })[0]) : null;
    if (!c || (!team && !r)) { p.appendChild(head(team ? 'Team' : name, null, 'Recruiter · Crelate, read-only', 'No data')); var e = h('div', { class: 'panel-b one' }); e.appendChild(h('section', null, h('p', { class: 'small', text: 'No Crelate counts for this recruiter yet.' }))); p.appendChild(e); return; }
    var week = team ? c.team.week : r.week, today = team ? c.team.today : r.today, due = team ? c.team.standardToDate : r.standardToDate, gap = team ? c.team.gap : r.gap;
    p.appendChild(head(team ? 'Team' : r.name, null, 'Recruiters · Crelate, read-only', 'As of ' + ptStamp(c.asOf)));
    var body = h('div', { class: 'panel-b one' }); p.appendChild(body); var sec = h('section'); body.appendChild(sec);
    sec.appendChild(h('h3', { text: 'Today against the week · ' + ptDay(c.weekOf) + ' to ' + ptDay(c.through) }));
    var tb = h('table'); tb.appendChild(h('tr', null, h('th', { text: 'Measure' }), h('th', { text: 'Today' }), h('th', { text: 'This week' }), h('th', { text: 'Standard to date' })));
    var perDay = c.perDay || 15;
    [['RPs (recruiting calls)', 'rps'], ['MPs', 'mps'], ['PTCs (presented to client)', 'ptcs'], ['Submittals', 'subs'], ['First interviews', 'ftis']].forEach(function (m) {
      var std = m[1] === 'rps' ? (due == null ? 'none yet (trainee)' : due + ' · ' + perDay + ' a day') : '–';
      tb.appendChild(h('tr', null, h('td', { text: m[0] }), h('td', { text: today ? String(today[m[1]]) : '–' }), h('td', { text: String(week[m[1]]) }), h('td', { text: std })));
    });
    sec.appendChild(h('div', { class: 'scroll' }, tb));
    var line = due == null ? 'No weekly standard yet, so no pace mark.' : gap === 0 ? 'Exactly on the standard to date.' : gap > 0 ? gap + ' RPs ahead of the standard to date.' : (-gap) + ' RPs behind the standard to date.';
    if (team) line += ' ' + (c.team.behind ? c.team.behind + ' of ' + c.team.people + ' behind pace: ' + c.recruiters.filter(function (x) { return x.behind; }).map(function (x) { return x.name; }).join(', ') + '.' : 'No one is behind pace.');
    sec.appendChild(h('p', { class: 'now', text: line }));
    var PD = plData(); if (PD) plSheetCharts(PD, sec, team ? 'Team' : r.name, team ? null : PD.rows.filter(function (y) { return y.r.name === r.name; })[0]);
    if (!today) sec.appendChild(h('p', { class: 'small', text: 'Today is blank because this data was not read today.' }));
    (c.notes || []).forEach(function (n) { sec.appendChild(h('p', { class: 'small', text: n })); });
    sec.appendChild(h('p', { class: 'small', text: 'RPs count calls logged. MPs, PTCs, submittals and first interviews count unique contacts per recruiter, counted again inside each window, so the week is not the sum of the days. Source: ' + (c.source || 'Crelate, read-only') + '. Counts only: no pay, phones or candidate names. Crelate stays the system of record.' }));
  }
