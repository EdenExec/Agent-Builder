// Eden Office game core: the ticket SLA ("FAIL" and "STALL"), the points, the streak and the records.
// ONE source, two homes. The sync script (workshop/core/office.ts) imports it; the Office page carries a verbatim copy between the
// GAME-CORE markers in projects/virtual-office/draft/eden-office.html (`npm run office -- build-page` refreshes the copy; a test fails on drift).
// So: plain ES2015, no imports, no DOM, only exported functions and vars (the page wraps them in a closure named Game).
// Pure: every function takes `now` (ms) as an argument.
//
// THE RULES (Kev, 22 Oct 2026; the tests pin each one)
//   The runner clock counts only 6am to 10pm Pacific, Sunday to Friday. Saturday never counts: nothing fails, nothing scores, nothing is announced.
//   FAIL   a ticket still `open` (nobody picked it up) after more than 60 runner minutes. Done and gated tickets are never in a FAIL state.
//   STALL  a ticket `picked` or `working` for more than 4 runner hours with no result.
//   A ticket that was picked up late stays a FAIL on the day it crossed 60 minutes (-3), so the streak and the score are honest history.
//   Points  closed ticket: 3 if priority is "today", else 2. +1 picked within 60 runner minutes. +2 closed the same Pacific day it was filed.
//           Kev's own moves: 2 each (a Done, Follow up or Approve tap, a QC approval). FAIL: -3.
//   Streak  consecutive working days (Sun to Fri, Saturday skipped without breaking it) with zero FAILs, counted from the first ticket on record.

var TZ = 'America/Los_Angeles';
export var SLA_PICKUP_MIN = 60;
export var STALL_MIN = 240;
export var RUNNER_START_HOUR = 6;
export var RUNNER_END_HOUR = 22;
export var POINTS = { today: 3, other: 2, onClock: 1, sameDay: 2, kevMove: 2, fail: -3 };
export var OPEN_STATUSES = ['open', 'picked', 'working', 'blocked', 'gated'];
/** A record is only announced once it is worth a banner. */
export var RECORD_FLOORS = { closedInDay: 3, weekPoints: 10, streakDays: 3 };

var fmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
function parts(ms) {
  var o = {};
  fmt.formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; });
  return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second };
}
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function parse(iso) { if (!iso) return null; var n = Date.parse(iso); return isNaN(n) ? null : n; }
function offsetAt(ms) { var p = parts(ms); return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000; }
function localMs(date, hour) {
  var a = date.split('-'), local = Date.UTC(+a[0], +a[1] - 1, +a[2], hour, 0, 0), u = local - offsetAt(local);
  return local - offsetAt(u);
}

/** 'YYYY-MM-DD' in Pacific time. */
export function pacificDate(ms) { var p = parts(ms); return p.y + '-' + pad(p.mo) + '-' + pad(p.d); }
export function dayOfWeek(date) { var a = date.split('-'); return new Date(Date.UTC(+a[0], +a[1] - 1, +a[2])).getUTCDay(); }
export function addDays(date, n) {
  var a = date.split('-'), x = new Date(Date.UTC(+a[0], +a[1] - 1, +a[2] + n));
  return x.getUTCFullYear() + '-' + pad(x.getUTCMonth() + 1) + '-' + pad(x.getUTCDate());
}
export function isSabbath(date) { return dayOfWeek(date) === 6; }
/** The Sunday that opens this date's week. */
export function weekStart(date) { return addDays(date, -dayOfWeek(date)); }

function runnerWindow(date) { return isSabbath(date) ? null : [localMs(date, RUNNER_START_HOUR), localMs(date, RUNNER_END_HOUR)]; }
export function isRunnerTime(ms) { var w = runnerWindow(pacificDate(ms)); return !!w && ms >= w[0] && ms < w[1]; }

