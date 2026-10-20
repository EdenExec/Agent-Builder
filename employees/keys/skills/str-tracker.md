# The expense and revenue tracker (Tally reads it)

One ledger for the house: `projects/600-se-101st-str/ledger.csv`. Tally reads it without asking, so the format never drifts. KDTW Group, kept apart from Eden's books: no Eden entity, no Eden account, no co-mingling.

## Columns (fixed order, header row as written)

`date,type,category,vendor,description,amount_usd,status,paid_by,receipt,qc_id,notes`

| Column | Rule |
|---|---|
| date | YYYY-MM-DD, the date of the cost or revenue (forecast rows use the planned date) |
| type | `expense` or `revenue` |
| category | One of: setup-furnishing, setup-supplies, setup-repairs, permits-licences, insurance, utilities, internet, cleaning, management, platform-fees, lodging-tax, sales-tax, supplies-restock, maintenance, professional-fees, mortgage-interest, property-tax, hoa, booking-revenue, cleaning-fee-revenue, other |
| vendor | Business name only; never a private person's contact details |
| description | One line |
| amount_usd | Positive number, two decimals, no currency sign or commas |
| status | `forecast`, `approved` (QC approved, not yet paid), `actual` (paid or received, with a receipt) |
| paid_by | `kev`, `platform` (withheld by VRBO or Airbnb), `manager`, or blank for forecast |
| receipt | Drive link or file path; required when status is `actual` |
| qc_id | The QC item that approved the spend; required for any expense moving past `forecast` |
| notes | Source of a forecast figure, or anything Tally should know |

## Rules

- Every row is a claim. A forecast row cites its source in notes. An actual row has a receipt. Never round to make a total look tidy.
- Platform payouts are recorded gross with fees and taxes withheld as their own rows, so the revenue ties to the payout statement.
- No account numbers, card numbers or family personal data in the ledger.
- You append and correct rows; you never delete one. A correction is a new row with a note.

## The pro forma (`projects/600-se-101st-str/pro-forma.md`)

Low, base and high cases for the first 12 months: nights booked, ADR, gross booking revenue, platform fees, cleaning, management, utilities, insurance, supplies, maintenance reserve, lodging and sales tax pass-through, net before mortgage and depreciation; plus the one-time setup budget and the months to recover it. Compare with the alternative of a long-term lease at local market rent (a source cited) so Kev can see the trade.

## The numbers gate

Before the pro forma or a monthly summary goes to Kev, open a gate (`npm run gate -- open ...`) with each figure and its source, and give Tally the id. Tally re-derives blind. Quote the gate summary in the Radar hand-off. Tax treatment questions (Schedule E or C, depreciation, the 14-day rule, B&O) are Tally's and Chris's, raised by you, answered by them.

## Monthly rhythm (once live)

Day 3: reconcile platform payouts to booking revenue rows. Day 5: one-page month summary (revenue, occupancy, ADR, costs by category, net, against the pro forma).
