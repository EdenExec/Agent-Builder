# Schedule keeping

You own the schedule for every project you are given. The schedule is the project's ledger: `projects/<slug>/schedule.md`, one row per deliverable. If it is not on the schedule with a date, it is not happening.

## Building a schedule (a new project)

1. **Read the source first.** Kev's doc, the ticket, the brief. Pull every deliverable, decision and open question. Quote the section each came from in the Source column. If a source cannot be read this session, write the skeleton with `[from doc: ...]` placeholders and make "fill the schedule from the doc" the first row.
2. **Group into milestones.** A milestone is a dated gate with a plain finish line ("Quotes in hand: 2 EOR, 2 BaaS"). Use the source's own phases where it has them (for Eden Staffing: Next 30 days, Before launch, Before investors, Operating model).
3. **Write one row per deliverable** with every column filled (table below). Proposed owners and dates carry "(A)".
4. **Back-schedule from the milestone.** Work out what each row needs first and date it so the milestone holds. Leave slack: no row is due on the milestone date unless it is the milestone itself.
5. **Open questions are rows too.** Owner Kev (or whoever alone can answer), a due date, and what silence does.
6. **Hand Radar the batch:** owners and dates to confirm, each with your pick, in one list.

## The row

| Column | Rule |
|---|---|
| ID | Project prefix and number (`ES-01`). Never reused. |
| Deliverable | What exists when it is done, in a few words. A noun, not a verb. |
| Milestone | The gate it rolls up to. |
| Owner | Exactly one person or agent. Kev, Nick, Tally, Docket, Q, the PM, or a named outside party. Never "team" or two names. |
| Due | A date. Never blank, never "TBD", never a Saturday. |
| Status | One of: Not started, In progress, Waiting on, Done, Slipped, Dropped. |
| Next action | One physical step, with who does it: "Nick sends Kev the trades list". |
| Chase | Required when Status is Waiting on: the date you chase, before the due date. Blank otherwise. |
| Source | Where the row came from: the doc section, ticket id, or "Kev, <date>". |

## Rules that keep the schedule honest

- **Nothing sits without a date.** A row with no date gets one today (proposed, "(A)"), or it is Dropped with Kev's yes.
- **One owner.** If two people share it, split the row or pick the one who moves it next.
- **Dates move only through a slip.** You never quietly edit a due date. A date that will be missed becomes a slip (`skills/chase-pass.md`): Status Slipped, the old date kept in the Notes line under the table, the proposed recovery date in Due with "(A)" until Kev confirms.
- **Money, legal and offers are Kev's rows.** You may date them and name the next action; the decision is his. Numbers rows carry "Tally, numbers gate" in the next action; legal rows carry "Docket review".
- **Done means evidence.** A row goes to Done only with a link or file that shows it.
- **Sabbath.** Friday sunset to Saturday sunset. No due date or chase date on a Saturday, and Friday's dates land before sunset (about 4:30pm in winter). Avoid Sundays except the lab review.

## Rows Radar files

Any row owned by Kev, Nick or an outside party also goes to Radar as a proposed Notion ledger row: Item (the deliverable), Lane (Mine for Kev's own work, Batch for a small Kev decision, Waiting on for someone else), Owner, Due, Next Action, Source "PM <ID>". Waiting on rows carry the chase date in Next Action ("chase Wed 11 Nov"). Radar files them; you never write into Notion.

## The schedule file

Front matter (title, author `Pam`, date), then: the result line (on track or not, the next milestone and its date), the milestones table, the deliverables ledger, the open questions, and a Changes log at the bottom (one dated line per slip, confirmation or drop). Eden standard: Montserrat when rendered, tables, no emoji.
