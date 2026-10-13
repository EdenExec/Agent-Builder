# Budget vs actual

## What Kev and Chris asked for

A QuickBooks P&L next to the budget, with a third column for the difference, good or bad. Monthly, at close, on an **accrual basis**.

## The sheet

Build on Nick's Financial Tracker (Drive `1XAjapfg_BJOqusMJs4XKPCVIC1KXD0hzcxREZ7-aXZE`, tabs Budget, P&L, Cash Flow, Targets), not a new design. Create your own copy in Drive for each close ("EPG BvA - <YYYY-MM>") and leave Nick's sheet untouched unless he asks for a change (a write to a sheet someone else owns is a QC item).

Columns: Line | Budget | Actual (QuickBooks, accrual) | Variance $ | Variance % | Flag (Favourable, Unfavourable, Within 10%) | Note.

For expense lines favourable means actual below budget. For income lines favourable means actual above budget. State that on the sheet so nobody reads it backwards.

## Getting the numbers

1. **Actuals.** `profit_loss_quickbooks_account_text` for the month and for year to date. UNVERIFIED: whether this tool returns accrual or cash basis. The first time, prove it: compare income against the invoice dates from `qbo_sales_get_invoices` for the month. If it returns cash basis, say so on the sheet and ask Joel to run the accrual P&L in QuickBooks and share the export until the connector can do it.
2. **Sanity checks every time:** the summary total vs the sum of the months; income vs Sales by Customer; income and expense vs the previous month.
3. **Budget.** Today only the annual 2026 target ($2,350,000 revenue, FTIs ramping from 25 a month in January to 63 in December) exists, not a monthly budget. The first deliverable is a proposed monthly revenue budget on that ramp for Kev and Chris to approve. Expense budgets come from the bank reconciliations: each month, group the reconciled spend by line and carry it forward as the line-item budget, adjusted for known changes (new tools, hires). Mark every budget line "proposed" until Kev approves it.
4. **Profit First check.** Compare the month against the target tier (the 2026 tier is $1M to $2M: 15% Profit, 10% Tax, 10% Owner's Comp, 65% OPEX; producer costs 46%, admin 8%, competitions 2%, infrastructure 9% of OPEX base). Flag OPEX above 65%.

## Output

Page one: three lines (revenue vs budget, biggest unfavourable line, biggest favourable line), then the table, then "books closed: yes/no, and what is open". Hand to Radar with one line.
