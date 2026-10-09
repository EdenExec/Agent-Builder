# The Host desk (filing)

Host keeps everything for an event in one place so Radar and Kev can find it, and so nothing lives only in a chat.

## Files in the repo

`events/<slug>/` where the slug is `<yyyy-mm>-<client-or-name>-<event>` (for example `2026-11-pb-south-job-fair`):

| File | What |
|---|---|
| `brief.md` | Kev's words verbatim, goal, facts, assumptions |
| `plan.md` | The plan page (rendered with `npm run doc`) |
| `budget.md` | The budget line by line, quotes and QC item ids |
| `run-of-show.md` | The day and the check-in sheet layout |
| `follow-up.md` | The three drafts, the call list, the offer checklist |
| `scorecard.md` | Targets, actuals, lessons |
| `debrief.md` | Notes from the evening |

## Ledger rows (via Radar)

Radar owns the ledger (the Notion Daily Catch-Up Items database, `employees/radar/skills/ledger.md`). Host never writes to it. Host puts rows in `events/<slug>/ledger-rows.md`, one per next action, and tells Radar in its reply. A row has: Item (one line in Kev's words), Category, Lane (Mine, Batch, Waiting on, Scheduled, Someday), Owner (Kev, Nida, Nick, Joel, Recruiters, Ally, Radar, Other), Due, Bill rate (Revenue for hiring events, Enabling for internal ones), Source ("Host plan <slug>"), Next Action (the next physical step and who does it).

- Decisions for Kev go in as Lane Batch with a recommended answer and a default if silent.
- Dated milestones from the timeline go in as Lane Scheduled.
- Never put a credential, a candidate's private detail, a compensation figure or a bank detail in a row. Reference the email or the Crelate record.

## Drive folder (one per event)

Radar creates and keeps the Drive folder through the connector: `Events / <yyyy-mm-dd> <event name>` with subfolders Plan, Budget and Quotes, Run of Show, Attendees, Follow-up, Scorecard. Documents go on Eden letterhead (see `employees/_shared/eden-brand.md`). PDFs the connector will not take are dragged in by Kev. Host lists in `events/<slug>/drive.md` what belongs in each subfolder and its repo path, and never shares a folder with anyone outside Eden.

## QC

`npm run qc` lists what is waiting. Host submits items and never runs `approve` or `reject`. Each event file carries the QC ids it created, so the budget can be reconciled at the end.

## Asking Kev

Questions go to Radar as a Desk card or a batch row with `recommended` and `defaultIfSilent`. One decision per card, your pick first, what silence does stated. Default, then ask: never stall a plan on a question you can answer with a marked assumption.

## Memory

Venue and vendor facts go in `memory/seed/venues-and-vendors.md` through Radar once Kev approves a quote; between approvals use live memory: `npm run memory -- add host vendors "<fact>"`. Lessons from each event go to `npm run memory -- add host events "<fact>"`.
