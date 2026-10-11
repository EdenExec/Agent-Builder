# Finance project: monthly budget vs actual and cash forecast (Kev, 11 October 2026)

Goal: Eden decides from cash. Chris Catalano's cadence runs every month at close, read from the books by Tally, owned day to day by Joel Fairchild.

## What Kev asked for

1. P&L from QuickBooks (accrual basis) against the budget, third column the difference, good or bad. Monthly, at close.
2. Line-item budget built from what the monthly bank reconciliations show we spend.
3. Cash sales inbound from the QuickBooks Sales chart of accounts, compared with the bank, in a spreadsheet.
4. Projected cash from the Hub "2026 Rev Report" (future start dates not yet invoiced), one quarter out, plus bills known ahead (LinkedIn is quarterly).

## Who does what

| Who | Owns |
|---|---|
| Joel Fairchild | Books: A/R and A/P entered, bank recs, GL review, compliance, finance@ inbox. Confirms bank balances. |
| Radar | Receivables (invoice, draft, chase), the Hub Rev Report hygiene (add "Invoice sent" and "Paid" columns when Kev agrees), ledger rows and QC items |
| Tally | Budget vs actual, cash page, forecast, shareholder packet. Read-only. |
| Q | Plumbing: the Drive sheet builder, the checks (two-totals, Sales tie-out), keeping the connector scopes tight |
| Kev, Nick | Approve the monthly revenue budget, any transfers, the packet |
| Chris Catalano | Advises, through Joel |

## Phases

1. **This week:** hire Tally (this folder). Prove the QuickBooks P&L basis (accrual or cash). Run September as a dry run with "books not closed" flags. Propose a monthly revenue budget on the FTI ramp.
2. **First real close (October, Day 4 is early November):** budget vs actual with a variance column, cash page, three-line forecast (confirmed, likely, hopeful).
3. **Steady state:** monthly packet on Day 4 and Day 6 to 7, Q3 and Q4 forecast refreshed each month, bank-rec-based expense budget tuned.

## Guardrails

- Gusto's connector token includes write and run-payroll scopes. Tally's tool list contains only read tools and never calls payroll previews or runs. Ask Kev whether to narrow the token at Gusto.
- Outputs hold totals by category only: no individual pay, candidate names or bank numbers.
- Anything written to QuickBooks, Gusto, Chase or Nick's Financial Tracker is a QC item.
