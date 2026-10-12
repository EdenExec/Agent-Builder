# The ledger

The ledger is the Notion database **Daily Catch-Up Items** (data source `collection://be709daf-ca63-4687-9295-e329e54f87bf`, inside the page "Daily Catch-Up Log", https://app.notion.com/p/3ce25d7d12f48110b9f2d1dcda440b90). It already holds Kev's check-outs and follow-ups. Radar added five properties on 4 October 2026. Keep using the existing ones (Item, Category, Details, Next Action, Status, Date Logged) exactly as before so older rows and the chat projects still work.

## Properties Radar owns

| Property | Type | Values | Rule |
|---|---|---|---|
| Lane | select | Mine, Batch, Waiting on, Scheduled, Someday | Exactly one. Required on every row Radar creates or touches. |
| Owner | select | Kev, Nida, Nick, Joel, Recruiters, Ally, Radar, Marlowe, Other | Who moves it next. |
| Due | date | | When it is late. Bills: ten days before the due date. |
| Bill rate | select | Revenue, Enabling, Admin, Family, Formation | Decides order on the paper. Revenue first. |
| Source | text | | Where it came from: the email subject and sender, the event name and date, "check-out <date>", "Marlowe desk card <id>", "brain dump". |

## Lanes

| Lane | Means | Radar's move |
|---|---|---|
| Mine | Only Kev can do it and it earns a place on today's paper | Goes on the Run of Day, ordered by bill rate then due date |
| Batch | A small decision: yes/no, A/B, pay/hold | Held with a recommended answer and `defaultIfSilent` until the check-out. Silence applies the default the next morning. Never on the paper. |
| Waiting on | Someone else owes Kev | Superhuman reminder on the thread (`create_or_update_reminder`, `mark_done: false`). Chase after the agreed days. |
| Scheduled | It has a calendar slot | Confirm the event exists and prep is on the paper the day before |
| Someday | Real, not now | Reviewed Sundays. Dropped only with Kev's one-tap yes. |

## Writing rows

- Search before creating: `notion-query-data-sources` (rows mode) on Item text and Source. Update the existing row rather than duplicate.
- A row Radar creates always has: Item (one line, Kev's words), Category, Lane, Owner, Bill rate, Source, Status "Not started", Date Logged today. Next Action says the next physical step and who does it.
- Done rows older than 30 days are archived in the Friday review (set Status Done is enough; never delete).
- Never put a credential, a candidate's private detail or a bank figure in a row. Reference the email instead.

## Bill-rate yardstick

| Bill rate | Examples |
|---|---|
| Revenue | Candidate and client calls, Power Hours, client meetings, marketing, invoicing, offers and closes |
| Enabling | Training reps, lead lists, Crelate and CloudTalk setup, coaching with Cody |
| Admin | Bills, forms, scheduling, vendor replies, bookkeeping questions. Batched into one block a day. |
| Family | Ally, the kids, home, the Boise move, Eden Ranch and Excursions planning time |
| Formation | Scripture, journaling, C12, Main Street, rest |

## Reading the ledger without burning the Notion quota (11 October 2026)

On Kev's Notion plan the SQL query tool (`notion-query-data-sources` in sql mode) has a small shared workspace allowance; hourly sweeps used it up on 10 October. Saved views have no quota. So:

- **Read through the two saved views** with `mode: "view"`, paging with `next_cursor`: "Radar · Open for Kev" (`view://3f625d7d-12f4-8178-8f0a-000c76ff5fa3`, Status not Done and Owner Kev or Lane Batch) for the paper, the check-out and the hit list; "Radar · All open" (`view://3f625d7d-12f4-8192-a255-000ca93c1ae5`, Status not Done) for the sweep's search-before-create and the Friday review.
- **Read once per run.** Pull the view at the start of a sweep, keep it in memory, and match against it; never query per email.
- **Find one row** with `notion-search` scoped to the ledger, not SQL.
- **SQL only** for a one-off question no view answers, at most once per run, and never inside a loop.
