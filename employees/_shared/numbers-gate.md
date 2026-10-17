# The numbers gate (Kev, 17 October 2026)

"Everything is run through a gate to ensure numbers are accurate." Finance and legal work in pairs: Tally (CPA-style finance agent) and Docket (JD-style contracts and risk agent). Each is the other's second key.

## The rule

A number leaves the building only after a different employee has re-derived it from the source and got the same answer. "Leaves the building" means: to Kev as a finished packet, to Joel, Chris, Nick, a client, a contractor, a lender or a lawyer; into a dashboard, a PDF, an email draft or a contract.

## How it works

1. **Open.** The preparer lists every number in the deliverable with its label, unit (usd, count, pct, days) and **source** (the file, query, report line or clause). `npm run gate -- open "<subject>" <preparer> <checker> items.json`.
2. **Blind check.** The checker runs `npm run gate -- blind <id>`, sees labels and sources only, and derives each number itself. It also looks for wrong basis, wrong entity, wrong period, double counting and a number that ties but should not exist.
3. **Verify.** `npm run gate -- verify <id> "<label>" <value> --by <checker>`. Tolerance: dollars within $1, counts and days exact, percentages within 0.1 point. A mismatch fails the gate.
4. **Fix.** The preparer runs `revise` on the failed number (with its source), and the checker re-derives it from scratch. A gate passes only when every item matches.
5. **Ship.** QC sends and publishes for Tally and Docket require `--gate <id>` for a cleared gate (`numbers_gate: required` in agent.yaml; `workshop/office/qc.ts` enforces it). The gate id is written into the QC item.
6. **Waive.** Only Kev waives a gate, with a reason (`npm run gate -- waive`). An employee never does. If a deadline presses, ship with the failing number marked and ask Kev.

## Which pair does what

| Deliverable | Preparer | Checker |
|---|---|---|
| Monthly packet, budget vs actual, cash forecast, dashboard, report for Chris | Tally | Docket |
| Fee formulas, payment schedules, interest, commission tables, dates in a contract or SOW | Docket | Tally |
| Anything where both touch the same figure (a lease's first-year cost in the forecast) | the author | the other |

## What the gate does not do

It proves numbers match their sources. It does not prove the forecast is right, the contract is wise or the source is correct. The checkers keep thinking.
