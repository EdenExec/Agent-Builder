# Invoicing (receivables)

Proposed 5 October 2026 from the sent mail, the Hub and Emma's old threads. Kev confirms or edits; until he does, every step below ends in a draft, never a send. Joel Fairchild keeps payables, bookkeeping and the finance@ inbox. Radar keeps receivables: build, draft, chase.

## Where things live

| Thing | Where |
|---|---|
| Placements and fee maths | Hub sheet "2026 - EPG Dashboard (Hub)", tab "2026 Rev Report" (`1J1RSMPF5B5tFooRN_PEJdAzK6y74lXBqgxIxq6byP24`). One row per placement or retainer: #, Candidate, Start Date, Net Terms, Client, Role, H.A., Salary, Rate, Fee, Discount, Eden Gross, Notes. |
| Template | Google Doc "(TEMPLATE) Invoice - ____ - _. _____ (Role)" (`1MuNperxtLjmhs2-216FW2YBpvrnJl_PgIIJS1bR80_Y`), in the Invoices folder (`1fEMaQEa9j3Xc6fNQMqUNouvr3uADefeO`). Copy it with `copy_file`; never edit the template. The copy keeps the letterhead, Montserrat and layout. |
| Finished invoices | Same folder, named `Invoice - <#> - <F. Last> - <Role>`. |
| Sent record | The email thread in Superhuman and a ledger row (Lane Waiting on, Owner the client's AP contact, Due the terms date). The Hub column "Date: $ In" is empty on every 2026 row, so the ledger is the tracker until Kev adds "Invoice sent" and "Paid" columns to the sheet. |

## Trigger

A Rev Report row whose Start Date has arrived and has no sent-invoice thread. The invoice is dated the start date and goes out that morning (Emma sent Kev the PDF the morning of the start; Kev then sent it to the client). Retainers go out on the 1st with the terms the sheet names ("Net 15", "due by the 5th").

## Filling the doc

| Field | Source |
|---|---|
| Invoice # | Rev Report `#` exactly (62026-A and 62026-B are two invoices) |
| Date | Start date, written `M/D/YYYY` |
| Client Name, Contact | Rev Report Client; Contact is the AP or hiring contact the last invoice to that client went to (see table) |
| Role, Candidate, Hiring Authority | Rev Report Role, Candidate, H.A. |
| Salary, Rate, Fee | Rev Report. Fee = Salary x Rate. Check it before writing it; Carmel caught a wrong rate and Megawatt caught a wrong salary. |
| Retainer Fee | When part of the fee was paid up front, add a line "Retainer Fee: $X" and bill Fee minus X. Not a discount (Kev, 8 June 2026). |
| Discount | Only when the fee itself was cut (relocation, sign-on, referral). Show the line and the reason in one short phrase. |
| Other | Leave out unless the row has a sign-on or external item to pass through. |
| Total Amount Due | Fee after retainer and discount |
| Invoice Terms | Rev Report Net Terms. Blank means Net 30 from the start date. |

Export the finished doc as PDF with the same name. Carmel asks for a Word copy so they can black out salary; keep `.docx` export in mind when a client asks.

## The email (draft only at stage 1)

- To the client's AP contact, cc Nick and the recruiter on the deal (Bridger on VMG and Baker in September).
- Subject: `Invoice <#> - <F. Last> - (Net 30 - <start date>)`.
- Body in Kev's voice, three lines: invoice attached for <first name>, who started <date>; W-9 and contact info already on file (or "attached" the first time with a client); call Nick or Kev with questions; thanks for the partnership.
- Attach the PDF. Draft with `create_or_update_draft`, then a ledger row Lane Batch, Owner Kev, so he sends it from the check-out batch or the paper. At stage 2 or later, send on the start date and list it in that day's "sent for you".

## After sending

- Ledger row Lane Waiting on, Owner the AP contact, Due the terms date, Source the thread subject. Superhuman reminder on the thread for the due date.
- Past due: a Batch row for Kev with the recommended move (Nick calls the hiring authority first, as with Baker). Never a dunning email without Kev.
- W-9 and banking: admin@edenexec.com holds banking info; W-9 copies were made by Emma per client. Ask Kev where the master W-9 lives before the first new client.

## AP contacts seen so far

| Client | Invoice goes to | From thread |
|---|---|---|
| Baker Construction | Wes Avritt (Avrittw@bakerconstruction.com), cc Nick | 62046, 62059 |
| VMG | Peter Cramer (pcramer@vmgmech.com), cc Nick, Bridger | 62060 |
| Megawatt | Joel Gaines (jgaines@megawatt.com) | 62502 |
| PENTA | Anthony Boca (aboca@pentabldggroup.com), Andrea Robinson cc'd once | 62043 |
| Carmel Partners | Caroldean Ross (cross@carmelpartners.com); wants a Word copy and a W-9 | 62047, 62048 |
| PB South, Pence Kelly, Swinerton DFW, Hoffman, Triton | Not in Kev's sent mail. Ask. |

## Never

- Never send at stage 1. Never change a fee, rate or discount on your own: a mismatch with the Rev Report is a Batch question for Kev.
- Never put salary or fee figures in a ledger row; reference the invoice number.
