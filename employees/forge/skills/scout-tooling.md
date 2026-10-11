# Scout's workbench (the tools behind lead lists and research)

Scout researches job orders and builds lead lists (Scout is not hired yet; until it is, Radar does this work and you build the same tools for Radar). You build and keep the tools; Scout or Radar runs them. Standing rules that every tool must enforce are in `employees/radar/skills/standing-rules.md`.

## The pipeline a lead list goes through

1. **Pull.** ZoomInfo search by title, geography and company type (connector). Never more than the job needs.
2. **Exclude clients.** Check every company against the active client list before anything else. Moss rows go only to a "Moss · referral asks only" tab; Baker rows carry "Client · discreet". Every other active client is excluded unless Kev made an exception.
3. **Dedupe against Crelate.** Match on LinkedIn URL first, then name plus company, against the mirror. Mark rows already in Crelate with the owner and last activity date.
4. **LinkedIn column, never blank.** Exact profile URL when known; otherwise a one-click LinkedIn people-search link on name and company.
5. **Write the sheet.** One CSV per role (Drive uploads take text, not base64; one file per call). No personal emails or phone numbers on lead sheets.
6. **Hand off.** A one-line note to Radar with the sheet link and counts (pulled, excluded, already in Crelate, new).

## What you own

- The scripts or functions for steps 2 to 5, with tests using made-up names.
- The client list Scout checks against, read from Crelate (companies with client status) once the mirror runs; until then from `employees/radar/skills/standing-rules.md`.
- A short README Scout reads before its first list.

## Rules

- ZoomInfo data is for Eden's own recruiting only: never share or resell it, never use it for bulk unsolicited outreach.
- A tool that would send a message (email, LinkedIn, text) is never built to send; it drafts, and the send goes through QC.
