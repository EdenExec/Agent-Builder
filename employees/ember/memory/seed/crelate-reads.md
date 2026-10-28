# Crelate reads (seeded 28 October 2026)

The rules are `projects/recruiter-desk/crelate-in-claude.md`; this file holds the ids and what is verified. GET only, always.

## Basics

- Base: `https://app.crelate.com/api3/`. Header `X-Api-Key: $CRELATE_API_KEY` from the environment; never print it, never write it to a file.
- Cloudflare blocks default clients (error 1010): use curl with a browser User-Agent, as `workshop/workforce/recruiting-board.ts` does.
- Responses are `{Data, Metadata, Errors}`. Page with `limit` and `offset`; back off on a 429. If `Errors` says a filter was ignored, stop: the read would be the whole company.
- Ask for the fields you need with `fields=` where the endpoint takes it. Contact records hold EEO fields, salary expectations, home addresses and personal phones and emails: never request them on purpose, never copy them if they come back.

## Endpoints

| Read | Endpoint | Status |
|---|---|---|
| Jobs in a column (finds the Warm cards and the MPC buckets) | `jobs?statuses=<column ids>&fields=Id,JobNum,Name,SalesWorkflowItemStatusId` | Verified (crelate-in-claude.md; used by recruiting-board.ts) |
| Who is on a job and who moved them, with dates | `jobs/<jobId>/contacts/history?created_after=<ISO date>` | Verified. That adding someone to a card shows as a history row is an assumption: confirm on the first run |
| Touches and screens | `activities?verb_ids=<ids>&when_after=<ISO date>&fields=Id,VerbId,RegardingId,ParentId,When,Owners,CreatedById` | Verified |
| Find a person by name | `contacts/search?query=First%20Last` (record `Title` is "Last, First") | Verified |
| Current members of a job | `jobs/<jobId>/contacts` | UNVERIFIED |
| One contact, limited fields (name, title, company) | `contacts/<id>?fields=...` | UNVERIFIED (field names too) |
| Contacts by tag, or a `Tags` field on a contact | `contacts?tags=...` or similar | UNVERIFIED |
| Note text (for note keywords) | `activities` with a Note verb id, and the body field | UNVERIFIED (verb id and field unknown) |
| Email and call activity types | verb ids | UNVERIFIED |
| `contacts?search=` | ignores the search term | Known broken: never use |

Q verifies an UNVERIFIED read with one GET before Ember relies on it, and records the result here through Radar.

## Activity type ids (read from Crelate, 21 Oct 2026, `projects/recruiter-desk/pipeline-cleanup-2026-10-21.md`)

| Type | Id |
|---|---|
| RP | `996532fa-687f-43b7-240e-6c5d86f3dc08` |
| MP | `90f0f186-ef1d-4179-ba68-bac188f3dc08` |
| Screen | `2135627c-a762-4ed9-7438-fbafafefdc08` |
| Set Call | `9530ddb7-fa54-4e8a-255e-5eb0afefdc08` |
| Resume | `a8859da5-c9a9-4885-e332-6e6988f3dc08` |
| PTC | `92c42981-6c7b-4525-a7fd-4d7e86f3dc08` |
| Submittal & Files | `b92f0a4a-42f1-464a-c7ce-55ed88f3dc08` |
| FTI | `edd73b17-5cfe-402c-6377-d9afafefdc08` |

## Board column ids (`SalesWorkflowItemStatusId`)

| Column | Id | Ember reads it for |
|---|---|---|
| Leads / Buckets | `f813eba0-9d99-4c7a-43c8-90b4afefdc08` | The Warm cards and the existing MPC buckets |
| RETAINED | `0c13de6f-e565-415e-c0ef-993e114add08` | In-process check (Casey's lane) |
| TOP Priority | `0da0478c-2d78-407a-a8f1-99f87446dd08` | In-process check |
| GO NOW | `5a236fa5-7ea5-48dc-6f0e-b7f87446dd08` | In-process check |
| Typical | `e6fa493f-f5d0-4e05-904a-cbde08041886` | In-process check |
| Filled | `3b392950-0160-4c12-b810-c1b4afefdc08` | Placed recently (Casey's lane) |

## MPC buckets that already exist (21 Oct 2026 cleanup, moved to Leads / Buckets)

| Card | Name | Owner then |
|---|---|---|
| #8060 | Megawatt - MPC Bucket | Nick |
| #7315 | Pence Kelly - MPC Bucket | Nick |

Until Kev decides the tag plan, anyone on a Leads / Buckets card whose name contains "MPC" counts as tagged `MPC` (pre-plan mode, `skills/crelate-cadence.md`).

## Crelate users to recruiters

`ROSTER` in `workshop/workforce/recruiting-board.ts` maps each Crelate user id to a slug (max, evan, noah, andrew, bridger, kunji, kyle, nick, kev). A user id not on it is "owner: Kev to name".
