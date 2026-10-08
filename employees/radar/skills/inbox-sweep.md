# Hourly inbox sweep

Runs weekdays, every hour from 7am to 6pm Pacific. Silent: no message to Kev unless an interrupt rule fires. Goal: Superhuman inbox at zero by the check-out with nothing lost.

## Steps

1. **Pull.** `list_threads` with `labels: ["INBOX"]`, newest first, up to 50, plus the Important split explicitly. Skip threads already handled this day (Radar labels them, see step 4).
2. **Classify each thread** into one action:

| Class | Examples | Action at trust stage 1 |
|---|---|---|
| Interrupt | See `interrupt-rules.md` | Push now, draft the reply, ledger row Lane Mine |
| Ask of Kev | Someone needs a reply, a decision or a file | Draft the reply in Kev's voice (`create_or_update_draft` with `instructions`, type `reply`), ledger row: Lane Batch if it is a small decision, Lane Mine if only Kev can write it. Leave the thread in the inbox. |
| Waiting | Kev is owed a reply | `create_or_update_reminder` with `mark_done: false`, remind in 2 business days (clients, candidates) or 5 (vendors). Ledger row Lane Waiting on. |
| Bill or finance | Finance split, Taxes and Bills label, invoices, statements | Ledger row Lane Batch, Bill rate Admin, Due ten days before the stated due date, Owner Kev or Joel. Never pay, never reply. Leave in the inbox. |
| Family | Family calendar, school, Ally, kids, church | Ledger row Lane Mine or Scheduled, Bill rate Family. Never archive. |
| Team | Recruiters, Nida, Nick, Joel | Ledger row only if it asks Kev something. Otherwise leave it. |
| Noise | Newsletters, notifications, marketing, receipts already filed, Coaching Briefs older than today, calendar acceptances | Archive (`update_thread`, remove INBOX). Count it. |

3. **Draft, never send.** Stage 1 drafts only. Stage 2 and 3 rules are in `trust-ramp.md`. A draft must read as Kev: short, direct, warm, no filler. Use `instructions`, not `body`, so the writer keeps his style.
4. **Mark.** Apply a Superhuman label `Radar/Swept` to every thread handled so the next sweep skips it. Ledger rows carry Source = "<subject> from <sender>, <date>".
5. **Log.** Append one line to the sweep log row in the ledger ("Radar sweep · <date>", Category Other, Lane Scheduled, Owner Radar): hour, archived count, drafts written, rows created, interrupts sent. One row per day, updated each hour, Status Done at 6pm.

## Never

- Never archive anything from a client, a candidate in process, family, finance or legal.
- Never reply to a thread that mentions money, offers, compensation, legal or family.
- Never push twice for the same thread.

## Admin split (Kev, 8 October 2026)

admin@edenexec.com auto-forwards into kev@ (and joel@) and lands in a Superhuman split called Admin (`deliveredto:admin@edenexec.com OR to:admin@edenexec.com`). Sweep it as its own class every hour: vendor notices, portal and compliance mail, W-9 and banking requests, state agency mail (SAW, DOR, L&I, ESD) and invoices file to the ledger with Category Admin / Emma Gap and Owner Joel where it is his; receipts and notifications already filed are noise and archive, and obvious junk is unsubscribed on sight (Kev's standing yes, 8 October 2026), logged on the sweep row; anything with money, legal or a signature goes to the Batch, never answered. Replies to Admin threads are drafted from the admin@ send-as alias, not from kev@. The personal Gmail (kdt.williams@gmail.com, on the Gmail connector) is Personal and family only: file, never archive.
