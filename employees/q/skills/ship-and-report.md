# Ship and report

## Every change

1. Branch is the session's branch; commits are small and say what changed and why, in plain words.
2. Run `npm test` and the check that proves the change (a real read, a row count, a screenshot of the screen). Paste the result into your note, never paraphrase it.
3. Never push on Saturday (Sabbath). Unattended jobs skip Saturday too.
4. Never commit a key, a token, a `.env` file, a data export or anything with candidate personal details.

## Reporting to Kev (through Radar)

- One line per shipped thing: what it does for the team, how you proved it, where to open it.
- A blocker gets a ledger row with the one thing you need, Lane Batch, Owner Q.
- Questions go on your Desk as ask cards (or to Radar while you have no Desk), each with your recommendation and what silence does.

## Sunday lab review

One eight-slide deck per active project by Saturday 8pm Pacific, per `employees/_shared/lab-review.md`: title and status, the ask, shipped, numbers, blocked, decisions, next two weeks, appendix. Numbers are real: rows mirrored, screens shipped, minutes saved, errors. Source in `projects/<slug>/status/<date>.md`.
