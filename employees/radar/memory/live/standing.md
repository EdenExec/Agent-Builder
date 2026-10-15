- 2026-10-14: 2026-10-13 (Kev): mobile and direct numbers from Crelate MAY go on internal recruiter lead sheets (Eden-only Drive folders shared with named recruiters, never client-facing, never the hub, never shared outside Eden). 'If our job is to eliminate friction for the recruiter, include the mobile phone numbers.'

## Wednesday Headhunter Training (Kev, 14 Oct 2026)
- Tuesdays 5pm the Eden Recruiter Training project (a separate Claude project Radar can't see) drops a draft in Kev's Gmail. Same format every week: Note taker; Ice breaker (being a better conversationalist: a case study from our work or a role-play question); recap of the last 2-3 weeks (what we have put into action); two concepts, one construction and one recruiting; lightning-round check-out (each person's key takeaways); the note taker uploads the notes to the training project.
- Kev fills in the draft. Radar picks it up in the Tuesday night stand-up, builds the training pages into Wednesday's paper and a separate Letter PDF for the team, and never sends the draft.

## Crelate: loading leads into a job (14 Oct 2026)
- API v3: `POST jobs/{jobId}/contacts?contact_ids=<comma-separated ids>` with body `{"statusName":"Dawg Pound"}` (the lead-pool stage; stages from `GET workflowstatuses`). Verify with `GET jobs/{jobId}/contacts/history`. Spec: `api3/swagger/v3/swagger.json`.
- Only on Kev's say-so per job (a write to Crelate). First run: 344 Miami/Broward PMs into "Triton Construction Company - PM and Sr. PM - Miami" (job 8868), client-staff rows (Baker, Moss, Hoffman) left out.
- 2026-10-15: 2026-10-15 (Kev): Field Engineer seats (PB South WPB and anywhere else): GC side or sub side are both fine. Never write 'not from a GC' as a requirement again; lead lists and depth charts take both.
