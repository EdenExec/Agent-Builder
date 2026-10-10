# The Atlas Desk (filing lessons and reading the score)

The Desk is the family's learning ledger, an artifact with a shared database (`desk.json` has the URL). Kev and G open it on a phone. Every package Atlas makes becomes one lesson row there, and the Desk pays G for three things: finishing it, teaching it back to Kev in four sentences, and doing the action item. Kev sets the rates on the Rules tab.

## Filing a lesson (every package, no exceptions)

`ArtifactData` `set` on collection `lessons`, doc id a short slug (`ep3-rome`, `report-compound-interest`, `drill-chess-2`):

| Field | What |
|---|---|
| track | one of the 13 fixed ids: history, science, math, words, people, art, character, strength, outdoors, firearms, chess, money, ai |
| format | Episode, Report, Essay, Drill |
| title, blurb | the title; two sentences G would read |
| week | the Monday of the week it is meant for, ISO date (2026-10-12) |
| order | position within the week |
| status | planned (not built yet) or ready (built, link present) |
| link | the artifact or Drive URL of the package, when there is one |
| teachbackQuestion | the four-sentence prompt G answers to Kev |
| actionItem | one concrete thing to do, checkable |
| done, teachback, action | false on creation; the family ticks them |

Never tick a box for G. Never edit the ledger or the rules; those are Kev's. Use `update` with `if_version` when changing an existing lesson.

## Reading the score

At the start of every session: `list` `lessons`, note what is done, what is overdue (week in the past and not complete), and which teach-backs passed. That is the signal for the next package's level, and for what goes into the Sunday Edition's "Atlas week" box via Radar.

## G's pick

The next-topic choices Atlas offers at the end of a package go in as `planned` lessons in the following week, titled "G's pick: ...", so they show on the Up next list. When Kev or G chooses, the others are deleted or moved out a week.

## The Desk's sections (rebuilt 10 October 2026, Kev's ask)

Kev: "spin up a media library in Atlas's Desk... standalone only in Atlas's Desk." Every episode lives on the Atlas Desk, never only on the Eden Desk.

| Tab | Collection(s) | What Atlas does there |
|---|---|---|
| Home | `tickets` (title, who G/Kev/Both, status todo/done, week, order, `reward` null or {minutes} or {dollars} or {prize text}, `paid`) | Files the week's few to-dos as tickets every Sunday plan: G's pick, the action item, a book to start. A ticket with a reward is a deal (Kev, 10 Oct: "Pick up Todd's dog poop" earns a gaming session with a buddy): G taps it done, Kev taps Pay, and the page writes a `ledger` row {kind earn, minutes, dollars, prize, note, ticketId}; prizes sit on the Bank tab until Kev taps Used it (`redeemed`). Never ticks or pays one. |
| Listen | `media` (title, file, minutes, track, lessonId, order, addedAt, blurb), `progress/<mediaId>` (pos, dur, at, finished; the page writes it), `clips` (mediaId, t seconds, note, who; the family writes them) | Publishes each episode MP3 into the Desk's published files at `files/<Name>-episode.mp3` (Artifact publish with `files`, same URL, under 15 MB) and sets one `media` row; sets `mediaId` on the lesson so its card shows Listen. Reads clips before the next episode: what G clipped is what landed. |
| Lessons | `lessons`, `tracks` | As above. |
| Reading | `books` (title, author, series, seriesOrder, status want/reading/done, reward $), `series` (name, author, total, order, prize, prizeGiven), `projects` (title, status idea/doing/done) | Adds books G or Kev name. Rewards: $10 a book, $15 for a long one (Kev's rule, 10 Oct: "$10-15 incentive" per book). The series prize is Kev's to set; never fill it in. |
| Scouts | `settings/scouts` (pack, rank, meets), `scouts` (name, track, required, status planned/working/earned, rank) | When Kev sets the pack and rank, load that rank's adventures from the official Scouting America requirements (cite the page; mark UNVERIFIED if not opened) and link each to a track, so a lesson and an adventure count twice. |
| Bank, Rules | `ledger`, `settings/rules` (lesson, teach, action, bonus, book, scout) | Never write. Kev's. |

The page source lives at `employees/atlas/desk/atlas-desk.html`. Republish the page from that file (same URL) when it changes; omit `capabilities` so `db` and `user` carry forward; pass the MP3s again only when adding a new one (files left out are kept).
