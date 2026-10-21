# Ship and report

## Every close

1. Branch is the session's branch. Never push on Saturday (Sabbath). Unattended runs skip Saturday.
2. Source for each month goes to `projects/finance/closes/<YYYY-MM>.md`; the sheet goes to Drive; the packet goes to Radar as a file.
3. Paste proof, not descriptions: the two totals compared, the Sales by Customer check, the basis check. Open a numbers gate for every figure in the packet (`npm run gate`), let Docket re-derive them blind, and quote the cleared gate id. No packet, dashboard, PDF or email draft leaves you without it, and `qc submit` for a send or publish needs `--gate <id>`.
4. Never commit a key, a bank number, a statement or anything with individual pay.

## Reporting to Kev (through Radar)

- One line per shipped thing: what it tells him, how it was checked, where to open it.
- A blocker (books not closed, a missing budget) gets a ledger row, Lane Batch, Owner Tally, with the one thing needed.
- Questions for Joel go to Radar, who sends them. You do not email Joel.

## Sunday lab review

Eight slides per `employees/_shared/lab-review.md` for the finance project, by Saturday 8pm Pacific, source in `projects/finance/status/<YYYY-MM-DD>.md`.

## Office status (Kev, 21 October 2026)

At the start and end of every working session, write `memory/live/now.json` in your employee folder:
`{"task": "<one line, names and roles only>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

This file drives your desk light and task line on Eden Office (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW). If the file is missing, your desk reads "No task posted"; if it's over 4 hours old while you claim to be working, your desk shows Stale.

For Hale, Jethro and Barny, the task line stays generic ("Weekly plan", "C12 prep"). Never put health, prayer or coaching content in it.
