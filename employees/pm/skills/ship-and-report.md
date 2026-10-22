# Ship and report

How your work leaves you, and how you report each week.

## Where things go

| Output | Where | Who sees it |
|---|---|---|
| Project schedule and ledger | `projects/<slug>/schedule.md` | Kev and Radar; Nick through Kev |
| Weekly status (lab review source) | `projects/<slug>/status/<YYYY-MM-DD>.md`, deck as a Slides artifact | Kev, through the EOW agent reports and the Sunday lab review |
| Chases and requests to Nick or outside parties | QC `send_message` item with exact text and recipients, or Superhuman Drafts through Radar | Kev decides |
| Proposed ledger rows | The one-line hand-off to Radar | Radar files them in Notion |
| Slip flags | To Radar the same day (format in `skills/chase-pass.md`) | Radar, then Kev |

## Approvals

- Any message to anyone outside the workshop, Nick included: `npm run qc -- submit pm send_message "<summary>" "<exact text>" --to <a@b.co>`; then stop.
- Sharing a schedule or status page beyond Kev and Radar: `publish` item.
- Any spend (a quote fee, a retainer, a filing): `spend` item with amount and vendor. You do not recommend spend amounts; Tally sizes them.
- Any write into Notion, a calendar, someone else's Google Doc or a shared sheet: `write_external` item with the exact rows and fields.
- One approval covers one item. You never run `qc -- approve`.

## Radar hand-off

One line per output: what it is, the link, the one flag. Proposed ledger rows as a short table (Item, Lane, Owner, Due, Next action with chase date, Source). Questions in one ranked batch, your pick first, with what silence does.

## Friday status in the EOW agent reports (two to three asks)

Per `employees/_shared/lab-review.md`: by Friday 1:50pm Pacific write `projects/<slug>/status/<YYYY-MM-DD>.md` (eight slides, `## Slide n · <title>`), publish it as a Slides artifact titled "<Project> · lab review · <date>" and put the URL in the front matter (`deck:`), then open a `status` card on the Desk. Slide 2 carries two to three asks for Kev, each with your pick first and what silence does, sized to fit one admin window. Slide 4 carries the same four schedule metrics every week:

| Metric | Meaning |
|---|---|
| Milestones on date | Milestones hit on their original date, of those due so far |
| Rows past due | Rows past their due date and not Done |
| Slips this week | Rows marked Slipped this week, each with a recovery date |
| Rows without date, owner or next action | Must be zero |

No pay, commission, investor or client figures on any slide: reference the schedule and Kev's doc. Monday: read the answered card first and write Kev's advice into `memory/live/`.

## Office status (Kev, 21 October 2026)

At the start and end of every working session, write `memory/live/now.json` in your employee folder:
`{"task": "<one line, names and roles only>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

This file drives your desk light and task line on Eden Office (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW). If the file is missing, your desk reads "No task posted"; if it's over 4 hours old while you claim to be working, your desk shows Stale.

For the PM, the task line names the project and the milestone only ("Eden Staffing: Wednesday chase pass"). Never put pay, commission, investor or client figures, or an unsigned client name, in it.
