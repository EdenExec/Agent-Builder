# Cash picture and one-quarter forecast

## Cash in the bank (actual)

- Cash sales inbound come from QuickBooks: income on the **Sales and Services chart of accounts** by month, from `cash_flow_quickbooks_account_text`, the balance sheet and Sales by Customer. Put cash received next to the bank balances so the sheet shows the difference between what was billed and what landed. Joel confirms the bank balances; QuickBooks alone cannot prove them.
- Spend: from the reconciled bank statements as Joel closes them (see `budget-vs-actual.md` for how that becomes the line-item budget).

## Projected cash (forecast, one quarter out, rebuilt each month)

1. **Expected income, two sources.** Radar owns invoicing; Tally only reads.
   - **Invoices sent, not yet paid.** The Hub's "Date: $ In" column is empty on every 2026 row, so until Kev adds "Invoice sent" and "Paid" columns to the Rev Report, open receivables come from Radar's ledger: rows in Lane "Waiting on" whose Owner is the client's AP contact, with Due = the terms date. Amount = the invoice's Total Amount Due. Past-due rows go in the confirmed line with the days late shown.
   - **Not yet invoiced.** The Hub sheet "2026 - EPG Dashboard (Hub)", tab "2026 Rev Report" (`1J1RSMPF5B5tFooRN_PEJdAzK6y74lXBqgxIxq6byP24`): placements with a future Start Date. Read the 2027 Hub too (`1L8GNBklncJqi6scmlBMR3RybT5Ltt73I9s8qg3lAFcY`, same columns) for placements starting in 2027. Cash expected = Fee, less any retainer already billed (a "Retainer Fee" line, never a discount), less Discount; never "Eden Gross", which is Eden's share after the partner split and belongs on the outflow side. It lands at Start Date plus Net Terms (blank means Net 30 from the start date).
   - **Retainers** are not placements: each is invoiced on the 1st of the month with the terms the sheet names ("Net 15", "due by the 5th"; PB South's are due by the 15th), so each month's retainers land on those dates, not at a start date.
   - Read the columns the way `employees/radar/skills/invoicing.md` does, and treat a mismatch between the Rev Report and an invoice as a question for Radar, not a correction. Names appear on that sheet; the forecast shows client, role and amount, never candidate names or salaries. PB South must pay Eden Partner Group, not EES; a PB South payment that lands in the wrong account is flagged, not counted as received.
2. **Probability.** Mark each row Started, Offer accepted, Offer out. Show three cash lines (confirmed, likely, hopeful) instead of one blended number. A guess is labelled as a guess.
3. **Known outflows.** Payroll (pay schedules and the last payroll totals from Gusto, totals only), partner wires (Chase, on the 6th and 20th, 15th and 30th: use the partner-split total), the 25th Washington excise tax, quarterly payroll taxes and the quarterly tax distribution, loan payments, and every recurring vendor bill. Quarterly vendors (LinkedIn is one) go on the month they bill, not spread evenly. Find them in `qbo_sales_get_recurring_invoices` where relevant and the past three months of vendor activity.
4. **Roll forward** month by month for three months: opening cash, in, out, closing cash, months of runway at that month's burn, and the Profit First transfers on the 10th and 25th.

## Rules

- Do not forecast from months that are not closed; show the actuals gap in red and say so.
- Show the date of the last Hub update on the sheet ("Rev Report as of <date>").
- Every forecast row names its source. No source, no row.
- The forecast is a draft for Kev. It moves nothing.
