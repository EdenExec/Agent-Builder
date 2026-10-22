---
title: Pipeline cleanup, proposed
subtitle: One active job per real opportunity, from the live Crelate board
org: epg
author: Q
date: 2026-10-21
---

## Executive summary

**The four working columns hold 58 cards; 32 stay as active JOs, 10 are duplicates, and 16 are buckets or dormant lists.** Three Triton cards promoted out of Build Leads bring the board to **35 active JOs**, one per client and role. Nothing was written to Crelate.

- **Cards now vs active JOs:** 58 cards become 32 kept, 10 merged, 16 moved to Leads / Buckets. Counting the cards just outside the four columns, the full move list is 17 merges, 22 moves to Leads / Buckets, 3 promotions, 1 to Client Portals and 1 to Filled.
- **Why the numbers divide badly:** in 8 weeks only 23% of RPs landed on a card in the four working columns, 20% on Leads / Buckets, and 21% on no job at all. Triton alone got 133 RPs in 14 days across 10 cards.
- **The by-JO Friday scorecard is buildable now.** The API returns RPs, resumes, PTCs and FTIs per job per week, and its counts matched my own pull exactly. It needs 3 habits to be true: every activity names a job, PTC and FTI go on the role JO (not the portal), and merged cards roll up to one survivor.

Kev, 21 Oct 2026: "keep the recruiting pipeline as clean as possible, only active JOs should land in the columns here... the lead buckets can go in these sections."

## Ten moves that matter most

| # | Move | Cards | Effect |
|---|---|---|---|
| 1 | Triton APM and PM search becomes one JO | Promote #8868 to RETAINED; merge #8804 and #8807 into it | Max, Bridger, Evan, Nick and Kevin's 59 RPs (14 days) log on one row |
| 2 | Triton Project Engineers becomes one JO | Promote #8784; merge #8800 and #8802 | Evan's PE cards stop splitting the count |
| 3 | PB South APMs and PEs becomes one JO | Merge #7970 and #8869 into #6182 | Three cards become one |
| 4 | PB South General Superintendents | Merge #7943 and #7463 into #7979 | Three cards become one |
| 5 | PB South Project Executive | Merge Miami PX #8066 into #8067 | Two cards become one (Q2) |
| 6 | PB South Project Managers | Merge #6763 into #7931 | Reassign owner from Brandon (Q6) |
| 7 | Megawatt Project Managers | Merge PM 2 #7464 and Reno #7901 into #7306 | 501 people move to one pipeline |
| 8 | Megawatt MEP Managers | Merge #7304 into #6684 | Same name on two cards today |
| 9 | Cards named Bucket, Refresh or MPCs leave the job columns | #8060, #7807, #7826, #7315, #6005, #8047 to Leads / Buckets | Six non-jobs out of RETAINED-to-Typical |
| 10 | Dormant Megawatt cards (Q7) | #7867, #8041, #7842, #7224, #8054, #7204, #7891, #7903 to Leads / Buckets | Eight cards with no recent RPs out of TOP and Typical |

## 1. What I read, and how

| Question | Answer |
|---|---|
| Source | Crelate API v3, read-only (GET only), pulled 2026-10-21 about 2:25 pm Pacific. This file is a copy: Crelate stays the system of record. |
| Which field is the board column? | `SalesWorkflowItemStatusId`. Its counts match your screenshot exactly: RETAINED 19, TOP 19, GO NOW 5, Typical 15. |
| Clients | Most cards carry no client record (790 of 945 jobs have `AccountId` empty), so I grouped by the client named in the card title. |
| Activity | Last 8 weeks (24 Aug to 21 Oct) of RP, Resume, PTC, FTI, Submittal & Files, MP, Screen, Set Call, Interview/Meeting and Deal: 3,522 rows, ids and dates only. |
| Left out | No message text, no comp or fee fields, no phones, no candidate names. People are counted, never named. |

Statuses on the board that your screenshot shows, and ones it does not:

| Status | Cards | In screenshot |
|---|---|---|
| Special Projects & Searches | 443 | yes |
| Leads / Buckets | 64 | yes |
| Biz Dev Targets | 46 | yes |
| RETAINED / TOP / GO NOW / Typical | 19 / 19 / 5 / 15 | yes |
| Client Portals / Filled | 11 / 12 | yes |
| Outside Splits | 0 | yes, no cards in it |
| Closed Job Orders / Lost / Client T.O. or Background | 115 / 58 / 52 | no |
| Recruiter Pipelines | 67 (50 have no name) | no |
| Build Leads | 15 | no |
| Active Searches / CAN'T DELETE | 2 / 2 | no |

## 2. The rules I applied

| Rule | Result |
|---|---|
| Named bucket, refresh, dump, list, MPCs, pool, or recruiter-named ("Max-", "Bridger -") | MOVE to Leads / Buckets |
| Same client and role as another card, even with a recruiter name or location added | MERGE into the card with the most history; location variants flagged (Q2) |
| No RP, resume, PTC or FTI in 8 weeks, on a TOP, GO NOW or Typical card | Recommend Leads / Buckets and flag (Q7); RETAINED cards never move on activity alone |
| Placed or closed | MOVE to Filled; no card in the four columns has a placement recorded, so none moves |
| Anything else | KEEP, renamed `Client - Role` with no recruiter name and no date |

How a merge is done later: add the duplicate's people to the surviving JO at the same stage, then close the duplicate. Past activity stays on the old card, so the scorecard rolls merged cards up to their survivor (section 7).

## 3. Cards now vs active JOs

| Column | Cards now | KEEP | MERGE | To Leads / Buckets |
|---|---|---|---|---|
| RETAINED (1) | 19 | 16 | 3 | 0 |
| TOP Priority (2) | 19 | 9 | 3 | 7 |
| GO NOW (3) | 5 | 3 | 0 | 2 |
| Typical (4) | 15 | 4 | 4 | 7 |
| **Four columns** | **58** | **32** | **10** | **16** |
| Build Leads (off screenshot) | 15 | 3 promoted to RETAINED | 6 | 5 (+1 to Client Portals) |
| Special Projects | 1 card touched | 0 | 0 | 1 |

By client, the proposed active JOs: **PB South 14**, **Triton 6**, **Megawatt 7** (from 23 cards), **other clients 8**.

## 4. Where the RPs actually land today

8 weeks of RPs (2,643 total), by the status of the card they were logged against:

