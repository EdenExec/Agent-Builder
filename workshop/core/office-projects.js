// Eden Office projects core: short titles, which project a ticket belongs to, and the item lists on an agent's desk.
// ONE source, two homes (same pattern as office-game.js). The sync (workshop/core/office-projects.ts, run hourly by office-prep) imports it;
// the Office page carries a verbatim copy between the PROJECTS-CORE markers (`npm run office -- build-page` refreshes it; a test fails on drift).
// So: plain ES2015, no imports, no DOM, only exported functions and vars (the page wraps them in a closure named Proj).
//
// Kev, 29 Oct 2026: "we need the feed to be a list of clickable projects we're working on with each bot. Tasks should be far more collapsed and have a
// title on them explaining what is done. but less is more here."

export var TITLE_WORDS = 8;     // a ticket or item title
export var STATUS_WORDS = 10;   // a project's one-line status
export var NEED_WORDS = 12;     // the "what I need from Kev" line
export var SHIPPED_DAYS = 7;    // shipped items stay on the desk this long
var DAY_MS = 86400000;

/** Collapse whitespace. */
export function squash(text) { return String(text == null ? '' : text).replace(/\s+/g, ' ').trim(); }

/** Cut at n words, never mid-word; an ellipsis marks a cut. Trailing punctuation and open brackets are dropped before the ellipsis. */
export function cutWords(text, n) {
  var s = squash(text); if (!s) return '';
  var w = s.split(' '); if (w.length <= n) return s;
  return w.slice(0, n).join(' ').replace(/[\s,;:.\-–—(\[]+$/, '') + '…';
}

/** The first clause: up to the first sentence end, semicolon, colon, dash or opening bracket. "Matched 6 of 8; 2 left unknown" -> "Matched 6 of 8". */
export function firstClause(text) {
  var s = squash(text).replace(/^[#>*\-\s"']+/, '');
  var m = /^(.{3,}?)(?:[.;:!?](?:\s|$)|\s[—–-]\s|\s\(|$)/.exec(s);
  return m ? m[1] : s;
}

/** The title the desk shows: the ticket's own `title` if the runner wrote one, else the first clause of the result summary (finished work) or of the ask. */
export function ticketTitle(x) {
  if (x.title) return cutWords(x.title, TITLE_WORDS);
  var summary = x.result && x.result.summary;
  var src = x.status === 'done' && summary ? summary : x.ask, c = firstClause(src);
  return cutWords(c.split(' ').length < 3 ? squash(src) : c, TITLE_WORDS);   // a one- or two-word clause ("Passed 3/3") says nothing: take the opening words instead
}

/** What is needed from Kev, in about 12 words: why a ticket is blocked (`blockedOn`), or the exact action waiting for his Approve (`proposed.exact`). */
export function needLine(x) {
  var s = x.status === 'blocked' ? x.blockedOn : x.status === 'gated' ? (x.proposed && x.proposed.exact) : (x.blockedOn || (x.proposed && x.proposed.exact));
  return cutWords(s, NEED_WORDS);
}

/** needs = waiting on Kev (blocked or gated); shipped = done; open = everything else still moving (open, picked, working, waiting). */
export function ticketState(x) {
  return x.status === 'blocked' || x.status === 'gated' ? 'needs' : x.status === 'done' ? 'shipped' : 'open';
}
export function isLive(x) { return ['open', 'picked', 'working', 'waiting', 'blocked', 'gated'].indexOf(x.status) >= 0; }

function esc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** Which project a ticket belongs to (defs = [{id, keywords}]). Order, first hit wins:
 *   1. the ticket's own `project` field, when it names a known project;
 *   2. a repo path in the ticket text or result link ("projects/eden-crm/..."): the folder name is the project;
 *   3. keywords: the project with the most whole-word keyword hits in the ask, title and result summary.
 *  Returns {id, how: 'field'|'path'|'keyword'} or null (the ticket is "other open work"). */
export function inferProject(x, defs) {
  var list = defs || [], i, j;
  if (x.project) for (i = 0; i < list.length; i++) if (list[i].id === x.project) return { id: list[i].id, how: 'field' };
  var hay = [x.ask, x.title, x.result && x.result.summary, x.result && x.result.link].join(' ').toLowerCase();
  for (i = 0; i < list.length; i++) if (hay.indexOf('projects/' + list[i].id + '/') >= 0) return { id: list[i].id, how: 'path' };
  var best = null, bestN = 0;
  for (i = 0; i < list.length; i++) {
    var n = 0, ks = list[i].keywords || [];
    for (j = 0; j < ks.length; j++) if (ks[j] && new RegExp('(^|[^a-z0-9])' + esc(String(ks[j]).toLowerCase()) + '([^a-z0-9]|$)').test(hay)) n++;
    if (n > bestN) { best = list[i].id; bestN = n; }
  }
  return best ? { id: best, how: 'keyword' } : null;
}

/** One item from a ticket. `link` is whatever the ticket carries (result.link); each home turns it into an http(s) URL. */
export function ticketItem(x) {
  return { title: ticketTitle(x), state: ticketState(x), link: (x.result && x.result.link) || '', at: x.doneAt || x.updatedAt || x.createdAt || null, ticket: x.id };
}

/** Split an agent's tickets into per-project lists and the rest. Done tickets older than SHIPPED_DAYS drop out; so do cancelled ones. */
export function groupTickets(tickets, defs, now) {
  var by = {}, loose = [];
  (tickets || []).forEach(function (x) {
    if (!isLive(x) && !(x.status === 'done' && recent(x.doneAt || x.updatedAt || x.createdAt, now))) return;
    var p = inferProject(x, defs);
    if (p) (by[p.id] = by[p.id] || []).push(x); else loose.push(x);
  });
  return { byProject: by, loose: loose };
}

export function recent(at, now) {
  if (!at) return true;
  var ms = typeof at === 'number' ? at : Date.parse(at);
  return isNaN(ms) || now - ms <= SHIPPED_DAYS * DAY_MS;
}

var ORDER = { needs: 0, open: 1, shipped: 2 };
/** A project's items: file items (a schedule's rows) plus its tickets' items, shipped ones only if recent, grouped needs / open / shipped (shipped newest first). */
export function mergeItems(fileItems, tickets, now) {
  var items = (fileItems || []).concat((tickets || []).map(ticketItem)).filter(function (i) { return i.state !== 'shipped' || recent(i.at, now); });
  return items.map(function (i, n) { return { i: i, n: n }; }).sort(function (a, b) {
    var d = ORDER[a.i.state] - ORDER[b.i.state];
    if (d) return d;
    if (a.i.state === 'shipped') { var t = (Date.parse(b.i.at) || 0) - (Date.parse(a.i.at) || 0); if (t) return t; }
    return a.n - b.n;
  }).map(function (o) { return o.i; });
}

export function countItems(items) {
  var c = { needs: 0, open: 0, shipped: 0 };
  (items || []).forEach(function (i) { if (c[i.state] !== undefined) c[i.state]++; });
  return c;
}

/** The chips on a project row: "2 open · 1 needs you · 3 shipped" as separate strings, zeros left out. */
export function chips(c) {
  var out = [];
  if (c.open) out.push(c.open + ' open');
  if (c.needs) out.push(c.needs + ' needs you');
  if (c.shipped) out.push(c.shipped + ' shipped');
  return out;
}

/** The status line when no file says one: the newest shipped item, else what is waiting. At most STATUS_WORDS words. */
export function autoStatus(items) {
  var c = countItems(items);
  var shipped = (items || []).filter(function (i) { return i.state === 'shipped'; })[0];
  if (c.needs) return cutWords('Waiting on Kev: ' + items.filter(function (i) { return i.state === 'needs'; })[0].title, STATUS_WORDS);
  if (c.open) return cutWords('Working: ' + items.filter(function (i) { return i.state === 'open'; })[0].title, STATUS_WORDS);
  if (shipped) return cutWords('Last shipped: ' + shipped.title, STATUS_WORDS);
  return 'Quiet this week';
}
