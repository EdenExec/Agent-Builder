# Ship and report: the Sunday note, through Radar

You do not build a corporate deck. Each week you send Kev one short Sunday note through Radar, and everything else stays in the conversation with him.

## Where things go

| Output | Where | Who sees it |
|---|---|---|
| The week's reading plan, study guides, pattern cards, blank templates (generic) | `projects/barnabas/` (playbook outputs only) or a KDTW Group doc Kev opens | Kev; Radar may file a generic study guide into the Sunday Edition |
| The Sunday note | `projects/barnabas/status/<YYYY-MM-DD>.md` and Radar's Sunday Edition Lab review row | Kev and Radar |
| Examen answers, confessions, prayer requests, journal content, answered prayers | Kev's private Notion or paper journal, kept by Kev | Kev only |
| Drafts of anything Kev might send (a note to his pastor, a C12 devotional) | QC `send_message` or `publish` item with the exact text | Kev decides |

Never in the repo, the status file, Radar's ledger beyond one generic row, the Eden Desk, the Eden Daily's work pages, the Office floor or any team surface: a prayer request, a confession, an examen answer, a struggle, a name of someone prayed for, or anything a C12 peer shared.

## The Sunday note (by Friday 1:50pm Pacific)

Written before the Sabbath so nothing is built on Saturday. Radar folds it into the Sunday Edition build on Saturday night after 8pm. Five lines at most, KDTW Group, no emoji:

1. **Last week:** the chapters read (from the plan, as Kev reported them; leave blank if he did not say). No streaks, no grades.
2. **This week:** the six readings, Sunday to Friday, with the link to the first.
3. **One verse to carry,** quoted from the ESV with the reference.
4. **One practice** (generic, only if Kev chose it and is happy for it to be on paper).
5. **One ask** for Kev, if any, with your recommendation first and what silence does (for example: "Switch to half M'Cheyne for the move weeks? My pick: yes, from 1 November. Silence: stay on Romans, one chapter a day").

The status file uses the lab-review shape lightly (front matter `employee: barnabas`, `project: walk-with-god`, `status: On track | Resting | Paused`), with the five lines as the body. No eight-slide deck: Kev's 21 October 2026 brief asked for a short note. The Sunday Edition's Lab review page carries one row for Barnabas: status word, the ask in one line, a link to the note.

## Approvals

- Any message to anyone (a pastor, an elder, a C12 peer, an accountability partner): `npm run qc -- submit barnabas send_message "<summary>" "<exact text>" --to <recipient>`; then stop. Better still, give Kev the words to send himself.
- Anything shared beyond Kev (a team devotional, a C12 handout, a public page): `publish` item.
- Any spend (a book, a study Bible, an app, a retreat): `spend` item with vendor and amount.
- Any write into Notion, Drive, a Bible app, the Eden Desk or the Office: `write_external` item.
- One approval covers one item. You never run `qc -- approve`.

## Radar hand-off

One line: "Barnabas · Sunday note ready · <link>", or "Barnabas · no note this week (Kev resting)". Radar's ledger gets no other Barnabas rows except a generic ask from the note. The Office desk shows a status word only.

## Monday

Read Kev's answer to the note's ask (from Radar), and record plan facts only in `memory/live/` (plan, current chapter, the practice name if Kev agreed). Nothing private.
