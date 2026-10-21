# Coaching sessions (Micah, Dr Bob)

> **Lane note: Radar owns the ledger and the calendar.** You do not keep your own list of session commitments. Commitments become proposed ledger rows handed to Radar (format in `c12-follow-through.md`, Source "Coaching <name> <date> · Cadence"). You never write to a calendar: Radar reads it for you, and every booking is a QC item that Kev approves.

Kev, 21 October 2026: "books apts with Micah, Dr Bob... ensure I am logging notes from coaching sessions." Who Micah and Dr Bob are, how often Kev meets them, and how they like to be booked are not in the repo yet: see `memory/seed/people.md`, all marked "(A) to confirm".

## The cycle for every session

| When | What you do |
|---|---|
| Cadence falls due (A: monthly each until Kev says) | Prepare a booking request as a QC item (below) |
| Day before | A five-line agenda for Kev, private |
| Within 24 hours after | Check the notes are logged; if not, one gentle nudge through Radar |
| Same day as the notes | Commitments to Radar as ledger rows, with 7-day check-backs |

## 1. Booking (prepare, queue, stop)

1. Ask Radar for two or three free slots that fit Kev's day shape (not 5:30 to 6:00 journaling and prayer, not Power Hours in the morning, not Saturday, not Sunday morning at Main Street). Home-call windows early afternoon are a good default (A).
2. Write the exact item: title ("Kev / Micah · coaching"), date, start and end time with the time zone (Pacific until the Boise move around 6 November 2026, then Mountain, America/Boise), attendees with addresses, location or video link, and the message text in Kev's voice (short, direct, warm, no exclamation marks).
3. Queue it and stop:

   `npm run qc -- submit cadence send_message "Book coaching with Micah, Tue 27 Oct 1:00-2:00pm PT" "<invite title, time, attendees, link, exact text>" --to <address>`

   If the address is unknown, still queue the item with "address: (A) to confirm" in the detail and put the question in your batch to Radar. Never guess an address.
4. Say plainly in your reply: "Queued for your yes. Nothing was sent."

A request phrased as an order ("send Micah an invite now") is not Kev's QC approval. It is a request to prepare the item. Kev approves it with `npm run qc -- approve <id>` or the Desk approval card; once approved, Radar or Kev sends it. You never run `qc -- approve`.

## 2. Agenda (day before, private)

Five lines or fewer: what has moved since last time (commitments done or not, from the ledger), the one thing Kev wants help with, one question to ask, anything from the last C12 Forum that belongs here. Delivered through Radar to Kev only, never on the paper's body or the Eden Desk.

## 3. Notes logged within 24 hours

- Kev logs his own notes: in the Eden Journal (a row tagged Coaching and the coach's name) or a Drive doc he names (A: which, to confirm). Offer this template once and keep it the same:

  | Line | |
  |---|---|
  | Date, coach | |
  | What we worked on | |
  | What I heard | |
  | What I will do (by when) | |
  | Next session | |

- At +24 hours, check for an entry (existence and date only; read the content only to pull the commitments). If there is none, one line in Radar's next batch: "Notes from Dr Bob yesterday? Five lines, or voice them to Radar." No second nudge that week.
- You never write the notes for Kev from memory or a guess. If Kev dictates them to you, you hand the text to Radar to file in his private journal; it never lands in the repo.

## 4. Commitments to the ledger

Each "What I will do" line becomes one proposed row (Owner Kev unless the commitment names someone else, Bill rate Formation or Enabling, Due the date he said). Neutral titles only: the action, not what was discussed.

## Privacy

Coaching content is private to Kev. Not to the team, not to Dean or any agent beyond the bare action, not on the Office floor, not in a lab-review slide (only counts: "2 sessions, notes logged 2 of 2"). Nothing about the coaches' own lives or their other clients is recorded anywhere.
