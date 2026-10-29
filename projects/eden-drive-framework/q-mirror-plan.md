---
title: Nightly repo-to-Drive mirror and sync-clash test
owner: Q
date: 2026-10-29
ticket: t-202610291950-qdrv
status: plan only; nothing built, no Drive writes
---

# Mirror plan: repo to "Eden Agents / 00 Shared"

## Result first

1. **One-way copy, repo wins.** A nightly job copies 6 files from `employees/_shared/` and 8 from `projects/team-hub/submittal-packet/` into `00 Shared`. Nobody edits `00 Shared` by hand; it is read-only for the team.
2. **Blocked on Kev creating the Shared Drive.** Until then I can build and test the job against a local folder only. The first real Drive write is one QC item (`write_external`) naming the folder and file list.
3. **The sync-clash test runs in the pilot week** and answers the proposal's open question: what Drive for desktop does while a scheduled run writes files.

## What gets mirrored

| Source (repo) | Target in Drive | Notes |
|---|---|---|
| `employees/_shared/*.md` | `00 Shared/_shared/` | agent-home-options, eden-brand, lab-review, numbers-gate, offboarding |
| `employees/_shared/eden-letterhead.docx` | same | binary; copied byte for byte, not converted |
| `projects/team-hub/submittal-packet/*` | `00 Shared/submittal-packet/` | 7 .md plus packet-template.json |

Plain files only, never converted to Google Docs, so the synced agent can read them.

**Excluded by rule:** anything not on the list above, dotfiles, and any file the privacy scan flags (EEO fields, salary or comp, home address, personal email or phone, key-like strings). A flagged file is skipped and reported to Radar, not uploaded.

## How the job works

1. Build the file list from the two source folders. Hash each file (SHA-256).
2. Compare to `00 Shared/_mirror-manifest.json` (path, hash, synced-at). Upload only new or changed files; the manifest is written last.
3. Header line in `00 Shared/README.md`: "Copy of the Eden repo, read-only. Last sync: <time Pacific>. Edit in the repo, not here." This is the one-source-of-truth label.
4. **Never deletes.** A file removed from the repo is listed in the nightly report as "orphan"; removal is a separate QC item.
5. **Edit detection.** If a Drive file's hash differs from the manifest (someone edited it in Drive), do not overwrite. Save the Drive version aside as `<name>.drive-edit-<date>` in `00 Shared/_conflicts/`, then overwrite, and tell Radar. Repo is the source of truth.
6. Dry-run mode prints the plan with no writes. Default for every test.
7. Skips the Sabbath (`npm run sabbath` exits 0): no run Friday sunset to Saturday sunset; the Saturday-night run catches up.

**Where it runs:** a scheduled routine using the Google Drive connector (Drive API, Eden-owned account), so no laptop dependency. Connector sign-in is a one-time batched session with Kev, which counts against friction once, not nightly. Attach the connector to the routine at creation.

**Tests before first live run:** unit tests for hash diff, privacy scan, orphan handling and conflict aside, run against a temp local folder standing in for Drive. Recorded in the ship report.

## Sync-clash test (pilot week, one recruiter, Nick if Kev agrees)

Goal: prove that Drive for desktop and a scheduled agent run do not corrupt or duplicate files. All test files go in a throwaway `01 People/<pilot>/_synctest/`, never in `00 Shared` playbooks.

| # | Test | Pass if |
|---|---|---|
| 1 | Agent run writes 20 small files while Drive for desktop is syncing | All 20 appear in the web Drive with correct hashes, no "(1)" copies |
| 2 | Same file edited in Drive web and by the agent within 60 seconds | Drive keeps both as versions or a conflict copy; none is lost; we record which wins |
| 3 | Laptop offline during a run, back online after | Files upload once, no duplicates |
| 4 | Mirror update lands in `00 Shared` while the pilot's agent is reading it | Agent reads a whole old or whole new file, never a partial |
| 5 | Run the real morning brief for 5 days | Output in `outputs/YYYY-MM-DD/` each day, no clash files |
| 6 | Kev opens every pilot output from the Shared Drive | All open |

A "pass" needs zero lost edits and zero unexplained duplicate files across the week. Results go to Radar with the pilot's week-end note; any failure sets the rule (for example: agents write only to `outputs/`, humans never edit there).

## Needs from others

| Who | What |
|---|---|
| Kev | Create "Eden Agents"; add Radar's account and the pilot; sign in the Drive connector once; approve the first write (QC) |
| Radar | Confirm the routine's Drive account is Eden-owned (not personal) |
| Casey | Seed `00 Shared` first; the mirror takes over from there so we do not fight over the same files |

## Decisions

1. Repo wins on conflict, Drive edits saved aside (above). My pick: yes.
2. Skip, not convert, the letterhead .docx. My pick: yes.
