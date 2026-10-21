# Habits and tracking (the daily scorecard and the weekly review)

Small, daily, kind. Five boxes Kev can fill in under a minute, a weekly look that asks one question, and no guilt. It lives only in the private store Kev chooses (`memory/live/README.md`); until he chooses, Hale offers the scorecard in the conversation and saves nothing.

## The daily scorecard (five boxes)

| Box | What counts | Default target (A) | Grade behind it |
|---|---|---|---|
| Sleep | Hours, or lights-out time | 7 hours or more | SETTLED (AASM) |
| Move | A planned session done, or steps | Session done, or 8,000 steps | SETTLED / LIKELY |
| Protein | Hit the day's target, roughly | Yes or no | LIKELY |
| Water | A steady day of water | Yes or no | SETTLED (AI) |
| Screen-off | Screens off at the wind-down time | Yes or no | LIKELY |

Kev may swap a box (for example "drinks: 0 to 1") but never past five. Targets carry "(A)" until he sets his own. He fills it in where he already is: the private store page on his phone at the 5:30pm check-out moment, or by telling Hale in conversation.

## Rules against guilt

- Count the wins: "4 of 5 today", "Move on 4 of 6 days". No streak counters that reset to zero, no red marks, no "missed" banners, no push nudges.
- Saturday is the Sabbath: the column reads "Sabbath" and is not counted in or out of anything.
- A blank is a blank: Hale never fills one in or guesses one.
- One bad week changes nothing; the four-week view is what matters.
- Children never get a scorecard about food, body or weight. Habits for children (bedtime routine, outdoor time, practice) are Kev's call and are framed as family habits, not tracked numbers about a child.

## The weekly review (Sunday afternoon or Monday morning, five minutes)

1. **The week in one table:** each box, days done of six (Sabbath excluded), against the four-week average.
2. **One win,** named with the evidence.
3. **One question:** "What one change makes next week easier?" Kev answers; Hale turns it into one adjustment (a time, a meal, a slot), never three.
4. **Plan check:** sessions done against the training plan; deload or move weeks marked.
5. **Doctor flags:** anything in the week that belongs on a clinician question list goes there, not into a coaching note.

The review is written into the private store. Radar's hand-off gets one line with no health content: "Hale: weekly review ready in your private store."

## The C12 tie-in (optional, Kev's own)

Before a C12 Forum (third Tuesday), Hale can lay out the four weeks under Fitness & Nutrition and Rest & Retreat so Kev can score his own spokes. The scores are his, recorded only in the private store; Hale does not grade him.

## The Eden Daily habit tracker

Radar's paper already carries Workout, Drinks and Weight among Kev's habits (his standing rule). Hale does not feed numbers to the paper, read from the paper for its logs, or duplicate those rows. Whether those rows move into this private scorecard is Kev's decision (open question in `memory/live/README.md`); until then both run as they are.

## Private store layout (when Kev has chosen)

| Collection or section | One entry per | Fields |
|---|---|---|
| `scorecard` | Day | date, sleep_hours, move, protein, water, screen_off, note |
| `reviews` | Week | week_of, table, win, change |
| `plans` | Plan | kind (training, meals, sleep), version, link, start |
| `questions` | Appointment | date, clinician type, questions, answers after |
| `calendar` | Dated item | date, person (first name), item (visit type only) |

No identifiers in any field. If Kev's store is a private artifact database, write with ArtifactData as Kev, to that artifact only.

## Checks

- Five boxes or fewer, targets graded, "(A)" until set by Kev.
- No guilt mechanics, no Sabbath scoring, no child food or body tracking.
- Nothing written outside the private store; Radar's line carries no health content.
