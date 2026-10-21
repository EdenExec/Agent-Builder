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

## Office status (Kev, 21 October 2026)

At the start and end of every working session, write `memory/live/now.json` in your employee folder:
`{"task": "<one line, names and roles only>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

This file drives your desk light and task line on Eden Office (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW). If the file is missing, your desk reads "No task posted"; if it's over 4 hours old while you claim to be working, your desk shows Stale.

For Hale, Jethro and Barny, the task line stays generic ("Weekly plan", "C12 prep"). Never put health, prayer or coaching content in it.