| Landing zone | RPs | Share |
|---|---|---|
| No job attached | 554 | 21% |
| Leads / Buckets | 516 | 20% |
| RETAINED (1) | 358 | 14% |
| Recruiter Pipelines | 286 | 11% |
| Build Leads | 208 | 8% |
| Special Projects & Searches | 160 | 6% |
| TOP Priority (2) | 142 | 5% |
| Client Portals | 112 | 4% |

- **PTCs and FTIs follow the portals.** 44 of 168 PTCs and 34 of 76 FTIs were logged on Client Portal cards, not the role JO (Q10).
- **No job at all:** 21% of RPs, 26% of resumes, 8% of PTCs, 8% of FTIs have no job attached, so no by-JO report can count them.

<!-- pagebreak -->

## 5. Proposed active JOs and every card

Columns: **People** is the number of contacts in the card's pipeline. **8wk** is RP / Resume / PTC / FTI over 24 Aug to 21 Oct. **RP 14d** is RPs since 7 Oct. Col: RET, TOP, GO, TYP are the four columns; BL is Build Leads; LB is Leads / Buckets; SP is Special Projects.

### 5a. PB South (14 active JOs from 21 cards)

| # | Card now | Col | Owner | People | 8wk RP/Res/PTC/FTI | RP 14d | Action | Why |
|---|---|---|---|---|---|---|---|---|
| 7934 | PB South - Assistant Superintendents - Project X or WPB | RET | Brandon | 307 | 38/3/1/0 | 13 | KEEP as **PB South - Assistant Superintendents** | Owner Brandon has no activity in 8 weeks; Evan and Andrew work it (Q6) |
| 5278 | PB South - City Place Supers | RET | Kevin | 407 | 30/1/1/2 | 4 | KEEP as **PB South - City Place Superintendents** | Project-specific, 30 RPs in 8 weeks |
| 8864 | PB South - Controller - Propject X | RET | Noah | 4 | 1/0/1/0 | 1 | KEEP as **PB South - Controller** | Typo in name ("Propject") |
| 8042 | PB South - Director of Precon | RET | Evan,Nick | 98 | 2/0/0/0 | 0 | KEEP as **PB South - Director of Precon** | Retained; quiet for 14 days |
| 7979 | PB South - Gen/Sr Super 7/23 | RET | Nick | 50 | 9/0/0/0 | 0 | KEEP as **PB South - General / Senior Superintendents** | Survivor: most RPs of the three general-super cards (Q2) |
| 8409 | PB South - MEP Supers | RET | Nick | 56 | 41/1/1/1 | 6 | KEEP as **PB South - MEP Superintendents** | Busiest PB South card (41 RPs in 8 weeks) (Q3) |
| 8410 | PB South - Phillips Lobby | RET | Nick | 7 | 3/0/1/1 | 1 | KEEP as **PB South - Phillips Lobby** | Tiny; project order or part of City Place? (Q3) |
| 8067 | PB South - Project Executive - Project X | RET | Nick | 4 | 2/0/0/0 | 1 | KEEP as **PB South - Project Executive** | Survivor of the two PX cards (Q2) |
| 6182 | PB South APMs and PEs | RET | Nick | 139 | 8/0/2/0 | 4 | KEEP as **PB South - APMs and PEs** | Survivor of the APM and PE cards (Q1) |
| 8806 | PB South- Cost Engineer - Project X | RET | Evan | 2 | 0/1/0/0 | 0 | KEEP as **PB South - Cost Engineer** | Max's bucket for this role stays a bucket |
| 8781 | PB South- Field Engineers EVAN | RET | Evan | 132 | 33/1/0/0 | 7 | KEEP as **PB South - Field Engineers** | Rename: drop "EVAN" from the card name |
| 7931 | PB South- PM's - Project X or WPB | RET | Brandon | 307 | 42/1/0/0 | 4 | KEEP as **PB South - Project Managers** | Owner Brandon has no activity in 8 weeks; Evan works it (Q6) |
| 8810 | PB South- Safety Manager - Project X | RET | Evan | 67 | 8/1/3/0 | 8 | KEEP as **PB South - Safety Manager** |  |
| 7463 | PB South - General 2 | RET | Nick | 108 | 3/0/0/0 | 1 | MERGE into #7979 (PB South - General / Senior Superintendents) | "General 2" duplicate |
| 7970 | PB South- APM | RET | Evan | 8 | 0/0/0/0 | 0 | MERGE into #6182 (PB South - APMs and PEs) | APM card, zero activity in 8 weeks (Q1) |
| 7943 | PB SOUTH- General Super - WPB | RET | Evan | 89 | 4/0/1/0 | 2 | MERGE into #7979 (PB South - General / Senior Superintendents) | WPB variant of the same role (Q2) |
| 8049 | PB South: Estimators | TOP | Andrew | 19 | 1/0/0/0 | 0 | KEEP as **PB South - Estimators** | 1 RP in 8 weeks; keep while the order is open |
| 6763 | PB South - PMs and APMs 2 | TOP | Admin | 49 | 0/0/0/0 | 0 | MERGE into #7931 (PB South - Project Managers) | "PMs and APMs 2", no activity in 8 weeks |
| 8066 | PB South- Miami PX | TOP | Evan | 109 | 12/1/0/0 | 1 | MERGE into #8067 (PB South - Project Executive) | "Miami PX": same role; confirm it is not a second project (Q2) |
| 8869 | PB South- Project Engineers | BL | Evan | 3 | 2/0/0/0 | 2 | MERGE into #6182 (PB South - APMs and PEs) | Evan's PE card created 19 Oct (3 people) (Q1) |
| 8787 | PB South MEP Superintendent - NKF 9/22/26 | LB | Noah | 45 | 21/2/0/0 | 5 | MERGE into #8409 (PB South - MEP Superintendents) | Sits in Leads / Buckets but named like a client order (NKF 9/22); 5 RPs in 14 days (Q3) |

### 5b. Triton (6 active JOs from 12 cards)

Kev's example: "Triton's APM search - Evan and Max's RPs should get logged there." The APM and PM search is spread across #8868, #8804 and #8807 today. I propose #8868 as the one JO.

