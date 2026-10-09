# Plan an event (the WIDGET sequence as a procedure)

Use this for any event idea, from a brain dump to a one-line ask. Output: one plan under two printed pages, rendered with `npm run doc`, plus the supporting files in `events/<slug>/` (see `skills/host-desk.md`). Read the seed memory first (`memory/seed/eden-events.md`, `venues-and-vendors.md`) and any live memory.

## Intake (two minutes, no questions to Kev yet)

1. Write the idea in Kev's words, verbatim, at the top of `events/<slug>/brief.md`.
2. Name the goal in one sentence with a number ("fill 6 of 18 seats") and the client or audience.
3. List every fact you were given and every assumption you are making. Assumptions get "(A)".

## The sequence

| Step | Genius | Do this | Produces |
|---|---|---|---|
| 1 | Wonder | Ask the three questions: who do we want in the room, what does the client need by when, what makes someone cross the county on a weeknight. Answer each from the brief or mark it a question. | Three questions, answered or open |
| 2 | Invention | Capture every idea Kev gave, in his order, then add at most three of your own. No judging yet. | The ideas list |
| 3 | Discernment | For each judgment call (headcount, date window, venue type, budget, who pays, incentive structure and its risks) write your recommendation first, then the rule it comes from, then the alternative. | The calls table |
| 4 | Galvanizing | Who announces, the invitation, the referral mechanic, the email and social pushes, the dates of each. All sends are drafts for QC. | The rally |
| 5 | Enablement | A role for every named person, the checklist, the RSVP and check-in flow, the mechanics of any raffle (`skills/budget-and-raffle.md`). | The help |
| 6 | Tenacity | Run-of-show (`skills/run-of-show.md`), follow-up within 48 hours, offers within a week, the scorecard (`skills/follow-up-and-scorecard.md`). | The finish |

## Rules for the calls

- **Headcount.** Start from the seats or the outcome. Hires wanted = open seats not already covered by an offer, divided by three (a third come from the event; replace with Eden's own history when it exists). Offers needed = hires divided by the acceptance rate (start at 50%). Guests needed = offers divided by the offer-ready share (start at one in five). RSVPs needed = guests divided by the show rate (start at 50%). All four ratios are assumptions until Crelate history replaces them.
- **Date.** Pick a placeholder "D" and work back: public events need six weeks (D-6 weeks decisions, D-5 venue and budget, D-4 invitation live, D-3 to D-2 pushes and calls, D-1 week logistics, D+2 days follow-up, D+7 days offers and scorecard). Midweek evening, clear of holidays and the client's peak weeks. Give a window of three dates, not a single date, until Kev picks.
- **Venue.** Neutral and easy to reach beats a jobsite or an office (insurance, safety, atmosphere). Capacity is the headcount target plus a third. Any venue quote goes to QC.
- **Money.** See `skills/budget-and-raffle.md`. The total is Kev's decision; say so on the page.
- **Who pays.** Default recommendation: the party that gets the hire pays for the hire (venue, food, the bonus); Eden pays for the pull (prizes, promotion, its team's time). Say Kev may flip it, and that the client must agree before anything is announced.
- **Incentives that touch pay** (signing bonuses, referral bonuses): recommend installments, name the risks (pay-and-leave, resentment among current staff, clawback wording, bonus-only attendees), and send the wording to the client's HR or counsel. You never set the amount yourself.

## The page

Front matter: `title`, `author: Host` (or Radar when it goes out under Radar), `date`, `cover: false`, `toc: false`, `compact: true`. Sections in this order: Result at a glance; Decisions for Kev (exactly three, each with your pick); Wonder; Invention; Discernment (table); Galvanizing; Enablement; Tenacity; Timeline and budget (the weeks table from D, then a one-line budget table with the total marked "Kev's decision"). Three bullets or fewer per section.

## Before you present it

Run `npm run doc -- <plan.md> --out <dir> --pdf`, fix every warning or say why one is justified, confirm the PDF is two pages or fewer, and score the plan against `rubrics/event-plan.md`. Show Radar the score.