/** Minutes of runner time between two instants: the only clock a ticket waits on. */
export function runnerMinutes(from, to) {
  if (!(to > from)) return 0;
  var d = pacificDate(from), last = pacificDate(to), total = 0, guard = 0;
  while (guard++ < 800) {
    var w = runnerWindow(d);
    if (w) { var a = Math.max(from, w[0]), b = Math.min(to, w[1]); if (b > a) total += (b - a) / 60000; }
    if (d >= last) break;
    d = addDays(d, 1);
  }
  return total;
}
/** The instant when `minutes` of runner time have passed since `from` (with 0: the next moment the runner is on the clock). */
export function addRunnerMinutes(from, minutes) {
  var d = pacificDate(from), left = minutes, guard = 0;
  while (guard++ < 800) {
    var w = runnerWindow(d);
    if (w && w[1] > from) {
      var a = Math.max(from, w[0]), room = (w[1] - a) / 60000;
      if (left <= room) return a + left * 60000;
      left -= room;
    }
    d = addDays(d, 1);
  }
  return from + minutes * 60000;
}

/** 2h 10m, 45m, 1d 3h. */
export function fmtWait(min) {
  var m = Math.max(0, Math.floor(min));
  if (m < 60) return m + 'm';
  var h = Math.floor(m / 60);
  if (h < 24) return h + 'h ' + (m % 60) + 'm';
  return Math.floor(h / 24) + 'd ' + (h % 24) + 'h';
}
export function clip(text, n) {
  var s = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}
/** "Ticket waiting 2h 10m: <ask, 60 chars>" or "Ticket stalled 5h 0m: <ask>". */
export function slaTitle(state, minutes, ask) { return 'Ticket ' + (state === 'stall' ? 'stalled ' : 'waiting ') + fmtWait(minutes) + ': ' + clip(ask, 60); }

function hasResult(t) { return !!(t.result && (t.result.summary || t.result.link)); }

/** When a ticket was picked up (ms), or null while it is still `open`. A done ticket with no pickedAt counts as picked when it closed. */
export function pickupAt(t) {
  if (!t.status || t.status === 'open') return null;
  var pk = parse(t.pickedAt);
  if (pk == null && t.status === 'done') pk = parse(t.doneAt);
  if (pk == null) pk = parse(t.updatedAt);
  return pk;
}
/** The instant a ticket's 60 runner minutes run out. */
export function failDeadline(t) { var c = parse(t.createdAt); return c == null ? null : addRunnerMinutes(c, SLA_PICKUP_MIN); }
/** When this ticket FAILED (ms), or null. History: a ticket picked up late still failed, whatever it became since. */
export function failedAt(t, now) {
  var dl = failDeadline(t); if (dl == null || dl > now) return null;
  var pk = pickupAt(t), end = pk != null ? pk : (t.status === 'open' ? now : null);
  return end != null && end > dl ? dl : null;
}
/** The live state of one ticket: {state: 'ok'|'fail'|'stall', minutes, since}. Done, gated and blocked tickets are always ok. Saturday is always ok. */
export function slaState(t, now) {
  var c = parse(t.createdAt), ok = { state: 'ok', minutes: 0, since: null };
  if (c == null || isSabbath(pacificDate(now))) return ok;
  if (t.status === 'open') {
    var w = runnerMinutes(c, now);
    return w > SLA_PICKUP_MIN ? { state: 'fail', minutes: w, since: addRunnerMinutes(c, SLA_PICKUP_MIN) } : { state: 'ok', minutes: w, since: null };
  }
  if ((t.status === 'picked' || t.status === 'working') && !hasResult(t)) {
    var s = parse(t.pickedAt) || parse(t.updatedAt) || c, w2 = runnerMinutes(s, now);
    if (w2 > STALL_MIN) return { state: 'stall', minutes: w2, since: addRunnerMinutes(s, STALL_MIN) };
  }
  return ok;
}
/** Every ticket that is failing or stalled right now. */
export function slaFindings(tickets, now) {
  var out = [];
  (tickets || []).forEach(function (t) {
    var s = slaState(t, now);
    if (s.state !== 'ok') out.push({ id: t.id, agent: t.agent, state: s.state, minutes: s.minutes, since: s.since });
  });
  return out;
}