| # | Card now | Col | Owner | People | 8wk RP/Res/PTC/FTI | RP 14d | Action | Why |
|---|---|---|---|---|---|---|---|---|
| 8788 | Triton - Purchasing + Procurement | RET | Max | 313 | 120/10/6/0 | 45 | KEEP as **Triton - Purchasing + Procurement** | Max logged 44 RPs here in 14 days; check they are Purchasing (Q4) |
| 8424 | Triton Construction - MEP Super/Engineer | RET | Admin | 47 | 9/0/1/0 | 8 | KEEP as **Triton - MEP Superintendent / Engineer** |  |
| 8415 | Triton Construction - Miami Super | RET | Nick | 82 | 5/0/0/0 | 3 | KEEP as **Triton - Miami Superintendent** | (Q2) |
| 8784 | Triton - Project Engineers EVAN | BL | Evan | 102 | 37/2/0/0 | 5 | KEEP as **Triton - Project Engineers** | PROMOTE from Build Leads to RETAINED. Rename: drop "EVAN" (Q5) |
| 8801 | Triton Construction - Curtain Wall Engineer/ Asst Super | BL | Nick | 1 | 1/0/1/0 | 0 | KEEP as **Triton - Curtain Wall Engineer / Asst Super** | PROMOTE from Build Leads; no activity since 29 Sep, confirm it is a live order (Q5) |
| 8868 | Triton Construction Company - PM and Sr. PM - Miami | BL | Kevin | 347 | 59/0/0/0 | 59 | KEEP as **Triton - APMs and PMs** | PROMOTE from Build Leads to RETAINED. Kev's APM search: 59 RPs in 14 days from 5 recruiters, account-linked (Q5) |
| 8796 | Triton Construction - General Superintendent | BL | Nick | 1 | 2/0/0/0 | 1 | MERGE into #8415 (Triton - Miami Superintendent) | "General Superintendent" card, 1 person, 2 RPs in 8 weeks (Q2) |
| 8800 | Triton Construction - Project Engineer | BL | Nick | 7 | 3/1/5/1 | 1 | MERGE into #8784 (Triton - Project Engineers) | Same role |
| 8804 | Triton- APM & PMs | BL | Evan | 115 | 40/2/1/0 | 5 | MERGE into #8868 (Triton - APMs and PMs) | Evan's "APM & PMs" card (Q5) |
| 8807 | Triton- PM and Sr. PM - WPB | BL | Evan | 15 | 0/0/1/0 | 0 | MERGE into #8868 (Triton - APMs and PMs) | Evan's "PM and Sr. PM - WPB": a second market? confirm (Q2) |
| 8802 | Triton- Project Engineer NEW YORK RELO: EVAN | BL | Evan | 0 | 0/0/0/0 | 0 | MERGE into #8784 (Triton - Project Engineers) | New York relocation variant; empty pipeline (Q2) |
| 8785 | Bridger's Triton Pipeline | SP | Bridger | 50 | 11/0/0/0 | 3 | MOVE to Leads / Buckets | "Bridger's Triton Pipeline": personal pipeline, 11 RPs in 4 weeks |

### 5c. Megawatt (7 active JOs from 23 cards)

Megawatt has 23 cards in the four columns and logged 13 RPs across all of them in 14 days. Most of it is dormant or bucket-shaped.

| # | Card now | Col | Owner | People | 8wk RP/Res/PTC/FTI | RP 14d | Action | Why |
|---|---|---|---|---|---|---|---|---|
| 7843 | Megawatt - Low Voltage PM | TOP | Nick | 569 | 25/0/0/0 | 2 | KEEP as **Megawatt - Low Voltage PMs** | 569 people in the pipeline |
| 7953 | Megawatt - MEP - Nor CAL | TOP | Ryan | 26 | 4/0/1/0 | 3 | KEEP as **Megawatt - MEP Nor Cal** | Live (3 RPs in 14 days) but is it separate from MEP Managers? Owner Ryan (Q7) |
| 7306 | Megawatt - PMs | TOP | Nick | 45 | 6/0/0/0 | 1 | KEEP as **Megawatt - Project Managers** | Survivor of the PM cards |
| 7303 | Megawatt - Project Exec/ Director of PMO | TOP | Nick | 385 | 3/0/0/0 | 0 | KEEP as **Megawatt - Project Executive / Director of PMO** | 3 RPs in 8 weeks, none in 14 days (Q7) |
| 7305 | Megawatt - Supers | TOP | Nick | 159 | 8/0/0/0 | 1 | KEEP as **Megawatt - Superintendents** | Only MW card linked to the client record |
| 7892 | Megawatt Low Voltage PM's- Texas | TOP | Brandon | 78 | 0/0/0/0 | 0 | MERGE into #7843 (Megawatt - Low Voltage PMs) | Texas variant, zero activity in 8 weeks |
| 8041 | Megawatt - Bay Area Electrical | TOP | Nick | 24 | 0/0/0/0 | 0 | MOVE to Leads / Buckets | Bay Area Electrical: zero activity since 22 Sep (Q7) |
| 7842 | Megawatt - Low Voltage GF | TOP | Nick | 64 | 1/0/0/0 | 0 | MOVE to Leads / Buckets | Low Voltage GF: 1 RP in 8 weeks (Q7) |
| 8060 | Megawatt - MPC Bucket | TOP | Nick | 5 | 0/0/2/0 | 0 | MOVE to Leads / Buckets | Named "MPC Bucket" |
| 7224 | Megawatt - PST and MT | TOP | Nick | 62 | 0/0/0/0 | 0 | MOVE to Leads / Buckets | PST and MT: zero activity in 8 weeks; acronyms not defined in our sources (Q7) |
| 8054 | Megawatt - VP of Texas | TOP | Nick | 2 | 0/0/0/0 | 0 | MOVE to Leads / Buckets | VP of Texas: zero activity in 8 weeks (Q7) |
| 7867 | MW Low Volt Executives | TOP | Brandon | 39 | 0/0/0/0 | 0 | MOVE to Leads / Buckets | Low Volt Executives: zero activity since 28 Sep; owner Brandon (Q7) |
| 6684 | Megawatt - MEP Managers | GO | Nick | 10 | 0/0/0/0 | 0 | KEEP as **Megawatt - MEP Managers** | Survivor of the two identical MEP Managers cards |
| 7364 | Megawatt - Asst Supers | TYP | Nick | 564 | 1/0/0/0 | 1 | KEEP as **Megawatt - Assistant Superintendents** | 1 RP in 8 weeks (Q7) |
| 7304 | Megawatt - MEP Managers | TYP | Nick | 73 | 3/0/0/0 | 1 | MERGE into #6684 (Megawatt - MEP Managers) | Exact duplicate name, different column |
| 7464 | Megawatt - PM 2 | TYP | Nick | 472 | 2/0/0/0 | 0 | MERGE into #7306 (Megawatt - Project Managers) | "PM 2" duplicate (472 people in it) |
| 7901 | Megawatt PM's RENO | TYP | Brandon | 29 | 4/0/0/0 | 2 | MERGE into #7306 (Megawatt - Project Managers) | Reno variant (Q2) |
| 7866 | MW Supers (EV) | TYP | Brandon | 136 | 4/0/0/0 | 1 | MERGE into #7305 (Megawatt - Superintendents) | "MW Supers (EV)" duplicate |
| 7204 | Megawatt - ET and CT Talent | TYP | Nick | 79 | 4/0/1/1 | 0 | MOVE to Leads / Buckets | ET and CT Talent: none in 14 days; acronyms not defined in our sources (Q7) |
| 7826 | Megawatt - PM Refresh | TYP | Nick | 572 | 7/0/0/0 | 0 | MOVE to Leads / Buckets | "PM Refresh" |
| 7807 | Megawatt - Precon Bucket | TYP | Nick | 109 | 2/0/0/0 | 1 | MOVE to Leads / Buckets | Named "Precon Bucket" |
| 7903 | Megawatt- Safety Manager Reno | TYP | Brandon | 70 | 0/0/0/0 | 0 | MOVE to Leads / Buckets | Safety Manager Reno: zero activity in 8 weeks (merge into 7891 if live) (Q7) |
| 7891 | Megwatt- Safety Managers | TYP | Brandon | 94 | 1/1/0/0 | 0 | MOVE to Leads / Buckets | Safety Managers: 1 RP in 8 weeks. If it is live, this is the survivor (Q7) |

