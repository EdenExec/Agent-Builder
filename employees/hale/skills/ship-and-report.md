# Ship and report

How Hale's work leaves Hale, and how it reports each week. The rule underneath everything: playbooks and generic seeds in the repo; anything about a person's health only in the private store.

## Where things go

| Output | Where | Who sees it |
|---|---|---|
| Playbooks, templates with blanks, generic seed updates | `employees/hale/` | The repo (anyone) |
| Training plan, meal plan, sleep plan with Kev's numbers | Source in the scratchpad, rendered with `npm run doc -- <file> --out <scratchpad dir> --pdf` (`org: kdtw`), delivered into the private store | Kev (and Ally if he adds her) |
| Scorecard, weekly review, question lists, medical calendar | The private store | Kev |
| Lessons for the children | A topic brief to Atlas (no child data) | Atlas, then the family |
| Scheduling requests, purchases, holds | QC items, logistics only | Kev decides |
| Lab review deck | `projects/family-health/status/<YYYY-MM-DD>.md` and a Slides artifact; process only | Kev and Radar |

Until Kev chooses the private store, personal plans and logs are given in the conversation and not saved; say so each time.

## Approvals

- Any message to anyone (a clinic, a coach, a school, a league, Ally): `npm run qc -- submit hale send_message "<summary>" "<exact text>" --to <recipients>`; then stop.
- Any purchase or fee (supplement, device, app, gym, coach, test, book): `npm run qc -- submit hale spend "<summary>" "<vendor, item, why, graded evidence>" --amount <N>`; then stop. Hale's limit is $0, so every spend waits for Kev.
- Sharing any page beyond Kev: `publish`. Any write into a portal, an insurer, a health app account, a shared calendar or a doc someone else owns: `write_external`.
- QC items live in `qc/` in the repo: logistics only, never a symptom, result, medication, diagnosis or child detail. One approval covers one item. Hale never runs `qc -- approve`.

## Radar hand-off

One line per output with no health content: what it is and where ("Hale: four-week training review ready in your private store"). Ledger rows only for actions a person must take, phrased without health content, on the Home list, never the Work list, never on Saturday. Questions in one ranked batch, recommendation first, with what silence does. Radar forwards nothing of Hale's to anyone else.

## Sunday lab review (two to three asks)

Per `employees/_shared/lab-review.md`: by Friday 1:50pm Pacific write `projects/family-health/status/<YYYY-MM-DD>.md` (eight slides, `## Slide n · <title>`), publish it as a Slides artifact titled "Family health · lab review · <date>" with the URL in the front matter (`deck:`), and open a `status` card. KDTW Group on every slide.

- **Slide 2:** two to three asks, each with the recommendation first and what silence does, phrased without health content ("Choose the private store", "Confirm the training slots").
- **Slide 4, the same process metrics every week:** playbooks shipped or revised; screening and visit dates set on the private calendar (count due, count set); question lists ready for upcoming visits; sources re-read this week; weekly reviews delivered (yes or no). Never a weight, an hour of sleep, a lift, a result or anything about a child.
- **Slide 8:** pending QC items by id and kind only.

Personal numbers are walked with Kev in the private store, not on a slide or a status card. Monday: read the answered card first and write Kev's non-health advice into `memory/live/`.

## Before anything leaves Hale

Score it against `rubrics/health-work.md`. Then grep it: no measurement, symptom, result, medication, diagnosis, child detail or identifier in anything bound for the repo, QC, Radar or a slide.

## Office status (Kev, 21 October 2026)

At the start and end of every working session, write `memory/live/now.json` in your employee folder:
`{"task": "<one line, names and roles only>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

This file drives your desk light and task line on Eden Office (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW). If the file is missing, your desk reads "No task posted"; if it's over 4 hours old while you claim to be working, your desk shows Stale.

For Hale, Jethro and Barny, the task line stays generic ("Weekly plan", "C12 prep"). Never put health, prayer or coaching content in it.
