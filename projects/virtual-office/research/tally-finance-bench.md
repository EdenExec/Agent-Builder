# Finance bench and Vancouver revenue tracker: spec (Tally, 21 Oct 2026)

**Result:** the Finance bench is buildable from five sources. Two are proven live today (Gusto, the Hub sheet design). QuickBooks was **not** reachable this session (sign-in expired), so every QuickBooks source below is "specified, not yet proven". The revenue tracker cannot attribute revenue to a recruiter yet: the Rev Report has no recruiter column. Kev's one answer unlocks it (section 2).

All figures in this spec are structure only. Any example is labelled EXAMPLE. Nothing here has passed the numbers gate, so nothing here is a real figure. Each real number on the live bench carries entity (EES or EPG), source, as-of date and gate id.

## 1. Finance bench, top down

**Headline strip (6 numbers, one entity toggle EES / EPG, never summed together):**

| # | Number | Definition | Basis |
|---|---|---|---|
| 1 | Cash on hand | Sum of bank balances Joel confirmed, as of the last reconciled date | Cash |
| 2 | Net cash flow, month to date | Cash in minus cash out since the 1st | Cash |
| 3 | Open invoices | Total unpaid, with the overdue part beside it | Accrual |
| 4 | Net margin, month to date | Net income divided by income, "books not closed" until Day 3 | Accrual |
| 5 | Month vs budget | Net income actual minus budget, flagged favourable/unfavourable and over/under the 10% line | Accrual |
| 6 | Runway | Cash on hand divided by average monthly outflow, three closed months | Cash |

Cash and accrual sit in separate tiles and are never mixed in one column.

**Sections, in order down the bench:**

| Section | Source | Refresh | Click goes to |
|---|---|---|---|
| Active balances (bank, credit card, loans) | QuickBooks balance sheet text report; Joel confirms bank figures | Daily 6am; "unconfirmed" until Joel marks the reconciliation | QuickBooks balance sheet |
| Open invoices and AR aging | QuickBooks AR aging summary (accrual only) and `get_invoices`; Radar's ledger "Waiting on" rows for chase status | Daily | Invoice in QuickBooks; Hub Rev Report row for the placement |
| Payables (AP aging) | QuickBooks AP aging summary | Daily | QuickBooks bills |
| Upcoming bills | QuickBooks recurring templates plus three months of vendor activity; quarterly vendors on the month they bill; the 25th excise tax; Q3 941 due 31 Oct | Weekly, rebuilt at close | QuickBooks vendor |
| Monthly P&L vs budget | QuickBooks P&L (accrual), budget column, difference column with plain flag | Month to date daily; final at Day 4 | QuickBooks P&L |
| Cash flow statement | QuickBooks cash flow report (cash) | Daily MTD; final Day 5 | QuickBooks cash flow |
| Forecast, one quarter out | Hub 2026 Rev Report (future starts, not yet invoiced) plus known outflows; three lines: confirmed, likely, hopeful | Monthly at Day 4; refreshed when the Rev Report changes | Hub Rev Report |
| Payroll (Gusto), totals only | Gusto pay schedules and payroll totals (gross, taxes, net as company totals) | Per payroll run | Gusto |
| Notes from Joel and Chris | A Drive folder of short dated notes, or an Office note field Joel and Chris write (decision for Kev) | On write | The note |

Each tile and row shows "Source, as of date, gate id". Month not closed means a grey "books not closed" label on every figure. September is the standing example.

**Screen-share switch:** hides the whole Finance bench, Gusto, the ticker and notes. Payroll shows company totals only on any screen. No employee pay, no contractor pay beyond the partner-split total, no bank account numbers, no candidate names, no salary.

## 2. Vancouver revenue tracker (Evan, Noah, Max, Andrew)

**What counts as their revenue (proposed definition, Kev to confirm):**
- **Placement fees:** Rev Report "Fee" for each placement, recognised at start date, less Discount and any retainer already billed. Gross to Eden shown separately, never as their revenue.
- **Retainers:** counted in the month invoiced, shown as a separate line.
- **Contractor spread:** bill rate minus pay rate on contract placements. The Rev Report is built for permanent placements, so contractor spread needs a source we have not found. Ask Kev where it lives (QuickBooks, Crelate or Joel's sheet).
- **Collected vs billed:** shown side by side, since the Rev Report's paid-date column is empty today.

**Where it lives today:**
- Hub sheet "2026 - EPG Dashboard (Hub)", tab "2026 Rev Report": Candidate, Start Date, Net Terms, Client, Role, Fee, Discount, Eden Gross, Notes. **No recruiter column.**
- QuickBooks Sales by Customer: by client, not by recruiter. QuickBooks Sales by Product/Service: only if recruiter-specific income items exist (unconfirmed).
- Crelate: assumed to record the owning recruiter per placement. I have not read it and treat it as unverified.

**What I need from Kev:**
1. Where a placement is credited to a recruiter. The best answer is a "Recruiter" column on the Rev Report, which makes it a one-source read. Otherwise Crelate placement owner, matched to Rev Report rows by client and role.
2. Split rule for shared deals (who gets credit when two recruiters touch one).
3. Whether the tracker shows fee (billed), collected, or both, and whether it is by start date or by invoice date.
4. Whether the team figures stay private to Kev. Individual recruiter revenue is performance data, not pay; I recommend it appears only in this bench and hides under Screen-share. Dean's coaching bench would link in, not copy.

**Layout:** one row per recruiter, columns for month, quarter and year-to-date fees against target, pipeline of future starts, and collected. Team total beneath. Names of clients appear as counts only in the Office; a click goes to the Hub.

## 3. Source proof (read-only, 21 Oct 2026)

| Source | Result |
|---|---|
| QuickBooks company info and P&L month to date | **Failed: authentication required.** Kev must re-run `/mcp` sign-in. Nothing proven; AR aging, AP aging, balance sheet and cash flow remain untested. |
| Gusto pay periods | **Works.** Returns two pay schedules (one monthly, one semi-monthly), each with a processed flag, check date and deadline. The October month-end payroll is unprocessed. Enough for the "next payroll" and "last run" tiles. Totals need `list_payrolls` with totals, which I did not call. |
| Hub Rev Report | Not read this session. Columns taken from Radar's invoicing playbook. |
| Drive notes | Not read this session. |

I ran no write, no payroll preview and no payroll change. I did not read or record IDs.

## 4. The daily ticker (Eden Daily top strip and the Office)

| Tile | Computation, 6am daily |
|---|---|
| Cash | Sum of confirmed bank balances from the QuickBooks balance sheet, EPG and EES shown as two small figures, not blended. Marked with the last reconciled date. |
| Cash flow | Cash in minus out, month to date, from the QuickBooks cash flow report, with change from the same day last month. |
| Open invoices | QuickBooks AR aging total, with the overdue amount in a muted red if above zero. |
| Margin | Net income divided by income, month to date, accrual, from the P&L. Grey label until the month closes. |

Each tile shows "as of" time and a dash, not a stale number, if the pull failed. The Daily is not a private surface, so the ticker shows percentages and direction arrows only until Kev says dollars may print there. Dollars show in the Office behind the Screen-share switch.

Pull jobs sit on Q's schedule. They are read-only. Tally computes, Docket re-derives blind, and the gate id prints under the tile. A tile with no passed gate shows "not checked".

## 5. Open questions for Kev

1. Re-authorise QuickBooks so I can prove the sources.
2. Recruiter credit source and split rule (section 2).
3. Where Joel and Chris should leave notes.
4. Whether dollars may print on the Eden Daily ticker.