### 5d. Other clients

| # | Card now | Col | Owner | People | 8wk RP/Res/PTC/FTI | RP 14d | Action | Why |
|---|---|---|---|---|---|---|---|---|
| 8426 | Baker - INL Safety Managers - NKF 9/22/26 | TOP | Noah | 57 | 18/6/5/1 | 8 | KEEP as **Baker - INL Safety Managers** | Drop the "NKF 9/22/26" date from the name |
| 8425 | Promethean - Lake Placid PM | TOP | Bridger | 360 | 19/1/0/0 | 1 | KEEP as **Promethean - Lake Placid PM** | 19 RPs in 8 weeks |
| 7890 | VMG APMS | TOP | Max | 430 | 42/4/0/0 | 2 | KEEP as **VMG - APMs** | 42 RPs in 8 weeks |
| 7315 | Pence Kelly - MPC Bucket | TOP | Nick | 52 | 3/0/0/1 | 0 | MOVE to Leads / Buckets | Named "MPC Bucket" |
| 8809 | Hoffman Boise PE's | GO | Bridger | 192 | 26/4/0/0 | 26 | KEEP as **Hoffman - Boise Project Engineers** | Bridger: 26 RPs in 14 days, the one clean example |
| 8045 | VMG - Chief Estimator | GO | Max | 226 | 7/0/1/0 | 1 | KEEP as **VMG - Chief Estimator** |  |
| 6184 | Bay Area PMs | GO | Nick | 95 | 6/1/0/0 | 0 | MOVE to Leads / Buckets | "Bay Area PMs": no client in the name; 0 RPs in 14 days (Q7) |
| 6005 | XL Construction Bay Area Bucket | GO | Admin | 85 | 1/0/0/0 | 0 | MOVE to Leads / Buckets | Named "Bucket"; owner Admin |
| 7788 | Moss - QA/QC Manager | TYP | Nick | 54 | 1/0/1/0 | 0 | KEEP as **Moss - QA/QC Manager** | Bridger's "Stainer - MOSS QC Manager" bucket stays a bucket |
| 8798 | Pence/Kelly Concrete - Layout & VDC | TYP | Admin | 41 | 6/0/0/0 | 5 | KEEP as **Pence/Kelly Concrete - Layout & VDC** | Account-linked, Kevin 5 RPs in 14 days |
| 7946 | VMG- BIM/VDC | TYP | Max | 77 | 0/0/0/0 | 0 | KEEP as **VMG - BIM / VDC** | Zero RPs in 8 weeks but other activity on 19 Oct (Q7) |
| 8047 | Baker - SoFlo MPCs | TYP | Nick | 228 | 29/2/0/0 | 1 | MOVE to Leads / Buckets | "SoFlo MPCs": a list of MPCs; 29 RPs in 8 weeks, 1 in 14 days |
| 8002 | Carmel - FE Stamford | TYP | Nick | 45 | 1/0/0/0 | 0 | MOVE to Leads / Buckets | Carmel FE Stamford: 1 RP in 8 weeks, last activity 22 Sep (Q7) |

### 5e. Build Leads that are not Triton

| # | Card now | Col | Owner | People | 8wk RP/Res/PTC/FTI | RP 14d | Action | Why |
|---|---|---|---|---|---|---|---|---|
| 8867 | Bridger - APMs/PMs WPB | BL | Bridger | 138 | 17/1/0/0 | 17 | MOVE to Leads / Buckets | "Bridger - APMs/PMs WPB": recruiter bucket |
| 8866 | Bridger - Florida FE's | BL | Bridger | 99 | 38/1/0/0 | 38 | MOVE to Leads / Buckets | "Bridger - Florida FE's": recruiter bucket |
| 8865 | Max- PB south APM/PM | BL | Max | 19 | 6/0/0/0 | 6 | MOVE to Leads / Buckets | "Max- PB south APM/PM": recruiter bucket, 6 RPs in 14 days |
| 8863 | Max- PB South- Cost Engineer | BL | Max | 2 | 0/0/0/0 | 0 | MOVE to Leads / Buckets | "Max- PB South- Cost Engineer": recruiter bucket |
| 8862 | MW MPC Bucket | BL | Andrew | 1 | 0/0/0/0 | 0 | MOVE to Leads / Buckets | "MW MPC Bucket" (Andrew) |
| 8870 | MK Marlow - MPC Portal | BL | Nick | 10 | 3/0/0/0 | 3 | MOVE to Client Portals | "MK Marlow - MPC Portal": same pattern as the other portals; move to Client Portals |

### 5f. Client Portals (11), all stay

Portals are client-facing lists, not job orders. They stay in their column. The one change is the habit: PTC and FTI get logged on the role JO.

