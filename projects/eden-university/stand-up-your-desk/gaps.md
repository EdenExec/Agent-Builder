---
title: Stand up your desk · gaps
subtitle: Every step that still needs a human, who does it now, and how it becomes self-serve
author: Dean
date: 2026-10-28
cover: false
---

## Executive summary

Fourteen steps in the course still need a person or a purchase, and eight content decisions are open. Nothing here has been done, bought or sent.

Five asks need Kev's yes before the first hire can run the course end to end: (1) G1 and G2, the account and Gemini; (2) G6 and G8, the Crelate and CloudTalk seats; (3) G9 and G10, the two video libraries; (4) G11, Claude seats and sharing; (5) G7, repository scope.

- **One trigger.** When Kev says "X joins" (name, start date, role, office, manager), Dean opens one parent onboarding ticket on the Command Center and one child ticket per row below. Each child names its owner, its module and what "done" looks like.
- **One yes per hire, not one per seat.** Kev approves the set once (a batched QC item for the write and spend rows). Nothing is created before that yes.
- **Where the human stays by design:** paperwork and payroll (G13) and the in-person sign-off (G14).

The "Kev's yes" column reads: spend (a seat or licence), access (who can see or reach what), send (a message to the hire), or none.

## Accounts and access (G1 to G7)

| ID | Step | Who does it now | How it becomes self-serve or an automatic ticket | Kev's yes | Needed by |
|---|---|---|---|---|---|
| G1 | Create the Google Workspace account | Nick or Q, in the Workspace admin console | Child ticket `onboard-google` fires on the trigger. Q's routine creates the user from the ticket (a write_external QC item naming the exact user and group, approved once per hire). UNVERIFIED: whether the admin API is enabled for Eden | Access | M01 |
| G2 | Workspace licence, and Gemini in Gmail and Docs | Kev or the account admin | Licence is added in the same QC item as G1. UNVERIFIED: whether Eden's current Workspace edition includes Gemini; the seat price is not in any Eden file | Spend | M01, M06 |
| G3 | Enforce 2-Step Verification | Nobody today (each person is asked) | One-time admin setting that requires 2-Step for the whole domain with a grace period. After it, M01 step 5 cannot be skipped and no one chases anyone | Access (policy) | M01 |
| G4 | Shared access: Drive folders, the Eden University folder, the core-values doc, the recurring Headhunter Training and Round Table events | Nick shares folder by folder, Kev adds people to events | One Workspace Google Group for recruiters is the owner of every shared folder and recurring event. G1 adds the hire to the group, so access arrives with the account. Kev decides which folders the group holds; discreet-client and referral-ask-only tabs stay off it | Access | M03 to M05 |
| G5 | Send the welcome message with the first sign-in and the Day 1 checklist | Kev, by hand | Dean drafts it from a template as a QC send_message item; Kev sends it. The checklist is printable and holds no secrets. The first sign-in comes through Workspace's own "send sign-in instructions" option (UNVERIFIED) and is never written to any file | Send | Day 0 |
| G6 | Crelate seat and role | Nick, in Crelate admin | Child ticket `onboard-crelate` names the role and the invitation. Stays a human click until the Eden app replaces Crelate; the invitation goes to the hire's Eden address, and the hire sets their own password. UNVERIFIED: price per seat, and whether Crelate's API can create a user | Spend, access | M10 |
| G7 | Your own Crelate API key, and access to the repository that holds the Crelate-in-Claude setup | Kev issues the key if it is not in the hire's account settings, and adds the hire to the repository | Recommend not giving a new hire the full Agent-Builder repository, because it holds every employee's files. Build a small `eden-recruiter-kit` repository with only the setup page and this course, and add the hire to the group that owns it. If the key page is open to the hire's role, the key step is already self-serve (UNVERIFIED) | Access | M16 |

## Phones, libraries, desk (G8 to G12)

