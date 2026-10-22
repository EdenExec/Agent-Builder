---
title: Cutting Radar's permission requests
subtitle: Q's proposal for Kev's 21 October friction ticket
org: epg
author: Q
date: 2026-10-21
---

## Executive summary

Four slowdowns are logged this week, and three are the same problem: a connector or a login that is not attached where the work runs. One 20-minute session from Kev, plus one settings change, removes all three. Every gate on writes, spend, sends and publishing stays exactly as it is.

- **Fix once:** a single "connector session" in claude.ai (about 20 minutes, section 2) instead of one prompt per routine or per sign-in.
- **Fix in settings:** nine read-only allow lines for Radar's repo (section 3), so reads stop asking. Nothing that writes, sends, spends or publishes is added.
- **Count it:** every log line starts `[perm]`, `[signin]`, `[trigger]` or `[manual]`, and Radar's Friday tally goes in the Sunday review: this week is the baseline.

Kev, 21 Oct 2026: "You should see a permission request as a negative mark on you doing your job."

## 1. Where Radar's work slows down

Source: `employees/radar/memory/live/friction.md` (four lines, 21 Oct), `.claude/settings.json` and `employees/radar/routines.yaml`. I read them from the repo; Radar has not yet answered the Friday questions in section 5, so this list is what the files show, not what Radar would add.

| # | Slowdown | Kind | What it costs | Fix | Gate that stays |
|---|---|---|---|---|---|
| 1 | Routines an agent creates carry no connectors (CloudTalk nightly, EOW lab report) | trigger | A routine Kev already approved sits dead until he builds it by hand | Section 2: one connector session | Routine can only read, draft and queue QC; sends and Crelate writes still QC |
| 2 | QuickBooks sign-in expired; Tally blocked | signin | A finance agent stops mid-week and nobody knows until it asks | Section 4: a Friday connector check plus a reconnect batch | None needed: reconnecting is not a write |
| 3 | QC approve is Kev-only on the Desk card | gate | Each item waits on one person, one tap at a time | Section 6: batch card and a standing class for Eden's own databases | Approve stays Kev-only; `settings.json` deny lines stay |
| 4 | `.claude/settings.json` allows only `mcp__Notion`; every other read prompts | perm | Calendar, Drive, Docs, Plaud, Zoom and Supabase reads each ask in a fresh session | Section 3: read-only allow lines | Writes, sends, deletes stay on ask or deny |
| 5 | The hourly sweep sat on Office tickets (they were idle until 21:10 on 21 Oct) | manual | Tickets Kev handed over waited most of a day | Section 5: ticket pick-up as the first sweep step, plus a stale-ticket flag | A ticket is delegation, never approval |

<!-- pagebreak -->

## 2. One connector session, then it runs by itself

**Why:** a trigger created inside this organisation by an agent gets no connectors (tried and removed 21 Oct). A trigger Kev creates from his own account does. So the cheapest fix is to batch every trigger that needs a connector into one sitting, instead of discovering each one as it fails.

**Kev, once (claude.ai > Routines):**

| Routine | Schedule (Pacific) | Connectors to attach | Prompt |
|---|---|---|---|
| Q · CloudTalk nightly lead load | Weekdays 11:03pm, model Sonnet, repo EdenExec/Agent-Builder, branch `claude/pensive-brown-18gll8` | Gmail (or Superhuman Mail), CloudTalk | "Read employees/q/routines/cloudtalk-nightly.md on this branch and follow it exactly." |
| EOW agent reports (trigger `trig_019qLwVnxBotcrE3J9gZh4YE`, exists) | Friday 1:50pm | Edit the trigger: add Drive and Notion | Unchanged |
| Q · Friday connector check (new, section 4) | Friday 1:30pm | Every connector Radar uses | "Read employees/q/routines/connector-check.md and follow it." (Q writes that file once Kev says yes.) |

Kev pastes each new trigger id to Radar, who files it in `employees/q/routines.yaml`. The CloudTalk routine still waits on QC `2026-10-19-e4ff61` (10-row test load), which is Kev's own approve and stays a gate.

**Result:** the routines then run without a person in the loop, which is a permission request that never gets sent.

## 3. Allow lines for read-only tools (propose; I do not edit settings.json)

Today `allow` holds only `mcp__Notion`. These are the exact lines to add to `permissions.allow`. Every one is a read; none writes, sends, spends or publishes.

