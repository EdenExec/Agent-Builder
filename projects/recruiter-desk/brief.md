---
title: Recruiter Desk, turnkey on day one
subtitle: Spec and v0 for Kev's 21 October ask
org: epg
author: Q
date: 2026-10-21
---

## Executive summary

Every recruiter gets a private desk on day one: their calendar, their job orders, their numbers, today's lead sheet, their replies, their training and an assistant, with one-tap workflows. One command stamps a desk; four recruiter-side steps open it. Nothing is published, shared or sent.

- **Built:** a v0 page that runs at 390px and desktop, light and dark, with no console errors (149 browser checks), and a stamp-out command with 15 passing tests.
- **Day-one friction:** 4 recruiter steps, all in one 10-minute session with Nick. Cloning the Office as it stands would have cost about 9 plus error hunting.
- **Three decisions for Kev:** Claude seats and sharing, own numbers on the desk, and ticket rights (section 9).

Kev, 21 Oct 2026: "We should be making these desks TURNKEY for new hires and the recruiting team... put everyone in a position to launch this level of work in short order... this is going to help people reach their potential."

## 1. What the desk shows

One private artifact per recruiter (Max, Evan, Noah, Andrew, Bridger, Kyle first). Same page for everyone; the config decides name, track and ramp. Each card says where its data comes from and how old it is.

| Card | Shows | Source | Status in v0 |
|---|---|---|---|
| Now / Next | Their own day, Power Hour call-sheet button, Join links | Their Google Calendar, read-only, through their own connector | Built (same code as the Office) |
| Needs you today | Ranked replies, activity due or overdue, rotate flags, next checkpoint; Done / Follow up / Zzz on each | Jobs, replies, training docs on the desk | Built; reply feed is v1 |
| My job orders | Their JOs only: role, client, day on the job, "14+ days, rotate?", due activity, no-activity-in-3-days, lead-sheet links | Hub `jobs`, filtered to this person by `npm run recruiter-desk -- sync` | Built; due and last-activity wait on Q's Crelate mirror |
| My scorecard | RPs today against 15 (or the ramp target), week against 75, five-day bars with the 15 line, PTCs, submittals, FTIs | Crelate, "as of" shown; Dean's Friday pull until the mirror runs | Built; live feed is v1 |
| Today's lead sheet | Per JO: tier counts, new versus already in Crelate, built date, Open the sheet, Request a refresh | Scout, counts and a Drive link only | Built; Scout writes the doc |
| Training | Their track's checkpoints with dates, this Wednesday's page, this week's module | Dean (`training/*`) | Built; Dean supplies content |
| My assistant | Quick chat that knows only this desk; offers a ticket to Scout, Jenny or Q | The viewer's own Claude session | Built; chat is never saved |
| My tickets | Open asks and results | Page writes, Radar's sweep answers | Built |

## 2. Workflows on day one

All six sit on the desk as buttons. The three that think run in the recruiter's own Claude session, with their own connectors, so none of them waits on Radar, and each one drafts only.

| Workflow | What it does | Output | Never |
|---|---|---|---|
| Morning brief | The day, the RP plan with the noon mark, top three actions, one training reminder | Under 120 words, copyable | Invents a number or a name |
| Today's lead sheet | Opens Scout's sheet, or hands Scout a refresh ticket | Link and counts | Shows names or numbers on the desk |
| Inbox drafts | A short draft for each of their top replies | Draft text to proof | Sends |
| Power Hour call sheet | Picks the JO, blocks the hour, sets a dial target, ends with "log every call in Crelate" | One page, under 150 words | Attributes a technique to Kev |
| End-of-day check-out | The seven daily boxes, RPs made, one autopsy line, tomorrow's Power Hour job | `checkouts/<date>`, which Dean folds into Friday's 42-box card | Collects health, family or pay |
| Ticket to Scout, Jenny or Q | Names and roles only; refuses emails, phone numbers and dollar amounts | A ticket the weekday sweep picks up | Approves anything; a ticket is never approval |

