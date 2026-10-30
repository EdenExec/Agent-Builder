# EL-022 notes · PB South demo-to-vertical superintendent, Miami (26 Oct 2026)

**Result:** 97 rows, 27 Tier 1, 52 Tier 2, 18 Tier 3. Sheet: `employees/scout/sheets/2026-10-26-pb-south-demo-to-vertical-superintendent-miami.csv`. Ticket t-202610261720-scdm.

## How it was pulled (ZoomInfo, 26 Oct)
- Miami metro, industry Commercial & Residential Construction, titles Senior Superintendent (pages 1 and 2, 171 total) and Superintendent (page 1 of 2,796).
- 12 high-rise GC company ids (Suffolk, Skanska, Coastal Construction Group, Coastal Construction, Turner, Rycon, Balfour Beatty, Brasfield & Gorrie, Robins & Morton, Shawmut, Lemartec, ANF Group), FL state: Superintendent (page 1 of 528) and General Superintendent (47).
- Project Superintendent, Miami metro, 14 GC ids (18 results).

## Tier rules
- **Tier 1 (27):** Miami-metro super-level title at a GC with SE Florida high-rise work, ZoomInfo record validated since June 2025.
- **Tier 2 (52):** Miami-metro supers at other GCs (high-rise unverified), stale records, or high-rise GC supers found by FL state only (city unconfirmed).
- **Tier 3 (18):** General Superintendents at the high-rise GCs, above the seat; only if mid-career and wanting the full demo-to-top-out run.

## Read this first
- ZoomInfo carries no project history, so "high-rise (30+ floors) and demo on past projects" is NOT verified for any row. Company is the proxy. The recruiter confirms with screening questions 1, 4, 5 and 6 in the Must Dos.
- No age filter. Tenure (10 to 20 years) is not in ZoomInfo either; screen on the call.
- Turner supers are flagged: Turner's Florida team reportedly wound down (internal), so they may be available.
- LinkedIn is a people-search link on every row (no exact profile URLs from ZoomInfo search). Crelate status reads "Pending": Radar or Q's mirror must dedupe before dialing. I did not touch Crelate.
- City is "Miami" as the metro anchor for every row (search returns no city); confirm on the call.

## Exclusions
- Client check (`clients.md`): no PB South, Promethean, Triton, Swinerton or other client rows included.
- **Moss, referral asks only (not on the sheet):** Senior Superintendents seen in the pull: Andrew Vigus, Brian Carswell, Joshua Rains, Trevor Bartlett, Matthew Cruit, Dennis Apilado, Michael Greer, Brett Marshall, Charles Byrd, Katlin Clay, Abraham Palacios, Sean Steen, Joel Balderas, Jason Williams, Matthew Kay, Bill Martin, Anthony Austin (trade-specific Moss titles left out).
- Dropped: subcontractors and trade supers (electrical, MEP, drywall, roofing, glass, elevator, structural), civil and paving, residential builders, assistant supers, Related staff (none seen), demolition contractors (none surfaced).
- Robins & Morton and Lemartec sit in Tier 2/3 because their Florida high-rise footprint is thin.

## Boolean for LinkedIn Recruiter (paste)
`("senior superintendent" OR "project superintendent" OR "superintendent") AND (demolition OR "selective demo" OR "demo" OR "teardown" OR "implosion") AND (high-rise OR "high rise" OR tower OR condominium OR condo) AND (Miami OR "Fort Lauderdale" OR "Miami-Dade" OR Broward OR Brickell OR "Palm Beach") NOT (estimator OR "project manager" OR "demolition contractor" OR "Brandenburg" OR "Spectrum Demolition")`
Saved-search spec: location Greater Miami + Fort Lauderdale; titles Superintendent, Senior Superintendent, Project Superintendent; current industry Construction; years of experience 10-20; keywords demolition AND high-rise; exclude current company Moss, PB South, Promethean, Related.

## Not done
- Not uploaded to Drive, not linked, no Lead Log refresh. Not loaded to Crelate (never by me).
- Seen but not used: the 9 Oct Project X Demo sheet (43 names, Pool B) is not in the repo, so no re-screen was possible.
- Next best step: Radar dedupes against Crelate, then I add exact LinkedIn URLs for Tier 1 within the 25/day enrichment allowance if wanted.
