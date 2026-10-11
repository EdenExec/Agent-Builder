# Eden CRM: brief (Kev's feature dump, 11 October 2026)

Goal: Eden's own recruiting CRM and ATS, built on a mirror of Crelate first, borrowing what Kev likes in Crelate and Loxo. Replace Crelate only after the team runs a full week on the new screens.

## What Kev likes (his words, lightly ordered)

| # | Feature | Where it is today |
|---|---|---|
| 1 | Daily reporting and the scoreboard | Crelate |
| 2 | The ratios (call to submittal to interview to placement) | Crelate |
| 3 | Resume data searching | Crelate |
| 4 | Candidate pipeline per job | Crelate |
| 5 | Client portals | Crelate |
| 6 | RPs tagged to specific jobs, so clients see how much activity we put into their searches | Crelate |
| 7 | Job dashboards that show clients the activity | Crelate |
| 8 | The tagging system: book, sector, company type, referrals and more | Crelate |
| 9 | LinkedIn extension: add contacts from LinkedIn straight into the CRM | Crelate |
| 10 | ZoomInfo upload into the CRM | Crelate |
| 11 | Resume in, contact profile out (parse a resume into a profile) | Crelate |
| 12 | The look: "Loxo's skin is far more pretty than Crelate." | Loxo |

"Plenty more features, just dumping for now." Add them here as they come.

## Phases

1. **Mirror (now possible).** Nightly read-only copy of Crelate contacts, companies, job orders, pipeline stages and activities into a database Eden owns. First uses: call-back matching on missed calls, depth charts straight from the pipeline, lead-list dedupe, the scoreboard and ratios computed by Radar.
2. **Screens on the mirror.** Scoreboard and ratios (1, 2), job pipeline and client job dashboards with RP activity (4, 6, 7), tag browser (8), in the Eden visual standard with Loxo-level polish (12). A builder employee keeps the roadmap and reports at the Sunday lab review.
3. **Write paths.** Resume to profile (11), ZoomInfo upload (10), LinkedIn capture (9), client portal (5), resume search (3). These write to Crelate first, through its API, until the switch.
4. **Switch.** When the team has run a full week on the new screens and the write paths are proven.

## Crelate API facts (checked 11 Oct 2026)

- Public API v1 and v2 are switched off (HTTP 410). Use v3: base `https://app.crelate.com/api3/`, header `X-Api-Key: $CRELATE_API_KEY` (the key is in the environment's Network secrets).
- Crelate sits behind Cloudflare and refuses Python's default client (error 1010). Send a normal User-Agent (curl works).
- Responses are `{Data, Metadata, Errors}`. Contact records carry EEO fields (ethnicity, gender, disability), salary expectations and personal addresses: the mirror leaves EEO fields out entirely, and salary and home details never reach the paper, the hit list or any shared sheet.
