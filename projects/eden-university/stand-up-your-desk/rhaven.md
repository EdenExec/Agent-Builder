---
title: Stand up your desk · Rhaven knowledge base
subtitle: How the course becomes the answers the Eden app gives a new recruiter
author: Dean
date: 2026-10-28
cover: false
---

## Executive summary

Every module in `course.md` is already written as one retrievable unit, so Rhaven can answer "how do I..." from it with no rewrite. A new recruiter asks in the Eden app; Rhaven answers in five steps or fewer, names the module, and points at the page. It answers and points. It does not act for them.

- **One module, one chunk.** Stable ID (M01 to M27), a "Rhaven answers" line in the recruiter's own words, steps in a table, a status tag and a verified date.
- **Eden owns the data.** The course lives in Eden's Drive and database; Rhaven reads it through Eden's database and is never its only home (Kev, 11 Oct).
- **Rhaven's feature set is not in any Eden file** (Eden App brief, section 11). The format below is plain markdown and JSON so it works with whatever Cody confirms.

## From course to knowledge base

| Stage | What happens | Owner | Status |
|---|---|---|---|
| 1 Source | `course.md` in the repository is the master. Edits are made here | Dean | Draft |
| 2 Publish | Each module is published as a Google Doc in the Drive folder "Eden University · Stand up your desk" (the recruiters read this) | Dean, with Kev's yes to publish | Not done |
| 3 Store | Each module is written to Eden's database as `university/modules/{id}` with the fields below | Q | Not built |
| 4 Read | Rhaven reads that collection through Eden's database | Cody | Terms and scope to be set |
| 5 Answer | The Eden app's assistant answers and cites the module | Rhaven | Not live |

## The module record

| Field | Example | Used for |
|---|---|---|
| `id` | `M02` | Citation and deep link |
| `title` | Your Eden email signature | Display |
| `phase`, `day`, `minutes` | 1, 1, 15 | "How long does it take?" |
| `pillar` | 07 Execution | Ties the answer to the standard |
| `needs` | `["M01"]`, gap IDs | "What do I need first?" |
| `goal` | One sentence | First line of the answer |
| `steps` | Rows of do-this and you-should-see | The answer body |
| `proof` | The "show me" line | "How do I prove I did it?" |
| `answers` | The questions in the recruiter's words | Retrieval keys |
| `tool` | `google`, `crelate`, `cloudtalk`, `external`, `eden-app` | The swap rule below |
| `status` | `verified`, `unverified`, `retired` | Whether Rhaven may state a step flatly |
| `last_verified` | A date, empty until the first hire walks it | Freshness |
| `source` | The Eden file it came from | Trust |

## Answer rules for Rhaven

| Rule | Behaviour |
|---|---|
| Cite | Every answer ends "Module M10 in Stand up your desk" with a link |
| Short | Five steps or fewer, then the proof line. Longer answers link to the module |
| Honest about gaps | A step tagged UNVERIFIED is given with the words "this step is not yet confirmed; tell us what you see" |
| Never ask for secrets | It never asks for or repeats a password, code or API key. If a user pastes one, it says to change it and does not repeat it |
| Refuse what is not training | Pay, commission, health, family, age, HR or another recruiter's numbers: "That is not something I answer. Ask Kev or Nick in person." |
| Point, do not act | It does not log into a tool, send a message or change a record. Read first, write last |
| Escalate | "Report a step" opens a ticket naming the module; a missing seat opens "Seat missing" with the owner from `gaps.md` |
| Discreet | A discreet client shows as "Client · discreet" in any answer outside the Team Hub |

<!-- pagebreak -->

## The tool-swap rule

Kev, 28 Oct 2026: "Eventually we get rid of Crelate and run the whole company off the Drive and local storage with remote log ins." Goals, proofs and rhythm do not change when a tool does. Only the steps table of a module tagged to that tool changes.

| Tool | Modules | When it changes |
|---|---|---|
| Google (Gmail, Drive, Calendar, Gemini) | M01 to M06, M13, M17, M20, M25 | Stays in the end state (Drive plus Eden-owned storage) |
| Crelate | M10, M15, M16, M18, M23 | Rewritten as Eden app modules at the switch; the Crelate version is marked `retired` with the date and kept |
| CloudTalk | M12 | If calls move, rewrite the steps |
| External libraries | M09, M11 | Only if Eden changes provider |
| Eden app | M07, M08, M19, M27 | Updated as the app ships |

## Keeping it true

| Trigger | Who | What |
|---|---|---|
| First hire's walk-through (week of 2 Nov, A) | The hire, Dean | Every UNVERIFIED tag is confirmed or corrected; `last_verified` is stamped |
| A "Report a step" ticket | Dean | Fix the module the same week; republish; re-store |
| Every 90 days | Dean | Re-read every module against the live product; stale ones flip to `unverified` |
| A tool change | Q, Dean | Retire and replace per the swap table |

<!-- pagebreak -->

## The 20 questions of week one

Each answer is drawn only from the course. Test: Rhaven passes when at least 18 of 20 return the right module and no step the course does not contain (A).

