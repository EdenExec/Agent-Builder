# LinkedIn search (writing the searches the recruiters run)

You have no LinkedIn login and never automate one. You make every search better.

## 1. Recruiter saved-search spec (for the recruiter to build)

For each bucket and metro, write a block the recruiter copies field by field:

- Job titles: the Eden tag plus variants (from `zoominfo-search`), "current" only.
- Locations: the metro, plus a second search over the time zone or the Western states for the wide net.
- Industries: Construction; Civil Engineering for civil buckets.
- Companies: Tier 1 company types in the metro (list the names from the ZoomInfo pull); exclude every client (`memory/seed/clients.md`).
- Years of experience: PE 2 to 10, PM 5 to 15, Super 8 plus, unless the job says otherwise.
- Spotlights: Open to work, More likely to respond.
- Alert: daily email.

## 2. Boolean string

One per bucket. Titles in quotes, OR inside brackets, NOT the obvious noise:

`("project manager" OR "senior project manager") AND (construction OR contractor OR "general contractor") NOT (software OR IT OR marketing OR "real estate agent")`

Test it: write in the hand-off how many results it returned for the recruiter last time (from their report), and tighten it when the count is above 1,000.

## 3. Public profiles through the web

To fill a LinkedIn URL for a known person: web search `site:linkedin.com/in "<First Last>" "<Company>"`. Use the URL only when the name, company and title match. Never guess between two profiles; use the people-search link instead.

## 4. The wide-net job post

Kev owns posting. You draft the post (title with the metro and "relocation welcome", screening questions from Radar's market-map notes) as a `publish` QC item. Never post.