Check-out is due 4:30 pm PT Monday to Thursday and 1:00 pm Friday (Dean's rhythm); the desk shows the countdown and the time in the viewer's zone.

## 3. Shared and private

| Rule | How the build keeps it |
|---|---|
| No Kev-private data | The desk's database holds only the documents in section 4. Ledger, inbox, QC, finance and the family wing never touch it. |
| No other recruiter's numbers | One artifact and one database per recruiter. A co-worker on a JO is a first name and a role; no dates, notes or counts. |
| No comp | No field for it exists. Config, sync and page scan for dollar amounts, emails and phone numbers; the tests fail the build on a hit. |
| Hub client rules | Only JOs the person is on are written, so another client never enters the page. Discreet clients keep the Hub's "Client · discreet" label. Screen-share switch hides every client name, calendar title, reply and ticket text. |
| Shared with that recruiter only | Private artifact, named work address, no link sharing (Kev's yes). |
| Self-check | If a desk's profile names a different recruiter, the page shows nothing and says so. |
| Transparency | The page says plainly: Kev, Nick, Dean and Q can read what is saved on the desk (tickets, check-outs, Done marks). Chat is not saved. |

<!-- pagebreak -->

## 4. Data on a desk

| Path | Writer | Cadence |
|---|---|---|
| `profile/me`, `training/track` | Q's stamp, seed batch | Once, then on a track change |
| `jobs/{id}` | Q's `sync` from a Hub export, pushed by Radar | Hourly weekday sweep |
| `scorecard/week` | Dean (Friday); the Crelate read once Q's mirror runs | Friday, then hourly |
| `leads/{id}` | Scout, after the nightly load | Nightly |
| `replies/{id}` | Day two, from the recruiter's own Gmail connector (v1) | On open |
| `training/wednesday` | Radar, with Wednesday's pages | Tuesday evening |
| `tickets`, `actions`, `checkouts` | The page | On the recruiter's tap |

Rules: read `view`, write `interact` on those three collections only. Not proven yet: the live `db` path and rule syntax (Radar loads `artifact-capabilities` at publish).

## 5. Stamping a desk

```
npm run recruiter-desk -- new kyle --name "Kyle Cockell" --start 2026-11-02 --office Boise --track accelerated
npm run recruiter-desk -- new --all          # every entry in roster.json with no desk yet
npm run recruiter-desk -- sync kyle --jobs hub-jobs.json
npm run recruiter-desk -- check              # privacy scan of the template and every desk
```

Per desk it writes `desk.json`, `desk.html`, `seed.json` and `setup.md` under `projects/recruiter-desk/desks/<slug>/`. Tracks: `accelerated` (Kyle: 0 RPs in shadow week, then 15), `standard` (0, 5, 10, 15 by week), `established` (15 from day one). Ramp numbers and checkpoints are (A) from Dean's drafts.

| # | Step | Who | Kind |
|---|---|---|---|
| 1 | Stamp the desk | Q | Tool |
| 2 | Publish privately and push the seed and jobs batches | Radar | Gate: one batched yes covers all desks in a wave |
| 3 | Share with the work address only | Kev | Gate |
| 4 | View access to the lead-sheet Drive folder for their JOs | Nick | Access |
| 5 | Connector session (section 6) | Recruiter with Nick | Day one |
| 6 | Watch the first check-out land, log friction | Dean, Q | Check |

## 6. Day-one friction

Counted as every sign-in, connector step or permission prompt the recruiter must clear before the desk works. Estimates from how the Office behaves; Kyle's day one is timed and replaces them.

| Step | Cloning the Office as is | Turnkey |
|---|---|---|
| Accept the Claude invite and sign in | 1 | 1 |
| Allow Claude on the page | 1 | 1 |
| Connect Google Calendar, allow the page to read it | 2 | 2 |
| Connect Gmail, allow the page to read it | 2 | Day two, optional |
| Connect Drive, allow it (lead sheets, uploads) | 2 | Cut: plain links; Nick shares the folder |
| Microphone | 1 | Cut: not in v0 |
| Finding out which of these is missing | 3 pauses | Cut: one scripted session |
| **Total on day one** | **about 9 plus 3 pauses** | **4, in one 10-minute session** |

For Kev and Radar, per wave: 2 gated approvals (publish, share) instead of 2 per desk, and one standing rule to approve once: ArtifactData writes on the listed desk URLs. Gates stay gates; this only batches them.

<!-- pagebreak -->

## 7. Rollout (all dates proposed)

| When | What | Gate to move on |
|---|---|---|
| Thu 22 to Thu 29 Oct | Kev reviews v0; Dean supplies checkpoints and the first modules; Q wires the Hub sync, Scout's lead-sheet doc and the scorecard feed | Kev's three decisions |
| Fri 30 Oct | After Kyle's GO, Radar publishes and seeds his desk; Kev shares it | Kyle's pre-start gate |
| Mon 2 Nov | Kyle's day one: connector session with Nick, desk open | 4 steps or fewer |
| Fri 6 Nov | Checkpoint 1 plus a friction review (Kyle, Nick, Q) | Check-outs filed 4 of 5 days; no isolation incident |
| Mon 9 Nov | Max and Evan | Fixes from Kyle's week shipped |
| Mon 16 Nov | Noah, Andrew, Bridger (Bridger over Zoom) | Max and Evan's friction under 4 steps |
| Every hire after | Stamped the Friday before they start | Dean's setup checklist |

The Friday 42-box card stays on the Eden Desk for now; the desk's daily check-out feeds it and Dean folds the two. Moving the card into the desk is a v2 question.

<!-- pagebreak -->

## 8. Dean's piece: paste into new-hire-setup.md

Dean's files are untouched. Add this under "The packet", as item 5, and one row to the accounts checklist.

```
5. **Day one: your desk.** Every recruiter starts with a personal desk: their calendar, their job orders, their numbers
   against 15 RPs a day and 75 a week, today's lead sheet, their replies, their training and an assistant. Q stamps it
   (`npm run recruiter-desk -- new <slug> --name "<Name>" --start <date> --track <accelerated|standard|established>`),
   Radar publishes it privately after Kev's yes, and Kev shares it with the recruiter's work address only.
   Setup is one 10-minute session with Nick on day one, four steps: accept the Claude invite and sign in, allow Claude
   on the page, connect Google Calendar, allow the page to read it. Day two, optional: connect Gmail for inbox drafts.
   Every evening the recruiter files the desk's check-out (4:30 pm PT Monday to Thursday, 1:00 pm Friday); you read
   it for Friday's card. The desk shows only that recruiter's numbers; never copy another recruiter's onto it.

Accounts checklist row: "Recruiter desk | Q stamps, Radar publishes, Kev shares | private, work address only | done date"
```

## 9. Decisions for Kev

| # | Decision | Recommend | If silent |
|---|---|---|---|
| 1 | **Seats and sharing.** A recruiter needs a Claude account for the desk's chat, calendar and drafts, which is a spend, and a yes to publish and share Kyle's desk. I cannot price a seat. | Yes for Kyle now (Radar prices it and queues the item); the other five after his first week | Kyle starts on Crelate and the Eden Daily; no desk |
| 2 | **Own numbers.** Each recruiter sees their own RPs against 15 and 75 on their desk, hourly once the mirror runs. Kev, Nick and Dean read the same data. Nothing compares one person with another. | Yes | The card shows Friday's numbers only |
| 3 | **Ticket rights.** Recruiters hand tickets straight to Scout, Jenny and Q, capped at 3 open each. Anything that spends (ZoomInfo credits) or sends stays a QC item. | Yes | Tickets go to Nick, who relays |

Assumptions to confirm along the way: Kyle starts Mon 2 Nov; the lead-sheet Drive folder can be shared per recruiter; Hub names in `team[].recruiter` match the config's `hubName`.

## 10. What is not proven

- **Not run:** the live `db` and `sample` paths in the Claude viewer. They ran against a mock in headless Chromium; consent prompts and the friction counts are estimates until Kyle's day one.
- **Not built:** the Gmail reply feed, the live Crelate scorecard feed, the Friday card inside the desk, voice. Each is marked in the table above.
- **Open question from the Office:** the Office uses a mono face for stamps; this page follows the brand rule and uses Montserrat only. Radar to decide whether the Office follows.
