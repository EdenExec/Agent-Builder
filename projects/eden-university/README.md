---
title: Eden University · tracks
subtitle: Index of every track, the track.json shape and how progress is tracked
author: Dean
date: 2026-10-29
cover: false
---

## Executive summary

Eden University holds five tracks today: one for new recruiters and four for interns. Each is a folder with the same files, so Q's page can load any of them and a recruit can see where they are.

Kev, 29 Oct 2026: "The recruits should be able to track progress on moving through the onboarding and job learning flow."

- **Five tracks, 130 modules.** Every module has a goal, click-path steps, a 2-minute proof, a time and a checker.
- **Bridger supervises the interns** (Kev, 27 Oct) and runs each from its `bridger-runbook.md` without help from Kev or Radar.
- **Every step that needs a person or a spend** is marked and listed in `intern-gaps.md` (interns) or `stand-up-your-desk/gaps.md` (recruiters).

| Track id | Who | Weeks | Modules | Time on modules | Checker values |
|---|---|---|---|---|---|
| `recruiter-desk` | New recruiter (stand-up-your-desk) | 13 | 27 | 15 h 30 | nick, kev, self |
| `intern-comms` | Brand and Communications Intern (Jenny's role) | 8 | 25 | 16 h 55 | bridger, jenny, self |
| `intern-sales` | Sales Intern, Jr. Headhunter (Pathway B) | 12 | 27 | 18 h 35 | bridger, self |
| `intern-ops` | Operations Intern (Pathway A) | 12 | 28 | 19 h 00 | bridger, self |
| `intern-marketing` | Marketing Intern (Pathway D, design half) | 8 | 23 | 17 h 45 | bridger, jenny, self |

**How the Boise pathways map (one line):** Jenny's Brand and Communications Intern is Pathway D narrowed to LinkedIn, capture and video (`intern-comms`); `intern-marketing` is D's design, decks and brand-asset half; Pathway C (Client Success) has no track yet (gap IG27).

<!-- pagebreak -->

## Files in every track folder

| File | For | What it is |
|---|---|---|
| `job.md` | Kev, Docket, the posting | The cleaned job description with "current students" wording and the lines Docket must clear |
| `course.md` | The recruit | The flow: Day 1, Week 1, Weeks 2 to 4, Weeks 5 to 8 (or 12). Each module has a goal, click-path steps, a 2-minute proof, minutes and a checker |
| `bridger-runbook.md` | Bridger | Before Day 1, the welcome message, the weekly rhythm, sign-off, "behind", escalation, the end review, gaps |
| `day-1-checklist.md` | The recruit, printed | One page. Holds no secrets |
| `track.json` | Q's page | Machine-readable course |
| `progress-sheet.csv` | Bridger | One row per module: import into Google Sheets for the recruit |

## track.json shape

```
{"id","title","audience","supervisor","weeks",
 "phases":[{"id","title","weekFrom","weekTo"}],
 "modules":[{"id":"M01","phase":"<phase id>","title","goal","steps":["..."],
             "proof","minutes":N,"checker":"bridger|jenny|self","link":"<repo path or URL or null>"}]}
```

Intern tracks carry `"supervisor":"Bridger"`. The recruiter track carries `"supervisor":"Nick"` and checkers nick, kev or self. Every `link` is a repo path or a URL; the repo path is the module's primary source.

## How progress is tracked

| Stage | What happens | Owner | Status |
|---|---|---|---|
| 1 Now | Bridger imports `progress-sheet.csv` into a Google Sheet named "Progress Sheet · First Last", shares it with the recruit as Editor. The recruit sets "proof in"; the checker sets "signed off" with initials and a date | Bridger | Ready |
| 2 Next | Q's page loads `track.json` and shows the phases, the modules and a progress bar | Q | Not built |
| 3 Later | Progress is stored per person. Suggested record: `university/progress/{trackId}/{userId}` with `modules: {M01: {status, proofNote, signedBy, signedOn}}`. Statuses: not started, in progress, proof in, signed off, redo, waiting on gap | Q | Suggestion only |

Proofs never hold a password, code, candidate or client detail, or anything about pay, health, family or age. A page that shows progress shows module IDs and dates only.

## Rules every track follows

| Rule | Where it comes from |
|---|---|
| Credentials are only "your own login" | Kev's rule; Docket's compliance training |
| Interns never send, post, spend or touch a shared record without the approval step in their playbook | Jenny's playbook; Kev's rule of 13 Oct |
| A discreet client is "Client · discreet" | `projects/recruiter-desk/claude-standards-prompt.md` |
| Pay is "per your offer letter". No rate, bonus or commission figure appears in any track | Kev, 27 Oct (base rate left blank) |
| Anything not confirmed in an Eden file is marked UNVERIFIED | Dean's skill: eden-university.md |
