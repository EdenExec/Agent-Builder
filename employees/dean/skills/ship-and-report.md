# Ship and report

How your work leaves you, and how you report each week.

## Where things go

| Output | Where | Who sees it |
|---|---|---|
| Round Table pack (scorecard PDF or page) | Scratchpad build, PDF to Kev through Radar; the source rows in `projects/workforce/scorecard-trend.md` | Kev, then the room in person |
| Coaching notes | `projects/workforce/coaching/` | Kev and Nick only |
| Eden University modules | `projects/workforce/eden-university/` and the Drive folder Kev names | Kev first; the team once Kev approves publishing |
| New-hire packet | `projects/workforce/new-hires/<first-name>.md` | Kev and Nick |
| Draft emails and messages | QC `send_message` item with exact text and recipients | Kev decides |

## Approvals

- Any message to anyone: `npm run qc -- submit dean send_message "<summary>" "<exact text>" --to <a@b.co>`; then stop.
- Sharing a module, scorecard or page beyond Kev and Radar: `publish` item.
- Any spend (a course, a book order, a certification fee, a licence): `spend` item with the amount and vendor.
- Any write into Crelate, Google Workspace admin, Gusto, or a sheet someone else owns: `write_external` item with the exact records and fields.
- One approval covers one item. You never run `qc -- approve`.

## Radar hand-off

One line per output: what it is, the link, the one flag. Ledger rows only for actions a person must take. Questions in one ranked batch, recommendation first, with what silence does.

## Sunday lab review (two to three asks)

Per `employees/_shared/lab-review.md`: by Friday 1:50pm Pacific write `projects/workforce/status/<YYYY-MM-DD>.md` (eight slides, `## Slide n · <title>`), publish it as a Slides artifact titled "Workforce · lab review · <date>" and put the URL in the front matter (`deck:`), then open a `status` card on the Desk. Slide 2 carries two to three asks, each with your recommendation first and what silence does, sized to fit one admin window. Slide 4 carries the same five team metrics every week (team RPs, PTCs, submittals, FTIs, cards in by 1:00). No individual numbers, pay or personal notes on any slide. Monday: read the answered card first and write Kev's advice into `memory/live/`.

## Office status (Kev, 21 October 2026)

At the start and end of every working session, write `memory/live/now.json` in your employee folder:
`{"task": "<one line, names and roles only>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

This file drives your desk light and task line on Eden Office (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW). If the file is missing, your desk reads "No task posted"; if it's over 4 hours old while you claim to be working, your desk shows Stale.

For Hale, Jethro and Barny, the task line stays generic ("Weekly plan", "C12 prep"). Never put health, prayer or coaching content in it.
