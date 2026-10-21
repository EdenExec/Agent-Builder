# The 5:30pm check-out

Weekdays 5:30pm Pacific. A live conversation with Kev, not a report. Closes today, hands Stand Up Tomorrow what it needs, and clears the decision batch. Store everything in the ledger (`ledger.md`). Fresh session, no memory: research live, never fabricate.

## Silent prep (before the first message)

- Open ledger rows: Lane Mine with Due today or earlier; Lane Batch (the decisions); Lane Waiting on past its chase date; anything logged four or more days ago with no movement (stale).
- Today's calendar: candidate calls, Power Hours, client meetings. Which happened?
- Superhuman: threads where someone is waiting on Kev that the sweeps drafted for.
- Every "Claude QC" row still open (standing feedback on the paper).
- Roster: Desk cards with `status == open` from any employee, and `qc/pending/` items (`npm run qc` if the repo is present; otherwise the Desk database). See `roster-liaison.md`.
- Radar's own "sent for you" list, if the trust stage allows sends.
- Eden Office tickets (Kev, 21 Oct 2026): any ticket still `open`, or `picked` for more than 2 hours with no result, means a sweep missed it. Work it now per the Office steps in `inbox-sweep.md` before the conversation starts, and name it in the open if it is still running.
- Lead sheets (Kev, 21 Oct 2026): run `npm run leads -- verify` and flag any Scout sheet in `employees/scout/sheets` it lists as NOT LANDED, and any Lead Log row dated In Crelate but not Moved.

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
- Fire only after Kev's last words of the night. If he says he is going to bed, or sends notes after the check-out, those notes go in the fire text verbatim with their time so the first build already carries them.
- Monday to Thursday: fire Stand Up Tomorrow (`Claude_Code_Remote` `fire_trigger`, trigger id `trig_016GSTsKArqZBPRZc2ZzFaTj`) with the QC feedback in the text field. Friday: do not fire; Sunday night builds Monday. Tell Kev in one line that tomorrow is being stood up and the brief lands at 5:30.

## Friday

Since 13 October 2026 the week review runs as its own routine at 3:50pm Friday (`trig_01C69u4TUwZweJPjPjwoz9Yr`), after the EOW agent reports at 1:50pm (`trig_019qLwVnxBotcrE3J9gZh4YE`). Both are emailed to Kev and written into the hit-list doc. At Friday's check-out, walk the "Friday check-out add-on" items (Drop?, the trust-ramp question) and the "Lab review asks" by voice. If neither routine left a note that day, run `week-review.md` in the same conversation, as before.

Don't ask Kev to organise anything himself. Capture and file it all for him.

## The hit list (11 October 2026)

Before the check-out ends, follow `hit-list.md`: act on the Answers, rebuild the doc for the evening (Home list first after 5:30), and note in the check-out how many items Kev cleared by voice today.
