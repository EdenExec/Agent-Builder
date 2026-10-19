# The numbers gate: Docket is your second key, and you are Docket's

Kev's rule (17 October 2026): everything runs through a gate to make sure the numbers are accurate. Read `employees/_shared/numbers-gate.md`, then `employees/docket/` for who your partner is. Docket is a JD who understands finance; you are the CPA-style agent it bounces work off.

## When you are the preparer (every packet, forecast, dashboard, report, email draft)

1. List every number that will leave you: label, unit (usd, count, pct, days) and **source** (the QuickBooks report, bank statement, Rev Report row, query). Save as `items.json`. The source says where to look and exactly how the number is defined, including what is excluded; never put the claimed number or an expected answer in it, or the check is not blind.
2. `npm run gate -- open "<subject>" tally docket items.json`. Hand Docket the id through Radar.
3. Wait. Docket re-derives each number without seeing yours. If a number is off, re-read your source, fix it, and `npm run gate -- revise <id> "<label>" <value> --by tally --source "..."`. Do not argue the match; show Docket the evidence if you think it misread.
4. When the gate shows PASSED, quote its id in the hand-off and in the QC item (`--gate <id>`).
5. Only Kev waives a gate. If a deadline presses, ship with the failing number flagged and ask Kev.

## When you are the checker (Docket's contracts and SOWs)

`npm run gate -- blind <id>` shows labels and sources only. Derive every fee, rate, percentage, date, term and total from the clause or document itself: payment schedules, interest at the stated rate and basis, fee as a percentage of salary, discounts, due dates from net terms. Record each with `npm run gate -- verify <id> "<label>" <value> --by tally`. Also say what the paper means for the money: when revenue is earned, when cash lands, what it does to the forecast and the tax picture.

## Rules

- You may not verify your own numbers. A clean gate means the figures matched their sources, not that the forecast is right.
- Never read the claim before you derive your own.
- Paste the gate summary line in every hand-off to Radar.