| # | Card | Owner | People | 8wk RP/Res/PTC/FTI | Placed | Note |
|---|---|---|---|---|---|---|
| 7818 | Hoffman Construction - Hoffman Construction MPC Bucket | Admin | 63 | 20/1/24/30 | 0 | PTCs and FTIs logged here (Q10) |
| 6779 | Megawatt Electrical - MPCs for Review | Kevin,Noah | 81 | 8/0/0/1 | 0 |  |
| 6211 | Moss - MPC Bucket | Admin | 73 | 2/0/1/0 | 1 |  |
| 8412 | Moss MPC Review | Noah | 0 | 0/0/0/0 | 0 |  |
| 7130 | PB South - MPC Bucket (Review) | Kevin | 25 | 3/0/1/0 | 1 |  |
| 3258 | PB South - West Palm, MEP & Precon | Kevin | 143 | 10/2/0/0 | 1 |  |
| 8413 | PB South Interview Pipeline | Noah | 0 | 0/0/0/0 | 0 |  |
| 7468 | Pence Kelly Concrete - MPC for Review - Pence/Kelly Concrete | Admin | 33 | 3/0/1/0 | 0 |  |
| 7462 | Swinerton - MPC's for Review | Admin | 20 | 4/1/0/0 | 0 |  |
| 8805 | Triton Construction Company - MPC Portal | Kevin | 21 | 5/1/9/0 | 0 | PTCs and FTIs logged here (Q10) |
| 7939 | VMG - MPC's | Kevin | 106 | 57/4/8/3 | 0 | PTCs and FTIs logged here (Q10) |

### 5g. Filled (12), all stay

| # | Card | Owner | People | 8wk RP/Res/PTC/FTI | Placed | Note |
|---|---|---|---|---|---|---|
| 7937 | Baker - NQA QC Manager | Nick | 59 | 2/1/0/0 | 0 | Filled with 0 placements (Q11) |
| 361 | Carmel - Los Angeles - PM | Kevin | 247 | 0/0/0/0 | 0 | Filled with 0 placements (Q11) |
| 8782 | Carmel Partners - Director of Cap Ex | Kevin,Max | 106 | 15/3/3/1 | 0 | Filled with 0 placements (Q11) |
| 7507 | Jackson Contracting, WA - Jackson Contracting Bucket 2 | Admin | 139 | 0/0/0/0 | 0 | Filled with 0 placements (Q11) |
| 3443 | PB South - Accountant | Kevin | 47 | 0/0/0/0 | 1 |  |
| 6401 | PB South - Accountant - BPO | Admin | 28 | 0/0/0/0 | 0 | Filled with 0 placements (Q11) |
| 2822 | PB South - Senior Project Manager + Super | Kevin | 132 | 0/0/0/0 | 1 |  |
| 2439 | PENTA - HR - PM/Super | Nida | 20 | 0/0/0/0 | 1 |  |
| 7781 | PENTA - Scheduler - LA | Nick | 153 | 0/0/0/0 | 1 |  |
| 2163 | PENTA Building Group - LA - Superintendent | Nick | 6 | 0/0/0/0 | 0 | Filled with 0 placements (Q11) |
| 7 | PENTA Building Group - Phoenix - Healthcare Superintendent | Kevin | 2 | 0/0/0/0 | 1 |  |
| 4040 | Swinerton - Dallas - Bucket | Kevin | 404 | 0/0/0/0 | 1 |  |

### 5h. Leads / Buckets (64) and Special Projects (443)

- **Leads / Buckets:** all stay. Four cards look like live client orders and need your call (Q8): #8787 (proposed merge into #8409), #8411 VMG MEP PM (7 RPs in 14 days), #7955 VMG Supers DMV, and #8790 Hoffman Boise Supers. One should move out: #4099 The Beck Group Interiors Sr. PM was placed and closed on 28 Jan; move to Filled.
- **Special Projects:** 443 cards, 394 flagged as leads, 275 never touched. Mostly person-named lead records, which is outside this cleanup. 11 cards had RP, resume, PTC or FTI activity in the last 4 weeks. Those with 2 or more are below; they look like client orders or buckets and I would not guess which (Q8). The rest are person-named records and are not listed.

| # | Card | Owner | Activity, 4 weeks |
|---|---|---|---|
| 8785 | Bridger's Triton Pipeline | Bridger | 11 |
| 7871 | Hoffman - Supers | Nick | 8 |
| 7958 | ESI - Superintendents and Project Managers | Nick | 6 |
| 7945 | Carmel Partners - LA PM '26 | Max | 6 |
| 8407 | ALERT Gilbane | Evan | 6 |
| 7880 | Marketing - NYC | Nick | 3 |
| 4467 | Hoffman Bucket: Boise | Kevin | 2 |

## 6. Exact Crelate moves (for a write_external QC item; not submitted)

Every move below is a write to Crelate. Nothing has been done. Column moves use `POST /workflows/sales/stages/change`; adding people to the survivor uses `POST /jobs/{jobId}/contacts`; renames use `PATCH /jobs/{id}`. Column ids are in the appendix.

**Move 1. Promote 3 Triton cards from Build Leads to RETAINED (1).**

| # | Card | To |
|---|---|---|
| 8868 | Triton Construction Company - PM and Sr. PM - Miami | RETAINED (1) |
| 8784 | Triton - Project Engineers EVAN | RETAINED (1) |
| 8801 | Triton Construction - Curtain Wall Engineer/ Asst Super | RETAINED (1) |

**Move 2. Merge 17 duplicates into their survivors** (add their people to the survivor at the same stage, then move the duplicate to Closed Job Orders). People = contacts in the duplicate's pipeline today.

| # | Duplicate | Survivor | Survivor name | People to move |
|---|---|---|---|---|
| 7970 | PB South- APM | #6182 | PB South - APMs and PEs | 8 |
| 8869 | PB South- Project Engineers | #6182 | PB South - APMs and PEs | 3 |
| 7304 | Megawatt - MEP Managers | #6684 | Megawatt - MEP Managers | 73 |
| 7866 | MW Supers (EV) | #7305 | Megawatt - Superintendents | 136 |
| 7464 | Megawatt - PM 2 | #7306 | Megawatt - Project Managers | 472 |
| 7901 | Megawatt PM's RENO | #7306 | Megawatt - Project Managers | 29 |
| 7892 | Megawatt Low Voltage PM's- Texas | #7843 | Megawatt - Low Voltage PMs | 78 |
| 6763 | PB South - PMs and APMs 2 | #7931 | PB South - Project Managers | 49 |
| 7463 | PB South - General 2 | #7979 | PB South - General / Senior Superintendents | 108 |
| 7943 | PB SOUTH- General Super - WPB | #7979 | PB South - General / Senior Superintendents | 89 |
| 8066 | PB South- Miami PX | #8067 | PB South - Project Executive | 109 |
| 8787 | PB South MEP Superintendent - NKF 9/22/26 | #8409 | PB South - MEP Superintendents | 45 |
| 8796 | Triton Construction - General Superintendent | #8415 | Triton - Miami Superintendent | 1 |
| 8800 | Triton Construction - Project Engineer | #8784 | Triton - Project Engineers | 7 |
| 8802 | Triton- Project Engineer NEW YORK RELO: EVAN | #8784 | Triton - Project Engineers | 0 |
| 8804 | Triton- APM & PMs | #8868 | Triton - APMs and PMs | 115 |
| 8807 | Triton- PM and Sr. PM - WPB | #8868 | Triton - APMs and PMs | 15 |

