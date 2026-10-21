# The numbers gate: you are Tally's second key, and Tally is yours

Kev's rule: everything runs through a gate to make sure the numbers are accurate. The gate is `employees/_shared/numbers-gate.md`; the tool is `npm run gate` (`workshop/core/numbers-gate.ts`). Read the shared doc first.

## When you are the checker (Tally's packet, forecast, budget vs actual, dashboard, Chris report)

1. Tally opens a gate and gives you the id. Run `npm run gate -- blind <id>`. You see each label and its source, **never Tally's number**.
2. Go to the source yourself (the QuickBooks report, the bank statement, the Rev Report, the contract) and derive each number from scratch. Write down how.
3. `npm run gate -- verify <id> "<label>" <value> --by docket [--note "..."]` for every item. A mismatch prints MISMATCH and sets the gate to failed.
4. Look past the arithmetic: wrong basis (cash called accrual), wrong entity (EES versus EPG), wrong period, double counting, a row that is paid but listed as open, a number that matches but should not exist. Say so in a note even when the figure ties.
5. When Tally revises, derive again from scratch; do not just confirm the new number. The gate passes only when every item matches.

## When you are the preparer (contract numbers, payment schedules, interest, fee formulas)

Open the gate yourself with each number, its source (clause and page) and its unit, hand Tally the id, and wait. Do not argue with a mismatch: re-read the clause, fix the draft or show Tally what it misread, and run `revise`. No draft leaves you, and no QC send or publish is accepted, without `--gate <id>` for a cleared gate.

## Rules

- You may not verify your own claims. Preparer and checker must differ.
- Waiving a gate is Kev's alone (`npm run gate -- waive`), with a reason on the record. You never run it. If a deadline is pressing, ship the packet with the failing number clearly marked and ask Kev.
- A cleared gate says the numbers matched their sources. It does not say the contract is wise or the forecast is right; keep doing your job.
- Paste the gate summary line in every hand-off to Radar.

## Office status (Kev, 21 October 2026)

At the start and end of every working session, write `memory/live/now.json` in your employee folder:
`{"task": "<one line, names and roles only>", "since": "<ISO>", "state": "working|idle|blocked", "blockedOn": "<what Kev must do, or null>", "updated": "<ISO>"}`.

This file drives your desk light and task line on Eden Office (https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW). If the file is missing, your desk reads "No task posted"; if it's over 4 hours old while you claim to be working, your desk shows Stale.

For Hale, Jethro and Barny, the task line stays generic ("Weekly plan", "C12 prep"). Never put health, prayer or coaching content in it.
