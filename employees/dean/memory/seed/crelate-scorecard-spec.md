# Crelate scorecard spec (seeded 19 October 2026)

From the Round Table builder Radar used for the week of 12 October 2026 (pulled Fri 16 Oct, 11:59 AM PT) and Radar's source notes (`employees/radar/memory/live/sources.md`, 11 Oct 2026). Verify the IDs on the first pull; Crelate can rename verbs.

## API

- Crelate API v3 only. Base `https://app.crelate.com/api3/`. v1 and v2 return 410.
- Header `X-Api-Key` from the `CRELATE_API_KEY` environment variable. Never print, paste, log or commit the key.
- Send a normal browser-like `User-Agent`; Cloudflare blocks Python's default client with error 1010.
- Activities: `GET activities?owner_ids=<id>&when_after=<ISO UTC>&limit=100&offset=<n>`; page until fewer than 100 rows. Fields used: `Id`, `VerbId.Id`, `ParentId.Title`, `When`.
- Read-only. Never copy EEO fields; salary and home addresses never leave Crelate. Swagger: `api3/swagger/v3/swagger.json`.

## Activity verb IDs (VerbId.Id to metric)

| Metric | Verb ID | Counted as |
|---|---|---|
| RP (recruiting call) | `996532fa-687f-43b7-240e-6c5d86f3dc08` | activities |
| MP (marketing call) | `90f0f186-ef1d-4179-ba68-bac188f3dc08` | unique contacts |
| JO (job order) | `64aed9c3-d354-4153-e90c-4bb0afefdc08` | unique contacts |
| Resume | `a8859da5-c9a9-4885-e332-6e6988f3dc08` | unique contacts |
| Screen | `2135627c-a762-4ed9-7438-fbafafefdc08` | unique contacts |
| PTC | `92c42981-6c7b-4525-a7fd-4d7e86f3dc08` | unique contacts |
| Submittal ("Submittal & Files") | `b92f0a4a-42f1-464a-c7ce-55ed88f3dc08` | unique contacts |
| FTI (first-time interview) | `edd73b17-5cfe-402c-6377-d9afafefdc08` | unique contacts |
| Referral ("Referrals") | `feb978cd-4ce9-47f2-fbfb-5dd45e4cdd08` | activities |
| LVM (left voicemail) | `18490d01-b81c-4f21-4b94-c66385f3dc08` | activities |

Unique contacts use `ParentId.Title`; when no parent is set, fall back to the activity count. Every other verb (Note, Changed Stage, Added To Job, Email Sent, Task, Industry Info, Flip Marketing, Interview/Meeting) is ignored.

## Crelate user IDs (owner_ids)

| Person | Page label | User ID(s) |
|---|---|---|
| Max Betcher | Headhunter | `89fa787a-070f-43a8-b3df-60de080410bb` |
| Evan MacArthur | Headhunter | `82fcd797-7b12-4612-a235-62de080301fa` |
| Noah Fields | Headhunter | `29b91eae-fc26-4455-b304-62de0803002e` |
| Andrew Johnson | Headhunter | `9c963c7a-ac1a-4f90-82e4-f6dd0803ea2d` |
| Bridger Stainbrook | Headhunter · Zoom | `83f31e94-56a1-435a-8974-bbde0802ba1a` |
| Nick Leckwold | Operations · Headhunter | `6964a256-20dd-4756-abfc-dedd08004293` and `f3559cdc-f847-486d-2c61-cba1d7f2dc08` (merge by activity Id) |
| Kevin Williams | Founder · Headhunter | `b3f4a630-5dd1-44a0-cc82-08f8b9f2dc08` |

## Known quirks

- Kev logs a very large number of Notes and Added To Job rows (bulk work); they are not metrics and are ignored.
- Andrew logs LVMs as their own activity (238 in the week of 12 Oct); other recruiters rarely do. Compare LVMs only within a person, not across the team.
- A bulk stage change is not a screen. If a count jumps by an order of magnitude, check the verb mix before publishing.
- The week runs Monday 00:00 to Friday 23:59 Pacific. Daylight time ends 1 November 2026: `when_after` moves from 07:00Z to 08:00Z.
