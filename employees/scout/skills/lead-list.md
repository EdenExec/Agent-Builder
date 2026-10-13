# Lead list (for a live job order)

Done means a recruiter opens one sheet and starts dialing, with nothing to look up.

## Steps

1. **Read the job.** Title, metro, company type the client wants people from, must-haves, and the client's own name. If the job order is thin, write the three questions for Radar and build the obvious list anyway.
2. **Plan the pull.** Titles from the Eden title tags plus their real-world variants (`zoominfo-search`), metro plus a commute radius or the wide net, company types in Tier 1 and Tier 2. Write the plan in the sheet's notes tab before pulling.
3. **Pull** from ZoomInfo, one title per call, two pages each (`zoominfo-search`). Add the LinkedIn Boolean string for the same bucket (`linkedin-search`) for the recruiter to run in Recruiter.
4. **Exclude clients** before anything else (`memory/seed/clients.md`): Moss names to a "Moss · referral asks only" tab, Baker rows marked "Client · discreet", every other active client removed unless Kev made an exception.
5. **Dedupe against Crelate** by LinkedIn URL, then name plus company (Q's mirror once it runs; until then Radar checks). Rows already in Crelate keep the owner and last activity date.
6. **Tier.** Tier 1: the seat, at a company type the client hires from, in the metro. Tier 2: adjacent title or company type, or willing-to-relocate distance. Tier 3: long shots, kept on a separate tab.
7. **Write the sheet** (below). One CSV per role, uploaded to the job's Drive folder as text, one file per call.
8. **Hand off.** One line to Radar: sheet link, counts (pulled, clients excluded, already in Crelate, new by tier), the Boolean string, and anything odd.

## Columns

#, Tier, Name, Title, Company, Company type, Trade, City, State, Time Zone, LinkedIn, In Crelate (owner, last activity), Fit note (one line), Source (ZoomInfo id or "LinkedIn search"), Note (client flags). Recruiters fill Called and Result.

- **LinkedIn is never blank:** the exact profile URL when known (ZoomInfo record, enrichment, web search); otherwise `https://www.linkedin.com/search/results/people/?keywords=<First Last Company>` URL-encoded.
- **City, State and Time Zone are three separate columns on every upload, every row.** Kev, 13 October: the BPO team uploads these sheets to Crelate, and Crelate picks up each tag only from its own column. Use those exact headers. City is the city name; State is the two-letter code (FL); Time Zone is one of PST, MST, CST, EST (`memory/seed/buckets.md`). Use where the person lives when known; otherwise the company office's city, with "office location" in Note. Never one combined Metro or Location column.
- No personal email, no personal phone, no comp.

## Quality bar

At least 25 Tier 1 names for a common title in a large metro, or a note saying why the market is thinner. Fewer than 10% of rows bounce as wrong person or wrong company when the recruiter checks.
