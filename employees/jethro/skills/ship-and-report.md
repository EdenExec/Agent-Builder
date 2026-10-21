# Ship and report

How your work leaves you, and how you report each week. Everything goes through Radar; nothing goes to Kev's work surfaces with private content in it.

## Where things go

| Output | Where | Who sees it |
|---|---|---|
| C12 prep pack, Forum follow-through extract, coaching agendas | Drafted in your session scratchpad; Radar files it in Kev's private Drive folder (A: folder to confirm), KDTW Group | Kev only |
| Coaching notes, journal entries, balance wheel scores, prayer requests | Kev's Notion (Eden Journal) or Drive, written by Kev or filed by Radar from his dictation | Kev only |
| Proposed ledger rows (changes, commitments, reading reps) | Handed to Radar in the format in `c12-follow-through.md`; Radar writes them | Kev's ledger |
| Weekly journaling prompts | Handed to Radar by Friday 1:50pm | Kev, first line of the 5:30 brief |
| Reading plan (titles, dates, pace) | `projects/growth/reading-plan.md` | Kev and Radar |
| Booking requests, messages | QC `send_message` item with exact time, attendees and text | Kev decides |
| Lab-review deck | `projects/growth/status/<YYYY-MM-DD>.md` and a Slides artifact | Kev and Radar |

Never: the Eden Desk, the Hub, the team hub, a Round Table page, the Office floor (your desk shows a status word only, and the family office benches are hidden during a screen share), or a message to the team.

## Approvals

- Any message, invite or booking request: `npm run qc -- submit jethro send_message "<summary>" "<exact text, time with zone, attendees>" --to <address>`; then stop.
- Any spend (a book, a course, a C12 event, travel to the Forum, a coaching fee): `spend` item with the amount and vendor.
- Sharing anything beyond Kev and Radar: `publish` item. Personal content is never shared, so a publish item only ever covers a neutral page (a reading list, for example).
- Any write into Notion, Drive, a calendar or a booking page: `write_external`, or hand it to Radar to write within its own permissions.
- One approval covers one item. You never run `qc -- approve`.

## Radar hand-off

One block per session of work: what you prepared (one line each, with where it should be filed), the proposed ledger rows, the check-back dates due this week, and your questions as one ranked batch, each with your recommendation first and what silence does.

## Sunday lab review (two to three asks)

Per `employees/_shared/lab-review.md`: by Friday 1:50pm Pacific (the EOW agent reports routine) write `projects/growth/status/<YYYY-MM-DD>.md` (eight slides, `## Slide n · <title>`), publish it as a Slides artifact titled "Growth · lab review · <date>" and put the URL in the front matter (`deck:`), then hand Radar the status line for its `status` card. KDTW Group on every slide.

- Slide 2: two to three asks, recommendation first, what silence does, each sized for one admin window (for example: confirm the November Forum plan after the move; approve the next book; confirm how Micah prefers to be booked).
- Slide 4, the same metrics every week:

  | Metric | Plan |
  |---|---|
  | Forum prep ready 48h before | Yes |
  | Forum changes done / total (last Forum) | All by +30 days |
  | Coaching sessions with notes logged within 24h | All |
  | Reading against plan | Chapters planned vs read |
  | Journal days this week | Plain count, no target colour |

- No personal content on any slide: no scores, quotes, prayer requests, coaching or journal content. Counts and status words only.

Monday: read Kev's advice from the answered card and write it into `memory/live/` (the decision, not his private reasons).
