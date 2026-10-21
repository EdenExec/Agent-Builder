# Dean: the three people benches (spec, 21 Oct 2026)

Result: three benches, one data feed, one rule. Every card shows a trend and a next rep, never a verdict. Kev and Nick discuss scorecards in person; the bench is prep, not the conversation. Assumptions marked (A). All numbers below are labelled examples, not live data.

## 1. Recruiting floor (coaching bench)

**Org chart (A: no reporting lines are written down anywhere in the repo; Kev to confirm).**

| Level | Who | Note |
|---|---|---|
| Founder | Kev Williams | Runs the Round Table and Headhunter Training |
| Operations | Nick Leckwold | Human side of scorecards, accounts, Crelate portal |
| Headhunters | Max Betcher, Evan MacArthur, Noah Fields, Andrew Johnson (Juicy), Bridger Stainbrook | Bridger is remote (Zoom) |
| Incoming | Kyle Cockell, Boise recruiter | Ghost card, not yet started; see bench 2 |

Kev and Nick get cards at the bottom of the scorecard, as on the Friday pack. Kunji appears in Radar's people file but not on the Round Table pack: not shown until Kev says.

**Person card, at a glance (the front of the desk tile)**

| Element | What it shows |
|---|---|
| Name, role, status dot | Light: green, amber or red (rules below) |
| This week | RPs against 75, RP days at 15 or more (x/5), example "62 / 75, 3 of 5 days" |
| Sparkline | Weekly RPs for the prior 4 weeks plus this one, standard line at 75 |
| Active JOs | Count only, from the Hub |
| Next deliverable | One line and due date |
| Pillar focus | One pillar name |

**On click (the drawer)**