**Move 3. Move 22 cards to Leads / Buckets** (column change only; pipelines stay intact).

| # | Card | From | Reason |
|---|---|---|---|
| 8862 | MW MPC Bucket | BL | "MW MPC Bucket" (Andrew) |
| 8863 | Max- PB South- Cost Engineer | BL | "Max- PB South- Cost Engineer": recruiter bucket |
| 8865 | Max- PB south APM/PM | BL | "Max- PB south APM/PM": recruiter bucket, 6 RPs in 14 days |
| 8866 | Bridger - Florida FE's | BL | "Bridger - Florida FE's": recruiter bucket |
| 8867 | Bridger - APMs/PMs WPB | BL | "Bridger - APMs/PMs WPB": recruiter bucket |
| 6005 | XL Construction Bay Area Bucket | GO | Named "Bucket"; owner Admin |
| 6184 | Bay Area PMs | GO | "Bay Area PMs": no client in the name; 0 RPs in 14 days |
| 8785 | Bridger's Triton Pipeline | SP | "Bridger's Triton Pipeline": personal pipeline, 11 RPs in 4 weeks |
| 7224 | Megawatt - PST and MT | TOP | PST and MT: zero activity in 8 weeks; acronyms not defined in our sources |
| 7315 | Pence Kelly - MPC Bucket | TOP | Named "MPC Bucket" |
| 7842 | Megawatt - Low Voltage GF | TOP | Low Voltage GF: 1 RP in 8 weeks |
| 7867 | MW Low Volt Executives | TOP | Low Volt Executives: zero activity since 28 Sep; owner Brandon |
| 8041 | Megawatt - Bay Area Electrical | TOP | Bay Area Electrical: zero activity since 22 Sep |
| 8054 | Megawatt - VP of Texas | TOP | VP of Texas: zero activity in 8 weeks |
| 8060 | Megawatt - MPC Bucket | TOP | Named "MPC Bucket" |
| 7204 | Megawatt - ET and CT Talent | TYP | ET and CT Talent: none in 14 days; acronyms not defined in our sources |
| 7807 | Megawatt - Precon Bucket | TYP | Named "Precon Bucket" |
| 7826 | Megawatt - PM Refresh | TYP | "PM Refresh" |
| 7891 | Megwatt- Safety Managers | TYP | Safety Managers: 1 RP in 8 weeks. If it is live, this is the survivor |
| 7903 | Megawatt- Safety Manager Reno | TYP | Safety Manager Reno: zero activity in 8 weeks (merge into 7891 if live) |
| 8002 | Carmel - FE Stamford | TYP | Carmel FE Stamford: 1 RP in 8 weeks, last activity 22 Sep |
| 8047 | Baker - SoFlo MPCs | TYP | "SoFlo MPCs": a list of MPCs; 29 RPs in 8 weeks, 1 in 14 days |

**Move 4. Move #8870 MK Marlow - MPC Portal from Build Leads to Client Portals.**

**Move 5. Move #4099 The Beck Group - Interiors Sr. PM from Leads / Buckets to Filled** (placed, closed 28 Jan).

**Move 6. Rename 27 surviving JOs** to `Client - Role`:

| # | Now | Proposed |
|---|---|---|
| 5278 | PB South - City Place Supers | PB South - City Place Superintendents |
| 6182 | PB South APMs and PEs | PB South - APMs and PEs |
| 7303 | Megawatt - Project Exec/ Director of PMO | Megawatt - Project Executive / Director of PMO |
| 7305 | Megawatt - Supers | Megawatt - Superintendents |
| 7306 | Megawatt - PMs | Megawatt - Project Managers |
| 7364 | Megawatt - Asst Supers | Megawatt - Assistant Superintendents |
| 7843 | Megawatt - Low Voltage PM | Megawatt - Low Voltage PMs |
| 7890 | VMG APMS | VMG - APMs |
| 7931 | PB South- PM's - Project X or WPB | PB South - Project Managers |
| 7934 | PB South - Assistant Superintendents - Project X or WPB | PB South - Assistant Superintendents |
| 7946 | VMG- BIM/VDC | VMG - BIM / VDC |
| 7953 | Megawatt - MEP - Nor CAL | Megawatt - MEP Nor Cal |
| 7979 | PB South - Gen/Sr Super 7/23 | PB South - General / Senior Superintendents |
| 8049 | PB South: Estimators | PB South - Estimators |
| 8067 | PB South - Project Executive - Project X | PB South - Project Executive |
| 8409 | PB South - MEP Supers | PB South - MEP Superintendents |
| 8415 | Triton Construction - Miami Super | Triton - Miami Superintendent |
| 8424 | Triton Construction - MEP Super/Engineer | Triton - MEP Superintendent / Engineer |
| 8426 | Baker - INL Safety Managers - NKF 9/22/26 | Baker - INL Safety Managers |
| 8781 | PB South- Field Engineers EVAN | PB South - Field Engineers |
| 8784 | Triton - Project Engineers EVAN | Triton - Project Engineers |
| 8801 | Triton Construction - Curtain Wall Engineer/ Asst Super | Triton - Curtain Wall Engineer / Asst Super |
| 8806 | PB South- Cost Engineer - Project X | PB South - Cost Engineer |
| 8809 | Hoffman Boise PE's | Hoffman - Boise Project Engineers |
| 8810 | PB South- Safety Manager - Project X | PB South - Safety Manager |
| 8864 | PB South - Controller - Propject X | PB South - Controller |
| 8868 | Triton Construction Company - PM and Sr. PM - Miami | Triton - APMs and PMs |

**Move 7. Set an owner on each surviving JO** (Q6). Brandon Nickel owns 8 cards in the four columns and has no activity in 8 weeks; Ryan Collins owns 1 and was last active 21 Sep.

## 7. Feasibility: the Friday scorecard "by active JO"

**Verdict: yes, buildable now from the API, read-only.** No mirror is needed to start: a week is about 450 activity rows, so a weekly pull is 3 paged calls plus one jobs call.

I ran it: for the week of 12 to 18 Oct, the API's own counts matched my pull exactly (proof table below).

