---
title: Eden's agent framework on the Eden Google Drive
owner: Casey (draft for Radar, Q and Kev)
date: 2026-10-29
status: proposal; nothing bought, shared or migrated
---

# Eden's agent framework on the Eden Google Drive

Kev, 29 Oct 2026: "As we help our team scale, how do we replace the GitHub framework with the Google Drive, where everyone's back-end storage lives in the Eden Google Drive? Then we own the IP."

## Result first

1. **Yes, for the team's agents.** Every recruiter's playbooks, prompts, rules and outputs live in one Eden-owned **Shared Drive**. They run in the Claude desktop app pointed at their own synced folder. If someone leaves, the files stay with Eden.
2. **Keep GitHub only where it earns its place.** The code and the cloud routines (Radar's sweeps, the ticket runner, Q's Crelate mirror) need a repository to run in the cloud. That repo is already under the Eden organisation (`edenexec/agent-builder`), so Eden owns it too. Its shared rules and prompts get mirrored into the Drive so the team never needs GitHub.
3. **IP is also paper, not just storage.** Ownership needs three things: an Eden-owned Shared Drive (not personal My Drives), Claude accounts on an Eden plan (not personal accounts), and an IP assignment clause in every recruiter and contractor agreement. That last one is Docket's review.

## How it works

```
Eden Shared Drive: "Eden Agents"  (owned by Eden's Google Workspace)
├── 00 Shared            Eden rules, brand, standing rules, the team prompts (submittal packet, touch list)
├── 01 People
│   ├── Max/             playbooks/, RULES.md, outputs/YYYY-MM-DD/
│   ├── Evan/
│   ├── Noah/ ...
├── 02 Clients           client-facing folders Kev shares one at a time (City Place for Vinny, and so on)
└── 03 Templates         a starter folder each new hire copies on day one
```

| Piece | How |
|---|---|
| Storage | One Shared Drive owned by Eden. Members get access by Google group; leaving the group removes access, and the files stay |
| Each person's agent | Google Drive for desktop syncs their `01 People/<name>` folder to their computer. The Claude desktop app (Code tab or a Cowork project) points at it. Their scheduled tasks (morning brief, touch list, follow-ups) run there |
| Shared rules | `00 Shared` is read-only for the team, written by Radar. Every person's RULES.md says "read 00 Shared first" |
| Reading from anywhere | The Google Drive connector lets Claude on the web or phone read the same files |
| Version history | Google Drive keeps file versions; good enough for playbooks and outputs |
| Cloud runs (laptop closed) | Stay on the Eden GitHub repo for now (Radar's routines). Revisit if cloud scheduled tasks gain a Drive-backed option |
| Mirror | Q builds a nightly copy of `employees/_shared/` and `projects/team-hub/submittal-packet/` from the repo into `00 Shared`, so the team's prompts are always current |

## Pilot (one week, one recruiter)

1. Kev creates the Shared Drive "Eden Agents" (only a Workspace admin can) and adds Radar's account and one pilot recruiter.
2. Casey seeds `00 Shared` with the submittal prompt and the home-options guide, and `03 Templates` with a starter folder.
3. The pilot recruiter installs Google Drive for desktop, points the Claude desktop app at their folder, and runs two workflows for a week: the submittal packet and a daily "my candidates to touch" brief.
4. Success: packets built without help, the brief runs every morning, no sync clashes, and Kev can open every file from the Shared Drive.
5. Then roll out to the team with Dean's onboarding checklist.

**Not yet verified:** how Drive for desktop behaves while a scheduled run writes files. The pilot is how we find out. Also whether every recruiter's Claude account is on an Eden plan; Radar to check.

## Decisions for Kev

1. **Create the "Eden Agents" Shared Drive.** My pick: yes. A starter folder is already in your My Drive ("Eden Agents (starter)") and can be moved into the Shared Drive in one drag once it exists.
2. **Who pilots.** My pick: Nick. He touches the most clients and will show the team.
3. **Claude accounts on an Eden plan for everyone.** My pick: yes, so the chats and projects are Eden's too. That is a spend, so it goes through QC.
4. **IP assignment in every recruiter and contractor agreement.** My pick: Docket checks the current agreements and drafts the clause.

## Who does what

| Owner | Does |
|---|---|
| Kev | Creates the Shared Drive; picks the pilot; approves any plan spend |
| Radar | Adopts the "give options" rule for everyone; writes `00 Shared`; checks Claude plans |
| Q | Builds the nightly repo-to-Drive mirror; tests sync behaviour in the pilot |
| Dean | Adds the Drive setup to new-hire onboarding |
| Docket | Reviews IP assignment in recruiter and contractor agreements |
| Casey | Seeds the starter folder and the team prompts; runs the pilot with the recruiter |

## Built today (29 Oct)

Starter folder in Kev's My Drive, ready to drag into the Shared Drive once it exists: **Eden Agents (starter)** (https://drive.google.com/drive/folders/1ZrTlES2NtTYbfcgU6Rj-Ix2FOWhfC6Xq), not shared with anyone.

| Folder | Holds |
|---|---|
| 00 Shared | README.md, eden-submittal-prompt.md, agent-home-options.md |
| 01 People | empty: one folder per person at roll-out |
| 02 Clients | empty: client folders Kev shares one at a time |
| 03 Templates | START-HERE.md; my-folder/ with RULES.md and the daily-brief.md starter playbook |

All files are plain .md (not Google Docs) so an agent working from the synced folder can read them. Repo copies: `projects/eden-drive-framework/starter/`.
