---
title: New-hire onboarding, Drive setup section
owner: Dean (draft for Kev, Radar and Nick)
date: 2026-10-29
ticket: t-202610291950-ddrv
status: draft; nothing sent, shared or created. Pending Kev's yes on the Shared Drive and the pilot result
---

# New-hire onboarding: set up your agent home

Result: every new recruiter leaves day one with a working agent folder in the Eden Agents Shared Drive, or with another home they chose, and the first thing the agent reads is `00 Shared`. Insert this section into the accounts checklist of the new-hire packet (`employees/dean/skills/new-hire-setup.md`), after the Google Workspace row.

## Step 1. Choose a home (ask five questions, recommend one)

Per `employees/_shared/agent-home-options.md`, Nick or Kev asks the new hire; we never assume one tool.

1. Where do your files already live?
2. Does it need to run while your laptop is closed?
3. Who else needs to see or edit the playbooks and outputs?
4. Who should own the work if you leave?
5. How comfortable are you with technical setup?

| Home | Pick it when | Eden's view |
|---|---|---|
| **Eden Agents Shared Drive** (Google Drive for desktop) | You work on Eden's Google Workspace and want Eden to own the files | **Recommended (A).** Eden owns it, access by group, version history, shared rules in `00 Shared` |
| Folder on your computer | You want the fastest start and no linking | Fine to start; Eden owns nothing until it is copied to the Drive. Computer must stay awake for scheduled tasks |
| GitHub (Eden organisation repo) | Developer-level comfort, or a task must run with the laptop closed | Keep for Radar's cloud routines; not needed by recruiters |
| Cloud, no files | A simple brief that only reads email, calendar and connectors | Good add-on for one brief; no playbooks stored |
| Microsoft 365 or iCloud | Only if the person's own files already live there | Rare at Eden; the files would not be Eden-owned unless in a company folder |

Mixing is fine: Drive folder for playbooks, plus one cloud scheduled task for anything that must run with the laptop shut. Not yet verified: how Drive for desktop behaves while a scheduled run writes files; the pilot tests it, so say so when offering it.

## Step 2. If they pick the Shared Drive: the checklist

| # | Task | Who does it | Done |
|---|---|---|---|
| 1 | Add the person to the Eden Agents Google group (grants Shared Drive access) | Nick (Workspace admin action; QC `write_external` if an agent drafts it) | |
| 2 | Confirm their Claude account is on an Eden plan, not a personal one. Plan spend is Kev's yes | Radar checks; Kev approves any spend | |
| 3 | Install Google Drive for desktop and sign in with the Eden account | New hire, with Nick | |
| 4 | Set the Shared Drive "Eden Agents" to be available offline (or mirrored) so `01 People/<name>` is synced to the computer | New hire | |
| 5 | Copy `03 Templates/my-folder` into `01 People/<name>` (starter: RULES.md and daily-brief.md) | New hire, with Nick | |
| 6 | Open the Claude desktop app (Code tab or a Cowork project) and point it at `01 People/<name>` | New hire | |
| 7 | Confirm RULES.md says "read 00 Shared first", then ask the agent to read `00 Shared` and summarise the standing rules in three bullets | New hire | |
| 8 | Run the first playbook: the daily "my candidates to touch" brief. Turn on "Keep computer awake" if it is scheduled | New hire, Nick checks | |
| 9 | Connect the Google Drive connector in Claude so the same files read from the web or phone | New hire | |
| 10 | Check: open one output in the Shared Drive from a second device; Nick can see the folder | Nick | |

Rules for the new hire (one line each on the day-one page):

- `00 Shared` is read-only; Radar writes it. Never edit it, copy what you need into your own folder.
- Work lives in your folder only. Nothing client-facing is shared outside `02 Clients` folders Kev opens one at a time.
- Files stay plain .md so the agent can read them.

## Step 3. Ramp and check

| When | Check | Who |
|---|---|---|
| Day 1 | Items 1 to 8 done | Nick |
| Week 1 | Daily brief ran on 4 of 5 days, no sync clashes | New hire reports; Nick confirms |
| Day 30 | Folder has outputs by date; the submittal packet built without help | Dean prepares, reviewed in person |

## Open items for Kev (my recommendation first)

1. **Hold this section until the Shared Drive exists and the pilot finishes.** Pilot is Nick per the proposal; silence means the section stays a draft and new hires get the folder-on-computer option.
2. **Claude accounts on an Eden plan for new hires.** Yes; it is a spend, so it goes through QC.

Source: `projects/eden-drive-framework/proposal.md` (29 Oct 2026). Ramp timings marked (A) until Kev confirms.
