# Round Table Friday (scorecards)

Kev, 23 Oct 2026, asked for three things:
- weekly cards in each person's Round Table folder, measuring week-over-week trends and pointing to what to watch;
- a fresh Crelate pull at 9:55am PT so the Round Table runs on the latest numbers;
- the cards delivered to him as a PDF at the end of the day, with any PIP delivered too.

Round Table: https://claude.ai/artifact/DTXbu7B6F3B2s8NEnmYdCE. Each folder opens on "This week's card":
- clickable daily, weekly and core-value boxes;
- the recruiter's notes;
- Kev's coach section: coaching notes, needs, advice, his own score and a "Needs a PIP" box.

Everything Kev taps saves to `people/<slug>/cards/<Monday>`. Weeks are keyed by their Monday (Pacific). Saturday is the Sabbath: if it is Saturday, stop.

## 1. 9:55am PT Friday: the Crelate pull

1. `npm run recruiting-board -- --out projects/workforce/board/current.json` (read-only; prints counts only).
2. Write `board/current` on the Round Table with ArtifactData `set`, using `file_path` set to that file and pinned to the version you read. Every folder's card refreshes its Crelate strip and watch list from it.
3. `npm run scorecard-rows -- --week <this Monday> --out <scratch>/rows.json`, then push `rows.json` as one ArtifactData batch. If this week's rows already exist, read them first and pin `if_version`.
4. Commit `projects/workforce/board/current.json` with the message "Round Table: Friday 9:55 Crelate pull". Push to `claude/pensive-brown-18gll8`.
5. Post one line to Kev: the team's RPs against 375 (5 x 75), the biggest mover, and anyone already on a watch.

## 2. End of day Friday (5:07pm PT): cards to Kev as a PDF, with any PIP

1. Dump the Round Table with ArtifactData `list`, all into one `out_dir` (`<scratch>/rt-<Monday>`):
   - `people`;
   - `people/<slug>/cards` for every person;
   - `board`.
2. Run `npm run card-pdf -- --dump <that dir> --week <this Monday> --out deliverables/scorecards`. It prints anyone flagged for a PIP.
3. Deliver the PDF to Kev:
   - send the file with SendUserFile;
   - upload it to Google Drive in the Eden Daily folder as "Round Table <Monday>.pdf";
   - post the Drive link in the Command Center as a needsKev alert, `rt-pdf-<Monday>`, on Dean's desk.
   Kev saves it to iCloud himself.
4. **PIPs.** For each person flagged (Kev's box, or the card's "two weeks under 90%" watch line when Kev also ticked the box), start the `dean` agent. It drafts a performance improvement plan from:
   - the card;
   - Kev's "why";
   - last week's card;
   - the Crelate trend.

   The draft covers the standard, the gap, the 30-day targets, weekly check-ins, support offered, and what happens at day 30. Then start the `docket` agent to check the wording against Florida, Oregon and Idaho employment law, as written by the employee's state. Deliver the draft to Kev with the PDF, marked DRAFT. Never send it to the recruiter. A PIP is Kev's call and his conversation.
5. Put one post on Dean's feed in the Command Center: the cards delivered, with the PDF link.
6. Commit the PDF and any PIP draft under `deliverables/scorecards/`; they are work-only, with no health, family or age details. Push.

## Never

- Never edit a card Kev saved, except when he asks.
- Never show coaching notes, needs, advice or a PIP to anyone but Kev.
- Never put pay or commission on a card or in the PDF.