### Endpoints and fields (all GET, base `https://app.crelate.com/api3`)

| Need | Endpoint and filters | Fields used |
|---|---|---|
| Activity type ids | `GET /activitytypes?limit=200` | `Id`, `Name`. RP, Resume, PTC, FTI are custom types with fixed ids (appendix). |
| Weekly counts per JO | `GET /activities?verb_ids=<ids>&regarding_ids=<job ids>&when_after=<Mon 00:00 PT in UTC>&when_before=<next Mon>&total_count=true&limit=1&fields=Id` | `Metadata.TotalRecords`. One call per JO per activity type, or page the rows below. |
| Rows, to split by recruiter | same filters, `limit=200&offset=N`, `fields=Id,VerbId,RegardingId,ParentId,When,CreatedById,Owners` | `VerbId.Id` (type), `RegardingId.Id` and `.Title` (the job), `ParentId.Id` (the contact), `When`, `CreatedById.Title` (recruiter). Also `owner_ids` to filter by recruiter. |
| Which JOs are active | `GET /jobs?statuses=<column ids>&limit=100` | `Id`, `JobNum`, `Name`, `SalesWorkflowItemStatusId` (the column), `Owners`, `CreatedOn`, `NumberOfPlacements`. Use `fields` to leave out fee and comp. |
| When a JO changed column | `GET /jobs/history?job_id=<id>&created_after=<date>` | `Date`, `Job`, `Stage`, `Action`, `User` |
| People entering a stage on a JO | `GET /jobs/{jobId}/contacts/history?created_after=<date>&created_before=<date>` | `Date`, `Stage.Title`, `Action` (AddedToJob or ChangedStage), `User`, `Contact.Id` |
| Pipeline size | `GET /contacts?job_ids=<id>&total_count=true&limit=1&fields=Id` | `Metadata.TotalRecords` |

Notes: filters are snake_case (`verb_ids`, `when_after`); unknown filters are silently ignored and reported in `Errors` as `IgnoredParameter`, so check that array. `sort_by=Date` is rejected on history. List endpoints do not return a total unless `total_count=true`.

### Proof

| Check | API | My pull |
|---|---|---|
| Triton Purchasing + Procurement, 12 to 18 Oct: RP / Resume / PTC / FTI | 24 / 5 / 3 / 0 | 24 / 5 / 3 / 0 |
| All RPs org-wide, 12 to 18 Oct | 392 | 392 |
| RP + Resume + PTC + FTI org-wide, same week | 453 | 453 |

### What stops it being exact today

