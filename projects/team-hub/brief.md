# Team hub: depth charts, lead buckets and project notes in one place (Kev, 12 October 2026)

Decision (Kev, 12 October): a **private artifact, team only**. No public site. Extend the existing Eden Desk (`claude.ai/artifact/5SuFoioujKFV6KgX4dXi3G`) instead of building a second page.

## Why private

Depth charts name candidates and their status. A public link would put that in front of anyone, including competitors and the candidates' employers. Even the private hub shows names plus role and status only: no pay, phone, email or home details.

## What the Desk already has

Collections in its database: `days` (the daily folder), `charts` (depth-chart PDFs), `settings/modes`, `atlas_chat`, and per-person scorecards. It reads and writes through the artifact's database, so content changes go through `ArtifactData` and the page is not republished.

## What we add

| Section | Collection | One row is | Filled by |
|---|---|---|---|
| Depth charts (live view, next to the PDFs) | `depth` | One client search: client, project, last updated, source link, seats: [{seat, title, location, people: [{name, status, note}]}] | Radar and the owning recruiter |
| Lead buckets | `buckets` | One bucket and metro: bucket, metro, tiers {A,B,C counts}, total, sheet link, Crelate list name, owner, last pull, new since last visit | Scout, with Radar |
| Project notes | `notes` | One project: slug, title, status (active, waiting, done), owner, last decision, next steps, links, updated | Whoever owns the project; Q for eden-crm and finance |

Status words for people on a depth chart follow the existing colour codes: interviewing, offer letter, PTC, pending PTC, background, future play, pass, pass offer, waiting on resume.

## Rules

- Names plus role and status only. Nothing with pay, phone, email, home address or EEO data. Salary talk stays in Crelate.
- Family and KDTW material (Eden Ranch, Marlowe) does not appear in the team hub.
- Source and date on every row ("Crelate portal, 8 Oct"). A row older than 14 days shows "check with owner".
- Sharing is named people only. The share step is Kev's yes, a publish/share QC item.

## Build steps

1. Radar agrees the schema and who edits the Desk (sent 12 October).
2. Mock the three sections and seed from real data: Triton, PB South and VMG depth charts; Boise and national PE buckets; eden-crm, finance, Triton screener stats notes.
3. Republish the Desk once with the new sections and a "last updated by" line per row. Check it on a phone.
4. Kev reviews, then shares with named teammates.