| ID | Step | Who does it now | How it becomes self-serve or an automatic ticket | Kev's yes | Needed by |
|---|---|---|---|---|---|
| G8 | CloudTalk agent seat, a number, a headset | Nick or Kev in CloudTalk | Ticket `onboard-cloudtalk`. Buy a small pool of numbers once so assignment is one click; the pool is the spend. Q to check whether the CloudTalk API creates agents and assigns numbers (the API lists agents and numbers; creating them is not confirmed). Headset policy (who buys) is open | Spend | M12 |
| G9 | Next Level Exchange seat | Kev, by an arrangement no Eden file describes (the New Hire Flow has no link, cost or dates) | Kev states how Eden holds the account (team plan or per person). If invitations are by email, the ticket carries the invite; the hire sets their own password. UNVERIFIED: whether team invites exist, the price, and the login page | Spend | M09 |
| G10 | Recruiter U access | Kev | Same pattern as G9. UNVERIFIED: whether Recruiter U and Next Level Exchange share one account, and how Eden's access is held | Spend | M11 |
| G11 | Claude account for the hire; the Team Hub as Contributor; the desk shared to their address; the Friday card on the Eden Desk | Kev, by sharing each artifact to a named address | Ticket `onboard-claude` batches the shares; Kev shares once per hire. Hub write rights (`team_asks`, `care`) come with Contributor. UNVERIFIED: whether artifacts can be shared to a group instead of named addresses, and the seat price (the Recruiter Desk brief could not price it) | Spend, access | M07, M08, M19 |
| G12 | LinkedIn Recruiter seat (ZoomInfo only by exception) | Kev | Not needed for Phase 1. Ticket `onboard-linkedin` fires at day 5 so the seat exists for M17. ZoomInfo stays with Noah's enrichment and Scout's lists unless Kev says otherwise | Spend | M17 |

## What stays human by design (G13, G14)

| ID | Step | Who | Why it stays human |
|---|---|---|---|
| G13 | Agreement, paperwork, payroll set-up | Nick and Docket, through Gusto | Legal and identity steps. The course holds no pay, split or contract terms and never will. Course Day 1 starts when Nick marks paperwork done; nothing else about it enters the course |
| G14 | Proof review and the C1, C2, C3 sign-offs | Dean reads the Proof Sheet (Drive); Kev or Nick signs in person | A certification is an observation by a person. Dean records the date and the counts only. Reviewing proofs is Dean's job, so no one has to open them first |

## Content decisions still open (C1 to C8)

| ID | Decision | Owner | Default until answered |
|---|---|---|---|
| C1 | The first five videos in Next Level Exchange and Recruiter U, in Eden's order | Kev | First video of Foundation Training, in order (UNVERIFIED structure) |
| C2 | Exact meaning of the Dawg Pound stage | Nick or Kev | The lead-pool stage on a job's pipeline: people not yet engaged (A) |
| C3 | Glossary entry for PTC, and how it differs from Submitted | Kev (flagged in the Eden App brief) | Course says "Kev's term"; no definition is invented |
| C4 | Ramp numbers (0, 5, 10, 15 RPs a day by week) and the C2 and C3 thresholds | Kev | All marked (A) |
| C5 | Wording review: training and certification shown as resources and a standard, not management controls | Docket | Course avoids "required" and "mandatory" |
| C6 | Four templates to build: Proof Sheet, Candidate data sheet, Practice · 25 names, welcome message | Dean builds (no spend), Kev approves | Not built yet; the course names them |
| C7 | How a recruiter's own sheet enters the nightly loop (ticket to Scout, or a row on the Lead Log) | Radar and Nick | Ticket to Scout, names and roles only (A) |
| C8 | Which password manager Eden uses | Kev | The browser's built-in manager |

## Spend and access summary for Kev

| Item | Kind | Price in an Eden file? |
|---|---|---|
| Workspace seat and Gemini entitlement (G2) | Spend | No |
| Crelate seat (G6) | Spend | No |
| CloudTalk seat and number (G8) | Spend | No |
| Next Level Exchange and Recruiter U (G9, G10) | Spend | No |
| Claude seat (G11) | Spend | No (Recruiter Desk decision 1) |
| LinkedIn Recruiter seat (G12) | Spend | No |
| Groups, domain 2-Step policy, repository scope (G3, G4, G7) | Access | Free |

<!-- pagebreak -->

## The onboarding ticket set (design)

Fires when Kev names the hire. Each row is a Command Center ticket, owner and module named. None is created today.

| Ticket | Owner | Blocks | Done when |
|---|---|---|---|
| onboard-parent | Dean | Everything | All children done, C1 signed |
| onboard-google (G1, G2, G3, G4) | Q | M01 | Account exists, in the recruiters group |
| onboard-welcome (G5) | Kev | M01 | Welcome message sent |
| onboard-crelate (G6, G7) | Nick | M10, M16 | Seat active, invitation accepted |
| onboard-cloudtalk (G8) | Nick | M12 | Seat and number active |
| onboard-libraries (G9, G10) | Kev | M09, M11 | Both logins accepted |
| onboard-claude (G11) | Kev | M07, M08, M19 | Hub, desk, card shared |
| onboard-linkedin (G12) | Kev | M17 | Seat active by day 5 |
| onboard-paperwork (G13) | Nick | Day 1 | Marked done by Nick |
| onboard-signoff (G14) | Dean | C1, C2, C3 | Dates recorded |

If a module's seat is missing on its day, the hire files "Seat missing · M10" and the owner above gets it. The hire never chases a person by email.
