# Round Table: database layout (Dean, 21 October 2026)

Page: `projects/workforce/draft/round-table.html` (title "Round Table"). Private to Kev. Read-only: Radar, Dean and Tally write with `ArtifactData`. Not published. Example data shows until `claude.use("db")` resolves, then the page reads the live store only.

## Paths

| Path | One document is | Writer |
|---|---|---|
| `people/{slug}` | A folder (slug: `max`, `evan`, `noah`, `andrew`, `bridger`, `kyle`, `nick`) | Radar (roster), Dean (light) |
| `people/{slug}/scorecards/{weekOf}` | One week, id = Monday as `YYYY-MM-DD` | Dean |
| `people/{slug}/coaching/{weekOf}` | One work-only note | Dean |
| `people/{slug}/money/{mtd or ytd}` | Gated revenue, commission, percent to goal | Tally only |
| `people/{slug}/goals/targets` | Whether Kev has set the goal | Radar, on Kev's word |
| `people/{slug}/goals/ten-five-three-one` | Headline goals | Dean, from the worksheet |
| `people/{slug}/deliverables/{id}` | A deliverable or a job order (`kind`) | Dean; Radar for JOs from the Hub |

## Fields

`people/{slug}`: name, role, group (`headhunter`, `incoming`, `ops`), sort, light (`green`, `amber`, `red`, `grey` no data, `none` no light yet), light_why (one line, shown inside the folder only), light_rule (rule version), worksheet_url (their 10-5-3-1 doc), updated. The landing reads only these, and shows name and light.

`scorecards`: week_of, partial (true for a partial week, never triggers red), source ("Crelate as of Fri 11:59 AM PT"), rps, rp_days (days at 15 or more, of 5), mps, jos, resumes, screens, ptcs, subs, ftis, referrals, lvms, boxes (of 42), box_card_in, pillar. The page computes last week, the four-week average of prior complete weeks, and the direction (within 5 percent is Level).

`coaching`: week_of, numbers, win, one_change, pillar, ask, next_rep {text, due}. Work only. The page shows the latest in full and earlier ones as a list.

`money/mtd`, `money/ytd`: period, as_of, entity (EES or EPG), source, gate_id, gate_status (`passed`, `pending`, `not checked`), revenue, commission, pct_to_goal (Tally computes it against Kev's goal). The page shows a figure only when gate_status is `passed`, gate_id is present and revenue is a number. Anything else reads "Not synced" with the gate id box ("none yet" if empty). The page computes nothing here.

`goals/targets`: goal_set (true once Kev sets it), label ("2026 revenue goal"), set_on. Absent or false reads "Goal not set". No amount is stored or shown.

`goals/ten-five-three-one`: rows [{span ("10 years", "5 years", "3 years", "1 year"), work, life}], updated. Headlines only; detail stays in the worksheet.

`deliverables`: kind (`deliverable` or `jo`). Deliverable: title, due (`YYYY-MM-DD`), status (`open`, `done`). Page marks Overdue past the date, Due soon within 2 days. JO: title (role), location, role_on_job (lead, co-lead, backup, standby), since (`YYYY-MM-DD`), hub_url. No client names (Hub only). 14+ days on the job, not standby, shows "rotate?".

## Reads and privacy

- Landing: one subscription, `people`. Opening a folder subscribes to that person's five subcollections only; closing or switching drops them.
- Screen-share switch (kept per tab): closes the open folder, hides the Coaching, Revenue and commission and Percent to goal tabs, and never subscribes to `coaching` or `money`. Percent to goal is hidden too (A) because it is a revenue ratio.
- Never stored here: health, family, age, pay detail beyond Tally's gated commission figure, candidate contact details, client names.

## Rules to declare at publish (A, Kev to confirm who sees it)

`capabilities: {db: {rules: [{path: "", read: "admin", write: "admin"}]}}`. Only Kev and editors read; nobody else sees a row. Limit: rules key on path, so they cannot lock `money` or `coaching` inside `people/{slug}` while leaving the rest open. If Kev wants Nick to see scorecards but not money or coaching, move those two to `private/{slug}/...` and put an owner-only rule on `private`.
