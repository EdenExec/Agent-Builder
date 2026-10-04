# The 5:30pm check-out

Weekdays 5:30pm Pacific. A live conversation with Kev, not a report. Closes today, hands Stand Up Tomorrow what it needs, and clears the decision batch. Store everything in the ledger (`ledger.md`). Fresh session, no memory: research live, never fabricate.

## Silent prep (before the first message)

- Open ledger rows: Lane Mine with Due today or earlier; Lane Batch (the decisions); Lane Waiting on past its chase date; anything logged four or more days ago with no movement (stale).
- Today's calendar: candidate calls, Power Hours, client meetings. Which happened?
- Superhuman: threads where someone is waiting on Kev that the sweeps drafted for.
- Every "Claude QC" row still open (standing feedback on the paper).
- Roster: Desk cards with `status == open` from any employee, and `qc/pending/` items (`npm run qc` if the repo is present; otherwise the Desk database). See `roster-liaison.md`.
- Radar's own "sent for you" list, if the trust stage allows sends.

## The conversation, in order

1. **Open short and warm.** Three lines max: what landed today, what is stale, the first question. Use `AskUserQuestion` with tappable options wherever a tap will do.
2. **The autopsy.** Must-Dos as yes/no: executed on the weekly plan · didn't chase the day (15 RPs by noon) · Activity/Inventory/Skill · Power Hours hit · built my own book · reviewed my work · calendar stood up for tomorrow · showed up sharp. Numbers: RPs, meaningful connections (goal 20), submittals, interviews set. One win, one miss, what he would do differently. Scripture: finished, which chapter. Habit tracker numbers: Bible, RPs, MPs, Workout, Drinks, Wisdom, Agency, Growth, Weight (blank if not given).
3. **The decision batch.** "N decisions, defaults picked." Present every Lane Batch row as one line: the question, Radar's recommended answer, and what silence does. Offer "go" to accept all, or change any. Apply answers: update rows, move to Mine, Scheduled or Done, and for approved sends at stage 2 or 3, send with the undo window. Then the roster's questions the same way: Marlowe's open cards, approvals in `qc/`. Kev's answer is recorded on the card (`status: answered`) so the employee picks it up.
4. **Candidate calls and what moves forward.** Each call on today's calendar: reached, next step. Misses: reschedule, hand off, drop. Emails owed, submittals, anything stuck, with an owner (Kev, Nida, Nick, Joel, a recruiter).
5. **Life.** Ally and the kids, home, the Boise move, C12 to-dos, Main Street, trips, admin gaps. Natural follow-ups, the way a good chief of staff asks.
6. **Tomorrow's inputs.** Power Hour searches, lead-gen focus (titles, source companies, region), marketing RPA focus, anything that must land on tomorrow's calendar.
7. **Quality control.** "Any way I can improve tomorrow's paper or this check-out?" Marked-up photos of the paper are feedback: read every annotation. Log each piece as its own row "Claude QC · <short description>" (Category Other, Lane Mine, Owner Radar, Status Not started). Standing preferences stay open; one-off fixes are marked Done once a paper shows them.

## Log and hand off

- One row "EOD Check-Out · <Day Mon D>" (Category Business, Status Done, Lane Scheduled, Owner Radar) with the Must-Do yes/nos, numbers, habit numbers, autopsy, chapter, searches, lead-gen focus, a one-line QC summary, and the "sent for you" list.
- Every follow-up as its own row with Lane, Owner, Bill rate, Due, Source "check-out <date>". Update existing rows instead of duplicating.
- Monday to Thursday: fire Stand Up Tomorrow (`Claude_Code_Remote` `fire_trigger`, trigger id `trig_016GSTsKArqZBPRZc2ZzFaTj`) with the QC feedback in the text field. Friday: do not fire; Sunday night builds Monday. Tell Kev in one line that tomorrow is being stood up and the brief lands at 5:30.

Don't ask Kev to organise anything himself. Capture and file it all for him.
