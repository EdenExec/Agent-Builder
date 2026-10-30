---
title: Crelate cadence game plan for Ember (MPCs and warm inventory)
status: proposal for Kev's decision
author: Ember (MPC and warm-inventory keeper), through Radar
date: 2026-10-28
source: Kev's comment on the Client work zone, 28 Oct 2026
---

# Crelate cadence game plan

**Result:** five labels recruiters put on a person in Crelate, one cadence per label, and Ember reads them each weekday without ever writing to Crelate. **My pick: start with Version A this week.** It uses only reads already verified, and recruiters already know the motion, because Eden has MPC buckets today. We move to tags (Version B) once Q has verified one read.

Kev, 28 Oct 2026: "we can come up with a game plan to get tags in crelate or notes in crelate set on a cadence for this agent to watch and manage. Stay top of mind for prospects."

## Decisions for Kev

| # | Decision | My pick | If you say nothing |
|---|---|---|---|
| 1 | Which version to start with | **A: five Warm cards in Leads / Buckets** | Ember stays in pre-plan mode: it reads only the existing MPC buckets and recent screens |
| 2 | The five label names and cadences below | Yes as written | Ember uses them as written in pre-plan mode |
| 3 | Who creates the five cards in Crelate (a write, so a person does it) | Nick, in about 10 minutes | No cards; pre-plan mode |
| 4 | Fold the two existing MPC buckets (#8060 Megawatt, #7315 Pence Kelly) into "Warm · MPC" | Not yet: Ember reads them as they are | They stay; Ember counts them as MPC |
| 5 | Show the Warm inventory list on the Team Hub, as a folder next to "Candidates in process" | Yes, after two weeks of clean lists in Ember's folder | The list stays in `employees/ember/drafts/warm-inventory/` |

## The five labels

| Label (exact) | Means | Touch every | Who applies it | When | What Ember does |
|---|---|---|---|---|---|
| `MPC` | Most Placeable Candidate: strong, open to a move, and Eden markets them without a job order | 30 days | The recruiter who screened them; Kev | Right after a screen where the recruiter would put them in front of a client tomorrow | Lists them; asks the owner to touch at 30 days; red alert to Radar past 60; considers them for Monday picks |
| `Follow-up 14` | Hot follow-up: a call back was promised, or something changes soon (bonus paid, project ends, a family move) | 14 days | Any recruiter | When they end a call with "call me in two weeks" | Lists them; asks the owner at 14 days |
| `Follow-up 30` | Warm follow-up: worth a monthly touch | 30 days | Any recruiter | When they end a call with "next month" | Lists them; asks the owner at 30 days |
| `Passive A` | A-player who is not looking, but someone Eden wants to know first when they are | 90 days | The recruiter or Kev | After a strong conversation with someone not ready to move | Lists them; asks the owner at 90 days |
| `Do-not-market` | Never shown to a client: asked for confidentiality, works for a client, or Kev said so | none of its own | Anyone who learns it; Kev | The moment it is known | Never picked, never in a blurb, never on a target list, whatever else they carry |

- **Two labels:** the shorter cadence wins (MPC plus Follow-up 14 is touched every 14 days).
- **Taking a label off:** the owner removes it when the person is placed, says no more calls, or is no longer a fit. Ember never removes one; it suggests in its note ("Passive A with no touch in 180 days: keep?").
- **In process:** leave the label on. While the person is submitted, interviewing or in an offer, they are Casey's (Candidates in process) and Ember posts nothing. If they drop out, Ember picks them back up.
- **Untagged screens:** Ember lists recent screens with no label as "Suggested: tag or leave". The owner decides.

## How Ember reads them (three versions)

### Version A: five Warm cards in Leads / Buckets (my pick, start now)

Nick creates five job cards in the **Leads / Buckets** column, one per label, shared by every recruiter (one card per label, never one per recruiter, per your 21 Oct pipeline rule): `Warm · MPC`, `Warm · Follow-up 14`, `Warm · Follow-up 30`, `Warm · Passive A`, `Warm · Do-not-market`. A recruiter "labels" someone by adding them to the card, the same motion as today's MPC buckets. Touches are logged on the person as usual, never on the Warm card, so active-JO counts stay clean.

| Step | Read | Status |
|---|---|---|
| Find the five cards (and the old MPC buckets) | `GET jobs?statuses=f813eba0-9d99-4c7a-43c8-90b4afefdc08&fields=Id,JobNum,Name,SalesWorkflowItemStatusId` | **Verified** (crelate-in-claude.md; used by `workshop/workforce/recruiting-board.ts`) |
| Who is on each card, who added them, when | `GET jobs/<jobId>/contacts/history?created_after=<ISO date>` | **Verified** endpoint. That an "added" shows as a history row is an assumption: Q confirms on the first read. Fallback `GET jobs/<jobId>/contacts` is **UNVERIFIED** |
| Last touch per person | `GET activities?verb_ids=<RP, MP, Screen, Set Call, Resume, PTC, Submittal, FTI>&when_after=<ISO date>` | **Verified** (verb ids from the 21 Oct pipeline cleanup) |
| Recent screens with no label | the same `activities` read with the Screen verb only | **Verified** |
| Look up a name Kev or a recruiter mentions | `GET contacts/search?query=First%20Last` | **Verified** |
| In process (Casey's lane) | `jobs?statuses=<four active columns>` then each job's `contacts/history` | **Verified** |

Cost: about 10 minutes of Nick's time once, and one click per person for recruiters. Risk: the Warm cards sit with the other buckets; naming them "Warm · ..." keeps them together.

### Version B: Crelate tags (switch to it once Q verifies the read)

Recruiters apply the same five names as **tags** on the contact record. One click, visible on the record, closest to what you asked for.

| Step | Read | Status |
|---|---|---|
| People with a tag | `GET contacts?tags=<tag>` or a `Tags` field on contact records, or a tags list endpoint | **UNVERIFIED** (no tag read has been tried with our key) |
| Last touch, screens, in process | as Version A | **Verified** |

Q's check: one read-only GET with the key against a test contact Kev tags by hand. If it returns the tag, we switch: recruiters tag instead of adding to a card, and Nick retires the Warm cards after one overlap week.

### Version C: note keywords (adds the "why", later)

The first line of a Crelate note starts with the label and a reason: `MPC: 15 yrs ground-up high-rise, open to Miami`, `Follow-up 14: bonus pays 15 Nov, call after`. Ember reads the reason into the list's "Why they matter" column and can find "great candidate, no fit yet" notes on its own.

| Step | Read | Status |
|---|---|---|
| Note text | `GET activities` with the Note activity type and its body field | **UNVERIFIED** (Note verb id and body field unknown) |
| Single contact, limited fields | `GET contacts/<id>?fields=...` | **UNVERIFIED** |
| Email and call touches | their activity type ids | **UNVERIFIED** |

Version C sits on top of A or B; it never replaces the label.

## What Ember does on each label, every weekday

1. 7:15am Pacific read pass (Monday to Friday; never on the Sabbath): the reads above, then the Warm inventory list in `employees/ember/drafts/warm-inventory/<date>.md` (name, title and company, last touch, why they matter, next touch due, owner; no comp, contact details, health or EEO data).
2. Touch due: one Team Hub ask to the owner recruiter, mirrored as a Command Center ticket, at most 2 of the 3-per-person cap a day so Casey always has room.
3. MPC past 60 days with no touch: one red ticket to Radar for your decision (touch this week, re-tag Passive A, or drop the tag).
4. Monday: 3 to 5 MPCs to take to market, with target client types and companies from Scout's market maps and an anonymous blurb drafted for your review. Never sent by Ember.

## What never happens

- Ember never writes to Crelate: no tag, note, card, stage move or edit. Every label is applied by a person.
- Ember never sends, books, spends or publishes, and never names a discreet client (Baker is "Client · discreet").
- Ember never posts about someone in process: that is Casey's list.

## Next steps once you say yes

| Step | Owner | When |
|---|---|---|
| Create the five Warm cards in Leads / Buckets | Nick | The day you say yes |
| Tell the team the five labels at the next JO meeting (one slide) | Radar, Jenny builds | Next JO meeting |
| First Version A read; confirm "added" shows in history | Q, read-only | The day after the cards exist |
| Turn on Ember's two routines (weekdays 7:15am; Monday picks) | Radar | After the first clean read |
| Tag-read check for Version B | Q, one GET | Within two weeks |
