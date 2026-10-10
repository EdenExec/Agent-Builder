# The Sunday lab review (every employee)

Kev's rule, 9 October 2026: "As part of our Sunday review, we should have each agent build a slide deck on the project they're working on, organised like an investor update. I come in with Radar, tell them where to go next, give that advice, then they go back to the lab. This turns the agents into their own project managers and I become a client reviewing status reports, looking at where they need advice."

So every employee is the project manager of its own projects. Once a week it reports to Kev the way a founder reports to an investor: short, numbers first, the ask on one slide. Kev reads, gives advice, and the employee goes back to work with that advice in its memory. Radar runs the meeting.

## What each employee builds

One deck per active project, by **Saturday 8pm Pacific**, no more than eight slides, in this order. Numbers come from the project's own ledger rows, QC items, Desk cards and files; nothing is invented, and anything not checked this week is marked UNVERIFIED.

| # | Slide | What goes on it |
|---|---|---|
| 1 | Title | Project, employee, week ending, one word of status (On track, Behind, Blocked) with the reason in one line |
| 2 | The ask | The one thing you need from Kev this week, with your recommendation first. If nothing, say "No ask" |
| 3 | Shipped | What was finished this week, each with a link to the evidence (Desk file, Drive doc, artifact) |
| 4 | Numbers | The project's three to five metrics against plan, as a table: planned, actual, delta. Same metrics every week so the trend shows |
| 5 | Blocked and at risk | What is stuck, why, what a week of delay costs, and what you tried |
| 6 | Decisions needed | Each open decision, your pick first, what silence does (the `defaultIfSilent`) |
| 7 | Next two weeks | Dated moves, who does each, what "done" looks like |
| 8 | Appendix | Open ledger rows, pending QC items, what the employee learned (goes to `memory/live/`) |

Rules: decks for home, family and learning projects (Atlas, Marlowe) carry KDTW Group; recruiting projects carry Eden Partner Group. Eden standard (Montserrat, white, black lettering, result first, three bullets or fewer per slide, data in tables, no emoji). No candidate contact details, compensation figures or client-confidential text on a slide; reference the system of record. The deck is a report, never an action: nothing is sent, spent or published because it was on a slide.

## How it is delivered

1. Write the deck source to `projects/<slug>/status/<YYYY-MM-DD>.md` (one `## Slide n · <title>` heading per slide, bullets and tables under it). That file is the record even when the rendered deck is lost.
2. Employees with the `Artifact` tool publish it as a Slides artifact (quickstart intent `slides`, type "Slides") titled "<Project> · lab review · <date>" and write the URL into the status file's front matter (`deck:`). Employees without `Artifact` stop at step 1; Radar renders the deck from the file.
3. Open one Desk card (collection `asks`, `kind: "status"`, `employee`, `project`, `status`, `ask`, `deck`, `file`, `urgency: "whenever"`) so Radar's collection pass finds it. Hard-rule approvals (spend, send, publish) still go through `npm run qc -- submit` as their own items; the deck only lists them.

## What Radar does

- **Saturday night, in the Sunday Edition build:** collect every `status` card and status file, render any deck that has no artifact, file all of them on the Eden Desk Sunday row (`kind: "deck"`) and in the Sunday Drive folder, and build the **Lab review** page of the Sunday Edition: one row per project (employee, status word, the ask, the deck link), then Kev's advice lines (blank, pen-in-hand). A project with no deck gets a row that says so.
- **Sunday evening, with Kev:** walk the decks in order of the ask's size. Kev reads the ask and the numbers and gives his advice. Radar writes each answer onto the status card (`status: "answered"`, `answer: {choice, text, at}`), onto a ledger row "Lab review · <date> · <employee>" (Lane Mine or Batch, Owner the employee, Source "lab review <date>"), and into the journal. Spending or sending Kev approves is still one QC approval each.
- **Monday:** each employee's next session reads its answered card first, writes the advice into `memory/live/` and goes back to the lab. Radar chases a card that is still unread on Wednesday.

Radar reviews its own week the same way, as one deck with the roster's status on slide 4, so Kev sees the whole lab on one page.
