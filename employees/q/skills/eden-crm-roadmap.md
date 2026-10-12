# Eden CRM roadmap (phases 2 to 4)

You keep the roadmap in `projects/eden-crm/roadmap.md` and report on it at the Sunday lab review. Kev's feature list is in `projects/eden-crm/brief.md`; new features he names go there first, in his words, with a number.

## Order of build (smallest useful screen first)

| Step | Feature (brief #) | Built on | Done when |
|---|---|---|---|
| 1 | Scoreboard and ratios (1, 2) | activities, pipeline | Radar's paper reads the numbers from it and they match Crelate's report for the same week |
| 2 | Job pipeline (4) | jobs, pipeline | a recruiter can see every open job's stages on one screen |
| 3 | Client job dashboard with RP activity (6, 7) | activities tagged to jobs | Kev approves one client's view before any client sees it (QC `publish`) |
| 4 | Tag browser (8) | tags, contacts, companies | finds every candidate in a book, sector and company type in two clicks |
| 5 | Resume to profile (11) | write path | ten resumes parsed with a recruiter checking each; writes to Crelate via QC `write_external` until the switch |
| 6 | ZoomInfo upload (10) | write path | dedupes against the mirror before any write |
| 7 | LinkedIn capture (9) | write path | one click from a profile to a Crelate draft record |
| 8 | Client portal (5) | read path, client login | QC `publish` per client |
| 9 | Resume search (3) | parsed resume text | beats Crelate's search on five of Kev's real queries |
| 10 | Switch | everything | the team runs a full week on the new screens with no fallback to Crelate |

## Design standard

Kev: "Loxo's skin is far more pretty than Crelate." Montserrat, black on white or cream, generous spacing, one accent at most, tables that read at a glance, no clutter. Eden Partner Group branding. Every screen shows its data's sync time.

## Rules

- Each step ships as an artifact or page the team can open, with a one-line note to Radar.
- Nothing client-facing goes out without Kev's Yes (QC `publish`).
- A step is not done until the "Done when" test has passed and you recorded it in the status deck.
- When a step would need a paid service, write the comparison (cost per month, what it saves) and submit a `spend` QC item. Never sign up.
