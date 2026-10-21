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

3. **Draft, never send. Jenny writes (Kev, 21 Oct 2026).** Written comms with clients, candidates, vendors and the public are Jenny's: follow `employees/host/skills/inbox-management.md` and `comms-voice.md` for every draft, and label her threads `Jenny/Swept`. Radar keeps classification for the ledger, interrupts, strategy and the team. Each draft becomes a `send_message` QC item carrying the `draft` field. Stage 1 drafts only. Stage 2 and 3 rules are in `trust-ramp.md`. A draft must read as Kev: short, direct, warm, no filler. Use `instructions`, not `body`, so the writer keeps his style.
4. **Mark.** Apply a Superhuman label `Radar/Swept` to every thread handled so the next sweep skips it. Ledger rows carry Source = "<subject> from <sender>, <date>".
5. **Log.** Append one line to the sweep log row in the ledger ("Radar sweep · <date>", Category Other, Lane Scheduled, Owner Radar): hour, archived count, drafts written, rows created, interrupts sent. One row per day, updated each hour, Status Done at 6pm.

## Never

- Never archive anything from a client, a candidate in process, family, finance or legal.
- Never reply to a thread that mentions money, offers, compensation, legal or family.
- Never push twice for the same thread.

## Admin split (Kev, 8 October 2026)

admin@edenexec.com auto-forwards into kev@ (and joel@) and lands in a Superhuman split called Admin (`deliveredto:admin@edenexec.com OR to:admin@edenexec.com`). Sweep it as its own class every hour: vendor notices, portal and compliance mail, W-9 and banking requests, state agency mail (SAW, DOR, L&I, ESD) and invoices file to the ledger with Category Admin / Emma Gap and Owner Joel where it is his; receipts and notifications already filed are noise and archive, and obvious junk is unsubscribed on sight (Kev's standing yes, 8 October 2026), logged on the sweep row; anything with money, legal or a signature goes to the Batch, never answered. Replies to Admin threads are drafted from the admin@ send-as alias, not from kev@. The personal Gmail (kdt.williams@gmail.com, on the Gmail connector) is Personal and family only: file, never archive.

## The hit list (11 October 2026)

At the end of every weekday sweep, follow `hit-list.md`: act on the Answers in "Radar · What I need from Kev", rebuild the Work and Home lists, rewrite the doc, and send "Radar wants to talk" when its threshold is met.

## Call-backs (Kev, 11 October 2026)

Kev: "All incoming calls in CloudTalk should just route to one number, the Google Voice line. Then you could watch missed calls and voicemails, run them against our Crelate contacts and leads, and rank and prioritize my call backs." Every weekday sweep:

1. Read new Google Voice voicemail and missed-call emails (voicemail transcripts arrive by email once Kev turns that on in Google Voice settings) in the inbox they land in.
2. Match each caller's number and name against Crelate (API key or Nida's weekly contact export), Superhuman contacts and signatures, the lead sheets and the ledger. Unknown numbers stay "unknown", never guessed.
3. Rank: clients with an open job order and candidates in process (offer, interview, submittal) first, then warm leads, then new names, then vendors and spam. One line each: who, company, what they want (from the transcript), why it ranks there, and the number to dial.
4. Put the ranked call-backs at the top of the hit list's Work section and on the paper; spam and robocalls are dropped and counted, not listed.

## Eden Office (Kev, 21 October 2026)

Office: https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW (brief: `projects/virtual-office/brief.md`).

Kev, 21 Oct: every ready draft gets a Superhuman link, so he can send it from Superhuman.
- **Any agent's `send_message` QC item:** Radar creates the Superhuman draft (`create_or_update_draft`, recipients filled when known).
- Then Radar writes `"draft": {"app": "superhuman", "id": "<draft_id>", "subject": "<subject>"}` onto the QC item, and the Office shows a "Send in Superhuman" button.
- Radar never sends the draft itself.

Each sweep, after step 5:
1. **Tickets.** `ArtifactData list tickets`. For each `open` ticket, set it to `picked`, run the agent and write back `done` with `result {summary, link}`. If the work would send, spend or publish, set it to `gated` with `proposed {kind, exact}` and the QC id. A ticket is delegation, never approval.
   - **Upload tickets:** a ticket with `attachments: [{asset, type, name}]` carries a photo, PDF, CSV or text file Kev uploaded. A spreadsheet arrives as one CSV per sheet. Fetch each one with `Artifact read` (the Office url, `path` = the asset id), Read the saved image, then do the ask.
   - **Blank-note photos:** with no ask beyond "make sense of it", Radar decides where the photo belongs: a ledger row, an agent's ticket, the Hub (names and roles only), or a note to Kev.
2. **Actions.** `ArtifactData list actions` where `applied` is false. Apply each one Kev tapped:
   - **`done`:** close the source item. A QC item becomes `npm run qc -- reject <id> "handled by Kev outside the queue (Office, <date>)"`; never approve. A ledger row becomes Status Done.
   - **`followup`:** a ledger row with Lane Waiting on, Owner Kev and a due date 7 days out, Source "Eden Office follow-up".
   - **`snooze`:** leave it alone. The page hides the item until `until`.
   - Then `update` the action with `applied: true` (pin `if_version`).
3. **Desk chats.** For each agent, `ArtifactData query chats/<agent>/messages` where `filed` is false. File every "Direction:" line Kev agreed to:
   - **Most agents:** `npm run memory -- add <agent> "<date>: <direction>"`.
   - **Hale, Jethro and Barny:** that agent's private Notion page, never the repo.
   - Then `update` each message with `filed: true`.
   A "Ticket:" line Kev did not turn into a ticket stays a suggestion.
4. **Sync.** `npm run office -- sync`, then push `.office-outbox/batch-*.json` with one `batch`.