| # | Question | Answer | Module |
|---|---|---|---|
| 1 | I can't sign in to my Eden account. | Use the first sign-in from your welcome message at mail.google.com, in your Eden Chrome profile. If Google says the account does not exist, file "Seat missing · M01"; the owner is Q. Never email your password to anyone. | M01 |
| 2 | How do I turn on 2-Step Verification? | myaccount.google.com > Security > 2-Step Verification > Get started. Choose a phone prompt or authenticator app and save the backup codes offline. Screenshot "On" with codes cropped out. | M01 |
| 3 | How do I set my email signature? | Gmail > gear > See all settings > General > Signature > Create new. Paste the four-line block, bold the name and EDEN PARTNER GROUP lines, Sans Serif, black, defaults set to Eden, Save. | M02 |
| 4 | What does the Eden signature say? | First Last, Recruiter, EDEN PARTNER GROUP, your Eden email (and CloudTalk line after M12), edenpartnergroup.com. No logo, quote, colour or emoji. | M02 |
| 5 | Where do I save my files? | In "Eden · First Last": 01 Lead sheets, 02 Candidate data sheets, 03 Submittals, 04 Autopsies and notes, 05 University proofs. Candidate data stays in your Eden account. | M03 |
| 6 | When are my Power Hours, and when do I call the East Coast? | Blocks in the course: 8:00, 11:00 and 1:00 PT (A). Call a zone while it is business hours there. East Coast lists are done by 1:00 PM PT (4:00 PM ET). | M04 |
| 7 | What do I name the calendar block? | Start the title with POWER HOUR (for example "POWER HOUR · Eastern"). Your desk switches to Power Hour focus when that block starts. | M04 |
| 8 | What are the Seven Pillars and the Must-Dos? | Righteousness, Winning, Accountability, Discipline, Transparency, Growth, Execution. Must-Dos: plan the week, 15 RPs on track by noon, audit your inventory, build your own book, autopsy your work, activity / inventory / skill. | M05 |
| 9 | How do I use Gemini, and what can't I paste? | Use the Gemini or Help me write control in Gmail and Docs (menu names not yet confirmed). Never paste candidate pay, personal email, home address, EEO or any health or family detail, and read every draft before sending. | M06 |
| 10 | Why can't I reply to an ask on the Team Hub? | You were probably shared as Viewer. Replying needs Contributor. File a ticket naming M07; do not ask for an invite by email. | M07 |
| 11 | How do I open my desk? | Accept the Claude invite sent to your Eden address, sign in, allow Claude on the page, connect Google Calendar. Check your own name at the top. | M08 |
| 12 | Where do I log in to Next Level Exchange and Recruiter U, and which video first? | Use the access in your welcome message; the login pages are not yet confirmed. Start with the first video on Eden's list (until it exists, the first Foundation video). Three takeaways and one thing to try, daily. | M09, M11 |
| 13 | Where does a new lead list go in Crelate? | Into a bucket in Leads / Buckets, named Client - Role - City Leads. Move a person to an active job order only after you have engaged them. Never load leads straight onto a job order. | M10 |
| 14 | What is Dawg Pound? | The lead-pool stage on a job's pipeline: people not yet engaged. This definition is not yet confirmed by Nick or Kev. | M10 |
| 15 | How do I call from CloudTalk? | Accept the invitation, allow the microphone, set Available, and place the call from your Eden line. Test by calling your own phone. Login page not yet confirmed. | M12 |
| 16 | What counts as an RP, and how many? | An RP is a recruiting call logged in Crelate against the right job. The standard is 15 a day, on track by noon, and 75 a week. A call that is not logged does not count. | M15, M14 |
| 17 | What columns go on my candidate data sheet? | Number, Tier, Name, Title, Company, Company type, Trade, City, State, Time Zone, LinkedIn, In Crelate, Fit note, Source, Note, Called, Result, Mobile, Mobile source. | M17 |
| 18 | Why are City, State and Time Zone separate? | Crelate picks up each tag only from its own column when the sheet is loaded. One combined location column breaks the load. | M17 |
| 19 | When is my check-out and the Friday card due? | Check-out 4:30 PM PT Monday to Thursday and 1:00 PM Friday. The 42-box card is due Friday 1:00 PM PT. A win is 38 of 42. | M14, M19 |
| 20 | Who signs off my certification, and what if a step is wrong? | Kev or Nick sign C1, C2 and C3 in person from your proofs. If a step is wrong or stale, use "Report a step" with the module ID. | M13, M27 |

## Questions for Cody (Rhaven)

| # | Question | Why it matters |
|---|---|---|
| 1 | Can Rhaven read a collection in Eden's database, or must content be loaded into Rhaven? | Eden owns the data |
| 2 | Does it cite sources, and can we require a module ID in every answer? | Trust and the pass test above |
| 3 | Can it know the asker (name, track, day of the ramp) without storing their numbers? | "What is my next module?" |
| 4 | Can we set refusals (pay, health, family, other people's numbers)? | Privacy rules |
| 5 | Where are questions and answers logged, and who can read them? | Transparency |