| Section | Content |
|---|---|
| Scoreboard row | RPs, MPs, JOs, resumes, screens, PTCs, submittals, FTIs, referrals, LVMs; this week, last week, 4-week average, direction arrow |
| JO list | Role, location, role_on_job, days on the job (flags past 14 days, per Kev's Job Orders rule). Client names stay in the Hub: discreet JOs show as "JO" with a link, per the brief |
| 42-box card | Boxes of 42 (win is 38 or more), burn-out number as a work-load signal only, never interpreted, no reason written |
| Deliverables | Open and done, with due dates |
| Last coaching note | Win, one change, ask. Work only |
| Pillar | The pillar chosen on the card, and whether the numbers support it |
| Eden University | Track, next module, certifications signed |

**Light rules (A: Kev to tune; all rules compare to the standard, never to another person)**

| Light | Trigger |
|---|---|
| Green | 75 RPs or the week on pace by the day (15 a day), no overdue deliverable |
| Amber | Any one: RPs under 75 for the first week; under 15 on 2 or more days in the week; a deliverable due within 2 days with no update; 42-box card not in by 1:00 Friday; a JO assignment past 14 days |
| Red | Any one: RPs under 75 two weeks running; a deliverable overdue; RPs under 75 and PTCs or submittals at zero for the week |

A call not logged does not count, so amber can mean logging, not effort. Every figure says "per Crelate". Partial weeks show "partial" and never trigger red; a failed pull shows grey "no data". Kev and Nick's cards carry no light until Kev sets their standards (A).

**Deliverables (A):** the Friday 42-box card by 1:00, the Wednesday takeaway after Headhunter Training, JO lead sheets for any JO they lead, and any Kev- or Nick-assigned item. Source is a small `deliverables` list written by Dean; Kev adds items by ticket.

## 2. Hiring depth chart (onboarding ramp)

A board of columns, one row per person. Cards move right only when a named check is met and signed in person by Kev or Nick.

| Stage | What moves them in |
|---|---|
| Offer signed | Kev and Nick GO on the pre-start gate (Pillar scorecard average 3.5 or more, no pillar under 3, no red flag on Righteousness, Accountability, Transparency, no reference concern) (A) |
| Pre-start | Accounts checklist done (Nick); day-one page ready; start date set |
| Week 1 | Crelate certified, every activity logged, Power Hours shadowed, Pillars and Must-Dos read |
| Day 30 | Standard track: 15 RPs a day for 2 weeks, first screens and PTCs logged, first submittal. Accelerated: one solo JO intake and 3 submittals out |
| Day 60 | Owns a search's depth chart; client prep for FTIs |
| Day 90 | Building their own book; early review set in person |
| Certified | "Ready to own a search" signed; trend, not one week, decides |

**Kyle Cockell, first row (all dates A, from `projects/workforce/kyle-cockell-prestart.md`):** pre-start vet Wed 21 to Fri 30 Oct; start Mon 2 Nov unconfirmed; accelerated ramp with four checkpoints (Systems Fri 6 Nov, Pace Fri 13 Nov, Solo craft Fri 20 Nov, Day 30 Tue 1 Dec). Speed measures logged on the Friday scorecard: days to first 75-RP week, first PTC, first submittal, first FTI. Accelerated rows show checkpoints in place of the 60 and 90 columns.

Each row shows stage, next checkpoint and date, and evidence status (met / pending / missed). The Office never shows assessment results, interview scores, stipend or offer terms; those stay in the pre-start doc.

**Eden's own recruiting pipeline:** none is on record. The board has an empty "Candidates for Eden" lane (A) holding first name, stage and next step only, filled when Kev names a hire. Names held in Crelate stay in Crelate.

## 3. Eden University bench

| Layer | State today |
|---|---|
| Tracks | New recruiter (90 days) outlined in the playbook; Accelerated (Kyle) drafted in the pre-start doc; Senior recruiter and Business development planned |
| Modules | Planned first three: the RP, the PTC, the submittal. Nothing built yet (`projects/workforce/eden-university/` does not exist). Each module is one page: outcome, why, drill, check, source |
| Wednesday Headhunter Training | Training log (date, two concepts, ice breaker, takeaways) to be started; draft lands Tuesday 5pm, Radar builds the pages, Dean turns each session into a module within the week |
| Certifications | Crelate certified, Submittal certified, Ready to own a search (5 to 10 observable lines each, signed in person with date only) |

Bench view: a built / drafting / planned bar on top, then three tiles: Library (tracks and modules with badges), Wednesday (next session, last takeaways, a topic suggested from the trends for Kev to pick) and a Certification grid (person by certification, dot = signed date or open).

## 4. Data: source, cadence, who writes

| Field | Source | Refresh | Writer |
|---|---|---|---|
| RPs, MPs, JOs, resumes, screens, PTCs, submittals, FTIs, referrals, LVMs | Crelate API v3, read-only GET, verb IDs in `crelate-scorecard-spec.md` | Friday full pull (stamp "Crelate as of Fri time PT"); optional Dean midweek partial, marked partial | Dean, via Radar's `ArtifactData` write |
| Weekly rows, 4-week average, direction, sparkline | `projects/workforce/scorecard-trend.md` (starts week of 19 Oct; 12 Oct baseline is partial) | Friday | Dean |
| Active JOs, role_on_job, days on job | Hub `jobs/{id}` (team[]) | Daily read | Radar or Q sync; Dean reads only |
| 42-box card, burn-out, pillar chosen | Eden Desk `data/users/<id>/sc-<Monday>` | Friday after 1:00 | Radar reads, Dean summarises |
| Coaching note | `projects/workforce/coaching/<name>.md` | Weekly, after the pull | Dean |
| Deliverables | `deliverables` list in the Office DB | On change | Dean; Kev by ticket |
| Ramp stage, checkpoints | New-hire packet files | On change | Dean drafts; Kev or Nick sign off in person |
| Certifications | Sign-off date from Kev or Nick | On sign-off | Dean records the date only |
| University build status | `projects/workforce/eden-university/` | Weekly | Dean |

The Office page writes only tickets and "seen" marks. Light colour is computed from the stored numbers, with the rule version shown on hover. Dean writes no value he cannot paste a count for this session.

## 5. Privacy

- **Never on any surface:** pay, commission, split, bonus, fees per person; health, family, age; reasons for a burn-out number; candidate contact details; client names (Hub only).
- **Coaching notes:** work only (numbers, win, one change, pillar, a question). Anything personal reads "Kev to discuss in person" and nothing more. Notes are Kev's prep; they are never sent to the recruiter by the Office.
- **Screen-share switch** hides the whole coaching bench: org chart cards, drawers and the depth chart. Eden University stays visible, since it carries no person data in its library view; its certification grid hides with the switch (A).
- **No individual review invites.** The Office offers no "schedule a review" lever. Scorecards are discussed at the Round Table and in Kev's one-to-ones.
- Keys: `CRELATE_API_KEY` stays in the environment, never in the page.

## Asks for Kev (recommendation first)

1. Confirm reporting lines: recruiters to Kev, with Nick as operations lead (A). Silence: the chart ships as shown.
2. Confirm the amber and red rules, especially "under 75 two weeks running". Silence: they ship as proposed.
3. Kyle's start date and a yes or no on about $75 to $80 of assessments (already queued in his pre-start doc). Silence: the ramp dates stay as proposals.
