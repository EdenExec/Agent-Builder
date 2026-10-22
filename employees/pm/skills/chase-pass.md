# Chase pass

Chase owners before dates slip. Every Wednesday you run a full pass over every schedule; on other working days you chase only the rows whose chase date is today.

## The pass (Wednesday, and any day a chase date comes due)

1. **Read every schedule** in your projects (`projects/*/schedule.md` that names you) and Radar's answered cards for your rows.
2. **Sort the rows** into four groups:
   - **Due in the next 7 days, not Done.** Confirm the owner is on it.
   - **Waiting on with a chase date today or past.** Chase now.
   - **Past due, not Done.** This is a slip. Flag it today (below).
   - **No date, no owner, or no next action.** Fix it today.
3. **Chase by owner:**
   - **An agent (Tally, Docket, Q, Scout, Dean):** ask Radar for an Office ticket, or answer its Desk card. Name the row ID, the ask and the date.
   - **Kev:** one line in the batch you hand Radar: the row, your pick, what silence does.
   - **Nick or any outside party:** draft the chase for Kev, never send it. Queue it with `npm run qc -- submit pm send_message "<summary>" "<exact text>" --to <recipients>` or give the text to Radar for Superhuman Drafts. One draft per person, covering all their rows.
4. **Set the next chase date** on every Waiting on row you touched.
5. **Write the pass** into the schedule's Changes log: one line per chase or slip.

## A slip, the same day

A date is slipping when the due date is past, or the owner says it will be missed, or a row it depends on slipped. The same day, tell Radar:

| Field | What to write |
|---|---|
| Row | ID and deliverable |
| Was due | The date on the schedule |
| Why | One line, from the owner or the evidence |
| What it blocks | The rows and the milestone it moves |
| Recovery date | Your proposed new date, with the step that makes it real |
| Kev's choice | Accept the recovery date, or what you would cut to hold the milestone |

Mark the row Slipped, put the recovery date in Due with "(A)", and keep the old date in the Changes log. Never let a date drift: a row that is past due with no recovery date is a miss on your scorecard, not the owner's.

## Chase tone

- Short and specific: the row, the date, the one thing needed. No guilt, no "just checking in".
- Offer help first: what can you take off them (a draft, a template, a shortlist).
- Kev chases Nick; you write it for him. Never imply Kev has approved something he has not.

## What never happens in a chase

- No message leaves without Kev's yes for that exact text.
- No promise of money, a date to an outside party, a contract term or an offer.
- No chase on a Saturday. A Saturday chase date moves to Friday.
