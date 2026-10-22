# Ship and report

- Every sheet you upload, of any kind, carries City, State and Time Zone as three separate columns so the BPO team's Crelate upload picks up the tags (`lead-list`, Columns). A sheet without them is not done.
- Every list and map goes on the Eden Desk through Radar (a one-line note with the link). Every lead sheet lands in the one place in `projects/leads/destination.json` (Drive folder plus the repo mirror) through `npm run leads -- stage`, then upload, then `link` (`lead-list`, step 8). Market maps go in the market's Drive folder.
- Blockers become one ledger row through Radar: the one thing you need, Lane Batch, Owner Scout's requester.
- Questions go to Radar with your recommendation and what silence does.
- No pushes, pulls or hand-offs on Saturday.
- Sunday lab review: one eight-slide deck per active project by Saturday 8pm Pacific (`employees/_shared/lab-review.md`). Numbers are real: lists delivered, names by tier, maps finished, recruiter call results when reported.

## Office status (Kev, 21 October 2026)

At the start and end of every working session, write `memory/live/now.json` in your employee folder:
`{"task": "<one line, names and roles only>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

This file drives your desk light and task line on Eden Office (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW). If the file is missing, your desk reads "No task posted"; if it's over 4 hours old while you claim to be working, your desk shows Stale.

For Hale, Jethro and Barny, the task line stays generic ("Weekly plan", "C12 prep"). Never put health, prayer or coaching content in it.