```json
"Read",
"Glob",
"Grep",
"mcp__Google_Drive__search_files",
"mcp__Google_Drive__read_file_content",
"mcp__Google_Docs__read_doc",
"mcp__Plaud__list_files",
"mcp__Plaud__get_transcript",
"mcp__Plaud__get_note",
"mcp__Zoom_for_Claude__recordings_list",
"mcp__Zoom_for_Claude__get_recording_resource",
"mcp__Zoom_for_Claude__get_meeting_assets",
"mcp__Supabase__list_projects",
"mcp__Supabase__get_project",
"mcp__Supabase__list_tables",
"mcp__Supabase__list_migrations",
"mcp__Supabase__get_advisors",
"Bash(npm run leads -- check*)",
"Bash(npm run leads -- verify*)",
"Bash(npm run office -- sync*)",
"Bash(npm test*)"
```

Notes, so nothing is allowed by accident:

- **Not added:** `mcp__Supabase__execute_sql` (it can write), `mcp__ZoomInfo__enrich_*` (credits), every Drive create or update tool, Superhuman send, Calendar create and update. The QC approve and reject deny lines and the Notion delete ask lines stay as written.
- **Not verified from here:** Superhuman, Gmail and Calendar read tool names; I cannot list them in this session. Radar should paste the connector's tool list and I will add the read ones as exact names. Do not allow those servers wholesale: they hold the send and delete tools.
- **Kev owns the change.** A rule that names a tool is an edit to `.claude/settings.json`; I have made none.

## 4. Stop sign-ins dying silently

QuickBooks expired and Tally found out only when blocked. Fix: a Friday check, on the routine in section 2, makes one cheap read per connector (calendar, Drive, Notion, QuickBooks, CloudTalk, Superhuman, Plaud).

It writes only to `friction.md` and one Desk card, "Reconnect before Monday", listing each connector that failed with its link. Kev clears them in one sitting: a lapsed login becomes one Friday task, not a mid-week stall.

Reconnecting is a login, not a write to a live system, so it is not a gate to remove.

## 5. Make Office tickets fast without making them unsafe

- **First step of every hourly sweep is `ArtifactData list tickets`** (already in `inbox-sweep.md`, "Eden Office"). Proposed addition: any `open` ticket older than 60 minutes during working hours is surfaced at the top of the next push, so a stalled pick-up shows within the hour, not at day end.
- **One Office run per day at 7am** is not needed if the sweep reads tickets, but a ticket owned by Q, Scout or Dean can be worked in the same session with no extra prompt: the agent files the result back through Radar.
- **Ticket results carry links to files, not chat.** Radar closes tickets; agents never write the Office database.

## 6. Make approvals faster, not fewer

Gates are not friction (Kev, 21 Oct). Only the cost of clearing one goes down.

| Change | Effect | Who decides |
|---|---|---|
| One **batch card** on the Eden Desk: "3 items waiting: approve all, approve some" with the exact change shown per item | One visit instead of three | Kev; Radar builds the card |
| Office items link straight to their Desk card (done 21 Oct) | No hunting | Done |
| **Standing class, by Kev's say-so only:** writes to Eden's own artifact databases (Office tickets, Hub job rows, desk rows) need no per-item QC when Radar makes them from a ticket Kev opened | Removes the most frequent prompt; no client system touched | Kev. Radar and Q must not assume this; it is not in effect |
| Crelate writes, CloudTalk loads, Superhuman sends, spend and publishing | Stay a QC item each time, with the exact records shown | Fixed |

Kev's rule that a past approval covers only the exact item approved still stands; the standing class above is a separate, explicit yes.

## 7. Count it

| Metric | How | Where reported |
|---|---|---|
| Permission requests this week vs last | Radar tags each `friction.md` line `[perm]`, `[signin]`, `[trigger]` or `[manual]` and counts them Friday | Sunday lab review, status deck |
| Baseline | This week: four logged lines (one perm, one signin, one trigger, one gate), plus any Radar adds | This file |
| Target | Under 2 a week after the connector session and the allow lines | Reviewed Friday 6 Nov |

## 8. What I need

| Who | What | When |
|---|---|---|
| Radar | Answer the five questions below | Friday 23 Oct |
| Kev | The connector session (section 2), and yes or no on the allow lines (section 3) and the standing class (section 6), in one sitting | When convenient |

**Five questions for Radar:** which prompts you saw and which tool raised each; which routines or tickets stalled and for how long; which sign-ins are expired or close; what you do by hand more than twice a week; what you would stop asking Kev if you could.
