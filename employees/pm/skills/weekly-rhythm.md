# Weekly rhythm

Pacific time. The Sabbath runs Friday sunset to Saturday sunset (`npm run sabbath`): you do nothing in it, and anything Kev sends waits for after Saturday sundown. Office tickets run Sunday to Friday sunset; the schedule rhythm runs Monday to Friday. Sunday evening is the lab review with Kev and Radar; you read the answered card on Monday.

| When | What | Output |
|---|---|---|
| Every hour, 6am to 10pm, Sunday to Friday | Office tickets, through Radar's ticket runner (`employees/radar/skills/ticket-runner.md` runs every open ticket with `subagent_type: pm`) | The ticket's ask done or gated; `memory/live/now.json` updated |
| Monday morning | Set the week's milestones | The week's milestone lines on each schedule; owner and date batch to Radar |
| Wednesday | Chase pass (`skills/chase-pass.md`) | Chases drafted, slips flagged, chase dates reset |
| Any weekday a chase date comes due | Chase that row | Same as Wednesday, for that row only |
| Friday by 1:50pm | Status in the EOW agent reports with two to three asks for Kev | `projects/<slug>/status/<date>.md` and the deck (`skills/ship-and-report.md`) |

## Office tickets (every hour)

Radar's ticket runner picks up every open ticket within the hour (a ticket open 60 minutes is a FAIL on the Office scoreboard) and starts you with the ticket id and Kev's ask word for word.

1. Write `memory/live/now.json`: the ticket's task, `state: "working"`.
2. Do the ask from your playbooks. Write files; never commit (Radar commits).
3. If the work would send, spend, publish or write into a live system, stop at the draft and say so: Radar sets the ticket to `gated` with the QC id. Draft text for Kev goes in the repo (`projects/<slug>/drafts/<YYYY-MM-DD>-<to>.md`) because the runner has no mail connector; the next inbox sweep moves it into Superhuman Drafts.
4. Return one to two lines, outcome first: what was done, the file or link, the one flag. Update `now.json` to `idle` or `blocked` (with `blockedOn` naming what Kev must do).

## Monday: set the week's milestones

1. Read last week's answered lab-review card and Kev's advice; write the advice into `memory/live/`.
2. For each project, list the rows due this week and next. Each gets a named owner and a next action that can happen this week.
3. Write the week's milestones at the top of each schedule ("Week of 26 Oct: owners and dates confirmed; quote pack drafted").
4. Hand Radar one batch: owners and dates still marked "(A)", each with your pick and what silence does (silence keeps your proposal). Proposed ledger rows for anything Kev or Nick owns.

## Wednesday: chase pass

Run `skills/chase-pass.md` in full across every project. Slips go to Radar the same day.

## Friday: status and asks

By 1:50pm, write the status file and deck per `skills/ship-and-report.md`. Slide 2 carries two to three asks for Kev. The EOW agent reports routine collects it and emails Kev the roster; Radar walks it with Kev on Sunday.

## When a project is added

The first ticket for a new project is always the schedule: build it per `skills/schedule-keeping.md` the same day, and put it on the next Monday's milestone set.
