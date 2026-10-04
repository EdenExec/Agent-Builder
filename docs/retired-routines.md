# Retired routines

Prompts of routines whose trigger was reused by Radar, kept so they can be restored with `update_trigger` if wanted.

## Calendar Auto-Fill: RPA & Business Blocks

- Trigger: `trig_012VfA1Y4EBzyFoixKVGmNug` (now "Radar · inbox sweep (hourly)")
- Was: disabled since 29 September 2026, cron `0 5 * * *`, model claude-sonnet-5, last run abandoned
- Superseded by Radar's Stand Up Tomorrow step 5 (calendar stacking) and the hourly sweep

Original prompt:

```
You are running Kev's recurring "Calendar Auto-Fill: RPA & Business Blocks" task, which prepares tomorrow's Google Calendar. This is a fresh session with no memory of prior runs — do all research live using Google Calendar, Gmail/Superhuman Mail, and Notion. Do not fabricate content — if there's nothing real to fill a slot with, leave it empty. Never move, edit, or delete any existing calendar event — only fill genuinely open time.

STEP 1 — Find tomorrow's blocks: List tomorrow's events on Kev's primary Google Calendar (Pacific time) and identify:
- Green blocks — colorId "2" or "10"
- Purple blocks — colorId "3"
- Orange blocks — colorId "6"
For each block, work out what open time actually exists inside it — a block can already be partially booked, so only the genuinely free portions are fair game. Never move or delete anything already on the calendar.

STEP 2 — Travel exception (Sep 9–17, 2026, Kev traveling): If tomorrow's date falls within Sep 9–17, 2026 inclusive, SKIP Steps 3–5 (the full auto-fill) entirely for that run. Instead, pull a maximum of 3–5 genuinely urgent items (only things that truly can't wait) and add them into the description of that night's existing "RPA: PTC Review (Italy)" calendar event. Do not create any new calendar events and do not touch any other block during this window. If you can't find that event, say so plainly rather than guessing where to put the items. Then stop — do not proceed to Steps 3–5.

STEP 3 — Fill Green blocks (RPA): In the open time within Green blocks, create 20-minute named candidate-call events — PTC review, gatekeeper follow-ups, interview/prep scheduling. Source candidates from (a) the most recent "Coaching Briefs" Gmail-labeled email, and (b) open Superhuman Mail threads that need Kev's direct action. Prioritize in this order: (1) items a recruiter has flagged as needing Kev specifically, (2) the oldest-waiting PTC/gatekeeper items, (3) general follow-ups. Also route any lead-gen/LinkedIn outreach tasks into Green open time. Each created event: 20 minutes, named for the specific candidate/purpose, colorId "2", 10-minute popup reminder, no attendees.

STEP 4 — Fill Purple blocks (Business/OTB): Pull open items (Status = "Not started" or "In progress") from the "Daily Catch-Up Items" Notion database (data source collection://be709daf-ca63-4687-9295-e329e54f87bf, inside the "Daily Catch-Up Log" page: https://app.notion.com/p/3ce25d7d12f48110b9f2d1dcda440b90) across the Business, C12, and Admin / Emma Gap categories — this covers finance, insurance, catch-up admin, C12 to-dos, and leadership to-dos. Order oldest (by Date Logged) first and fill open Purple time with the oldest items that fit. If tomorrow is a Tuesday, prioritize any training-planning items ahead of other Purple content for the morning Purple block(s) specifically. Each created event: named for the specific item, colorId "3", 10-minute popup reminder, no attendees.

STEP 5 — Fill Orange blocks (Claude work time): In the open time within Orange blocks, fill with genuine to-do/task-optimization work where Claude itself does the building or drafting — SOPs, trackers, document prep, system builds, and similar. Do not put calls or meetings here. Pull from the same Notion database for open items that fit this description (e.g. anything logged under a "marketing RPA focus" next action, or other build/drafting work Kev has flagged) — do not duplicate work already assigned to a Purple or Green event in this same run. Each created event: named for the specific piece of work, colorId "6", 10-minute popup reminder, no attendees.

GENERAL RULES FOR STEPS 3–5: If a block (or the open portion of it) has nothing real and current to fill it with, leave it empty — do not pad it with vague or invented tasks. Every event you create gets a 10-minute popup reminder and no attendees.

At the end, give a short plain-text summary: what was filled in each color, what was left empty and why, and (if in the travel window) what went into the PTC Review description instead.
```