/** What closing this ticket scored: {points, base, onClock, sameDay, date}, or null if it is not a done ticket. */
export function ticketScore(t) {
  var c = parse(t.createdAt), dn = parse(t.doneAt) || parse(t.updatedAt);
  if (t.status !== 'done' || c == null || dn == null) return null;
  var pk = pickupAt(t), dl = addRunnerMinutes(c, SLA_PICKUP_MIN), date = pacificDate(dn);
  var onClock = (pk == null ? dn : pk) <= dl, sameDay = pacificDate(c) === date, base = t.priority === 'today' ? POINTS.today : POINTS.other;
  return { points: base + (onClock ? POINTS.onClock : 0) + (sameDay ? POINTS.sameDay : 0), base: base, onClock: onClock, sameDay: sameDay, date: date };
}

function median(xs) {
  if (!xs.length) return null;
  var s = xs.slice().sort(function (a, b) { return a - b; }), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * The whole game for one moment. input: {now, tickets: [...], actions: [{action, at}], qcByDay: {'YYYY-MM-DD': n}}.
 * Everything is derived from the tickets collection's history, so nothing is stored that cannot be recomputed.
 */
export function buildGame(input) {
  var now = input.now, tickets = input.tickets || [], actions = input.actions || [], qcByDay = input.qcByDay || {};
  var today = pacificDate(now), sab = isSabbath(today), days = {}, first = null;
  function D(date) { return days[date] || (days[date] = { date: date, points: 0, closed: 0, fails: 0, kev: 0, qc: 0 }); }
  var closedEvents = [], failEvents = [], pickups = [];

  tickets.forEach(function (t) {
    var c = parse(t.createdAt); if (c == null) return;
    var cd = pacificDate(c); if (first === null || cd < first) first = cd;
    var dl = addRunnerMinutes(c, SLA_PICKUP_MIN), f = failedAt(t, now), pk = pickupAt(t);
    if (f != null) { var fd = pacificDate(f); failEvents.push({ id: t.id, agent: t.agent, date: fd }); D(fd).fails++; D(fd).points += POINTS.fail; }
    if (pk != null) pickups.push({ agent: t.agent, date: pacificDate(pk), minutes: runnerMinutes(c, pk) });
    if (t.status === 'done') {
      var sc = ticketScore(t), dn = parse(t.doneAt) || parse(t.updatedAt);
      if (!sc || dn > now || isSabbath(sc.date)) return;
      closedEvents.push({ id: t.id, agent: t.agent, date: sc.date, points: sc.points, onClock: sc.onClock, sameDay: sc.sameDay, minutes: (dn - c) / 60000 });
      D(sc.date).closed++; D(sc.date).points += sc.points;
    }
  });
  var kevEvents = 0;
  actions.forEach(function (a) {
    if (!a || (a.action !== 'done' && a.action !== 'followup' && a.action !== 'approve')) return;   // approve: Kev's own yes in the Office (23 Oct)
    var at = parse(a.at); if (at == null) return;
    var d = pacificDate(at); if (isSabbath(d)) return;
    D(d).kev++; D(d).points += POINTS.kevMove; kevEvents++;
  });
  Object.keys(qcByDay).forEach(function (d) {
    var n = +qcByDay[d] || 0; if (!n || isSabbath(d)) return;
    D(d).qc += n; D(d).points += POINTS.kevMove * n;
  });

  var ws = weekStart(today), we = addDays(ws, 6), lws = addDays(ws, -7), lwe = addDays(ws, -1);
  function sum(from, to) {
    var s = { start: from, points: 0, closed: 0, fails: 0, kev: 0, qc: 0 };
    Object.keys(days).forEach(function (d) { if (d >= from && d <= to) { var x = days[d]; s.points += x.points; s.closed += x.closed; s.fails += x.fails; s.kev += x.kev; s.qc += x.qc; } });
    return s;
  }
  var inWeek = function (d) { return d >= ws && d <= we; };

  // leaderboard, this week
  var ag = {};
  function A(id) { return ag[id] || (ag[id] = { agent: id, closed: 0, fails: 0, points: 0, mins: [] }); }
  closedEvents.forEach(function (e) { if (inWeek(e.date)) { var a = A(e.agent); a.closed++; a.points += e.points; a.mins.push(e.minutes); } });
  failEvents.forEach(function (e) { if (inWeek(e.date)) { var a = A(e.agent); a.fails++; a.points += POINTS.fail; } });
  var rows = Object.keys(ag).map(function (id) { var a = ag[id]; return { agent: id, closed: a.closed, fails: a.fails, points: a.points, medianCloseMin: median(a.mins) }; })
    .sort(function (x, y) { return (y.points - x.points) || (y.closed - x.closed) || (x.agent < y.agent ? -1 : 1); });
  var wk = sum(ws, we);

  // open now, the oldest waiting
  var openNow = 0, oldest = null;
  tickets.forEach(function (t) {
    if (OPEN_STATUSES.indexOf(t.status) >= 0) openNow++;
    var c = parse(t.createdAt);
    if (t.status === 'open' && c != null && (oldest === null || c < oldest.at)) oldest = { id: t.id, agent: t.agent, createdAt: t.createdAt, at: c };
  });
  if (oldest) oldest = { id: oldest.id, agent: oldest.agent, createdAt: oldest.createdAt, waitedMin: runnerMinutes(oldest.at, now) };
  var pickMins = pickups.filter(function (p) { return inWeek(p.date); }).map(function (p) { return p.minutes; });

  // streak and records, walking the working days from the first ticket on record
  var run = 0, longest = { days: 0, on: null }, d = first, guard = 0;
  while (d !== null && d <= today && guard++ < 800) {
    if (!isSabbath(d)) {
      if (days[d] && days[d].fails > 0) run = 0; else run++;
      if (run > longest.days) longest = { days: run, on: d };
    }
    d = addDays(d, 1);
  }
  var mostClosed = { n: 0, date: null, on: null }, weeks = {}, dates = Object.keys(days).sort();
  dates.forEach(function (dt) {
    if (days[dt].closed > mostClosed.n) mostClosed = { n: days[dt].closed, date: dt, on: dt };
    var w = weekStart(dt), x = weeks[w] || (weeks[w] = { points: 0, on: null });
    x.points += days[dt].points; if (days[dt].points > 0) x.on = dt;
  });
  var bestWeek = { points: 0, weekOf: null, on: null };
  Object.keys(weeks).sort().forEach(function (w) { if (weeks[w].points > bestWeek.points) bestWeek = { points: weeks[w].points, weekOf: w, on: weeks[w].on }; });
  var zero = { date: today, points: 0, closed: 0, fails: 0, kev: 0, qc: 0 };

  return {
    today: today, sabbath: sab,
    day: sab ? zero : (days[today] || zero),
    week: wk, lastWeek: sum(lws, lwe),
    openNow: openNow, oldest: oldest, medianPickupMin: median(pickMins),
    streak: run, agents: rows,
    kev: { moves: wk.kev + wk.qc, points: (wk.kev + wk.qc) * POINTS.kevMove },
    records: { mostClosedDay: mostClosed, bestWeek: bestWeek, longestStreak: longest },
    firstDay: first,
  };
}

function better(a, b, key) { return !b || !(b[key] > 0) ? a : (a && a[key] > b[key] ? a : b); }
/** Records only ever advance: today's computation against what meta/records already holds (a tie keeps the earlier one). */
export function mergeRecords(live, prior) {
  prior = prior || {};
  return {
    mostClosedDay: better(live.mostClosedDay, prior.mostClosedDay, 'n'),
    bestWeek: better(live.bestWeek, prior.bestWeek, 'points'),
    longestStreak: better(live.longestStreak, prior.longestStreak, 'days'),
  };
}
/** Records set today that deserve their one quiet banner. `key` is what the page remembers so a banner shows once. Never on Saturday. */
export function newRecords(rec, today) {
  var out = [];
  if (isSabbath(today) || !rec) return out;
  var m = rec.mostClosedDay, b = rec.bestWeek, s = rec.longestStreak;
  if (m && m.n >= RECORD_FLOORS.closedInDay && m.on === today) out.push({ key: 'closed:' + today, text: 'New course record: ' + m.n + ' tickets closed in a day' });
  if (b && b.points >= RECORD_FLOORS.weekPoints && b.on === today) out.push({ key: 'week:' + b.weekOf, text: 'New course record: best week, ' + b.points + ' points' });
  if (s && s.days >= RECORD_FLOORS.streakDays && s.on === today) out.push({ key: 'streak:' + today, text: 'New course record: longest streak, ' + s.days + ' working days clean' });
  return out;
}