| Gap | Size | Fix |
|---|---|---|
| Activity logged with no job (`RegardingId` empty) | 21% of RPs, 26% of resumes | The activity type record has a `RegardingRequired` flag, unset today for RP, Resume, PTC and FTI. Turning it on is a Crelate write (Kev's approval); whether the app then enforces it on every entry is untested. |
| PTC and FTI logged on portal cards | 44 of 168 PTCs, 34 of 76 FTIs | New rule: log on the role JO. Until then the report shows a "Client Portal" row. |
| Two PTC truths | PTC exists as an activity (168 in 8 weeks) and as a pipeline stage (109 stage entries since 1 Sep). FTI exists only as an activity; the nearest stage is "Interviewing" (118). | Use the activity as the number; use the stage as a cross-check. |
| Duplicate JOs for one role | 17 merges proposed | A `jo_family` table maps each old card to its survivor, so history rolls up. |
| "Resumes" is ambiguous | `Resume` (received) 223 and `Submittal & Files` 118 in 8 weeks | Ask Dean which one the scorecard means (Q12). I used `Resume`. |
| Stray dates | 1 activity dated year 9999 | Ignore `When` after today. |

Pipeline stages in use since 1 Sep (counts of entries): Dawg Pound 5081, Fix Data 2236, Decline 558, Follow Up 181, Go / No-Go (SOGOTP) 125, Interviewing 118, PTC 109, No Brainers 95, Pending PTC 71, Recruiter Call 74, and 8 more.

### Report shape for Dean (Friday scorecard, by active JO)

One row per active JO, all recruiters combined. Week is Monday to Sunday Pacific. Totals reconcile to the team's activity, with a visible "not on a JO" block, so nothing is hidden.

| Column | Meaning |
|---|---|
| Client, JO | Client and `Client - Role`, from the survivor card |
| Owner, Recruiters | Accountable owner; first names of everyone who logged on it, with their RPs |
| RPs, Resumes, PTCs, FTIs | Counts this week, all recruiters, merged cards rolled up |
| vs last week | Change in each count |
| Pipeline | People now in the JO's pipeline (engaged stages only, once buckets are separate) |
| Days open, Last activity | From `UserOpenDate` and `LastActivityDate` |

Illustration, week of 12 to 18 Oct, **before any cleanup**, mapped through the proposed merges. The recruiter split is the point: Max's and Evan's Triton RPs now land on one row.

| Active JO | RPs | Resumes | PTCs | FTIs | RPs by recruiter |
|---|---|---|---|---|---|
| Triton - APMs and PMs | 36 | 0 | 0 | 0 | Max 22, Bridger 6, Kevin 3, Evan 3, Noah 2 |
| Triton - Purchasing + Procurement | 24 | 5 | 3 | 0 | Max 23, Kevin 1 |
| Hoffman - Boise Project Engineers | 9 | 1 | 0 | 0 | Bridger 9 |
| PB South - Safety Manager | 8 | 1 | 0 | 0 | Evan 8 |
| PB South - Assistant Superintendents | 7 | 1 | 0 | 0 | Andrew 5, Evan 2 |
| PB South - MEP Superintendents | 7 | 0 | 0 | 0 | Andrew 4, Nick 1, Kevin 1, Noah 1 |
| Triton - MEP Superintendent / Engineer | 6 | 0 | 0 | 0 | Nick 3, Kevin 1, Evan 1, Andrew 1 |
| Baker - INL Safety Managers | 4 | 3 | 0 | 0 | Noah 3, Evan 1 |
| PB South - City Place Superintendents | 4 | 0 | 1 | 1 | Kevin 2, Nick 1, Andrew 1 |
| Triton - Project Engineers | 3 | 1 | 1 | 1 | Evan 2, Kevin 1 |
| Triton - Miami Superintendent | 3 | 0 | 0 | 0 | Andrew 2, Nick 1 |
| PB South - APMs and PEs | 2 | 0 | 2 | 0 | Kevin 2 |
| PB South - General / Senior Superintendents | 2 | 0 | 1 | 0 | Evan 1, Andrew 1 |
| PB South - Field Engineers | 2 | 0 | 0 | 0 | Evan 2 |
| Megawatt - MEP Nor Cal | 2 | 0 | 0 | 0 | Andrew 2 |
| Megawatt - Project Managers | 2 | 0 | 0 | 0 | Andrew 2 |
| 5 other active JOs | 4 | 1 | 1 | 0 | |
| **Subtotal on active JOs** | **125** | **13** | **9** | **2** | |
| Leads / Buckets and other working lists | 143 | 4 | 0 | 0 | Bridger 47, Noah 33, Andrew 23, Max 22, Evan 14 |
| Client Portal cards | 5 | 1 | 6 | 4 | Evan 3, Nick 1, Kevin 1 |
| Personal "ZZZ" pipelines | 44 | 7 | 1 | 0 | Andrew 24, Noah 11, Evan 5, Max 2, Nick 1 |
| Filled, closed or lost cards | 14 | 2 | 1 | 1 | Evan 10, Max 2, Nick 1, Kevin 1 |
| No job attached to the activity | 61 | 7 | 2 | 1 | Evan 21, Noah 13, Nick 12, Andrew 11, Max 3 |
| **Team total** | **392** | **34** | **19** | **8** | |

Today only 32% of the week's RPs land on an active JO. The target state, with Kev's buckets rule, is that engaged prospects move to the JO, so the subtotal rises and the "Leads / Buckets" row becomes the legitimate sourcing line.

Build plan (smallest first): (1) a read-only script that prints this table, no database, run by hand for Dean this Friday; (2) the nightly Crelate mirror, so the same query runs in SQL and feeds the recruiter desks; (3) the by-JO screen on the mirror. Each step is read-only; none needs a Crelate write.

## 8. Questions for Kev

| # | Question | My default if you say nothing |
|---|---|---|
| Q1 | PB South APMs and PEs: one JO or two? | One JO ("APMs and PEs", #6182) |
| Q2 | Location and project variants (WPB, Miami, Reno, NY relo, Project X): one JO per role, or per role and location? | One per role; merge the variants |
| Q3 | PB South Phillips Lobby (#8410) and the NKF 9/22 MEP Superintendent card (#8787): live orders of their own? | Phillips Lobby stays; #8787 merges into MEP Superintendents |
| Q4 | Max logged 44 RPs on Triton Purchasing + Procurement in 14 days. Are those all Purchasing, or his catch-all for Triton? | Left as is; no re-logging |
| Q5 | Promote Triton APMs and PMs (#8868), Project Engineers (#8784) and Curtain Wall (#8801) from Build Leads to RETAINED? Is #8868 the APM search you meant? | Yes, all three to RETAINED |
| Q6 | Who owns each surviving JO? Brandon Nickel has 8 cards and no activity in 8 weeks; Ryan Collins none since 21 Sep. | The recruiter doing most of the RPs |
| Q7 | Dormant TOP, GO NOW, Typical cards (Megawatt Low Voltage GF, Low Volt Executives, Bay Area Electrical, VP of Texas, PST and MT, ET and CT, Safety Managers x2; Bay Area PMs; Carmel FE Stamford): live orders or buckets? | Move to Leads / Buckets |
| Q8 | Leads / Buckets and Special Projects cards that look like live orders (list in 5h): promote? | Leave as they are |
| Q9 | Several JOs carry 300 to 570 people (Low Voltage PM 569, PM 2 472, Triton PMs 347, PB South PMs 307). Keep engaged people on the JO and move the rest to a bucket? | Leave pipelines intact |
| Q10 | From now, PTC and FTI are logged on the role JO, not the Client Portal card. OK? | Yes; the report shows a portal row meanwhile |
| Q11 | Six Filled cards show 0 placements (Baker NQA QC Manager, Carmel LA PM, Carmel Director of Cap Ex, Jackson Bucket 2, PB South Accountant BPO, PENTA LA Superintendent). Filled by us, or closed by the client? | Leave as they are |
| Q12 | Does "resumes" on the scorecard mean `Resume` (received) or `Submittal & Files` (sent to client)? Ask Dean. | `Resume` |

Also for you: Build Leads (15), Recruiter Pipelines (67, of which 50 are unnamed jobs all created on 13 Oct with no creator), Closed, Lost and Client T.O. are not in your screenshot. Are they hidden on purpose? I would retire Build Leads into Leads / Buckets.

## Appendix: ids used

Activity type ids:

| Type | Id |
|---|---|
| RP | `996532fa-687f-43b7-240e-6c5d86f3dc08` |
| Resume | `a8859da5-c9a9-4885-e332-6e6988f3dc08` |
| PTC | `92c42981-6c7b-4525-a7fd-4d7e86f3dc08` |
| FTI | `edd73b17-5cfe-402c-6377-d9afafefdc08` |
| Submittal & Files | `b92f0a4a-42f1-464a-c7ce-55ed88f3dc08` |
| Deal | `73acde9d-6a76-4aa6-0c7b-24b0afefdc08` |
| MP | `90f0f186-ef1d-4179-ba68-bac188f3dc08` |
| Screen | `2135627c-a762-4ed9-7438-fbafafefdc08` |
| Set Call | `9530ddb7-fa54-4e8a-255e-5eb0afefdc08` |

Board column ids (`SalesWorkflowItemStatusId`):

| Column | Id |
|---|---|
| RETAINED (1) | `0c13de6f-e565-415e-c0ef-993e114add08` |
| TOP Priority (2) | `0da0478c-2d78-407a-a8f1-99f87446dd08` |
| GO NOW (3) | `5a236fa5-7ea5-48dc-6f0e-b7f87446dd08` |
| Typical (4) | `e6fa493f-f5d0-4e05-904a-cbde08041886` |
| Client Portals | `89dcfe4d-75c4-463e-b839-b4cd01676c01` |
| Leads / Buckets | `f813eba0-9d99-4c7a-43c8-90b4afefdc08` |
| Special Projects & Searches | `9237d15c-fede-4138-c684-a7fc7646dd08` |
| Biz Dev Targets | `aaa8ce3a-c369-472a-2c65-2bb4afefdc08` |
| Filled | `3b392950-0160-4c12-b810-c1b4afefdc08` |
| Closed Job Orders | `e7a1323e-66ae-4d2f-89c9-cbde0804fe6e` |
| Build Leads | `0b9713f8-a143-462f-ba5d-c1b1afefdc08` |

Crelate copy, pulled 21 Oct 2026. Counts are as of the pull; the API is the source of truth.
