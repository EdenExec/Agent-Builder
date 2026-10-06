# Market Map (the always-on talent bucket)

Kev, 6 October 2026: "We market map the entire US and have alerts set for each major metro we're working in." Build it once in Boise, then run the same play for every market on the Biz Dev hit list. The point is to always hawk the best incoming talent, not to build a list per job order.

## The idea in one line
For each title bucket and metro: a ZoomInfo pull tagged to the Crelate standard, a LinkedIn Recruiter saved search with a daily alert, a public LinkedIn job that casts the widest net ("based anywhere in the West, willing to relocate"), and a Crelate list the recruiters dial from. New names flow in on their own; the recruiters only call.

## Phases
1. **Phase 1, Boise (Hoffman, Micron fab).** Bucket: PE, Sr PE, APM, Field Engineer across GC, structural/concrete, steel, MEPFS. ZoomInfo metro `ID - Boise City` plus state Idaho. LinkedIn job "Project Engineer, Western US, relocation to Boise welcome". Recruiter saved search over the Western states with Open to Work on.
2. **Phase 2, the national PE bucket.** Same titles, every US metro, no job attached. One Crelate list per metro, one Recruiter alert per metro. This is the talent river every client search drinks from.
3. **Phase 3, PMs and Supers by trade.** PM, Sr PM, Superintendent, General Super, by MEPFS, Structural and GC. Same mechanics.
4. **Every market on the Biz Dev hit list.** When a metro goes on the hit list, it gets its buckets and alerts the same week, before the first client call, so Eden walks in with a depth chart.

## Mechanics (what Radar runs)
- **ZoomInfo pull.** One title per `search_contacts` call (multiple titles AND together and return nothing). `industryList` from lookup ids (`construction`, `construction.construction`), metro ids from lookup (`ID - Boise City`, `FL - Miami`, `DC - Washington`). Sort by accuracy, 50 per page, two pages per title. Tier 1 = the seat at a GC, CM or trade sub in the bucket's trades; Tier 2 = adjacent (civil, residential, developers). Exclude client staff and design firms. Enrich credits are spent on the current cycle: phone flags only, numbers from Crelate or LinkedIn until the reset.
- **Crelate load.** Tag to the standard in the tagging doc (Book, Sector, Company Type, Candidate Title, Verification, Location, Comp Range, Core Focus, General Tags with metro, bucket, source and date, "Not yet contacted"). One list per metro per bucket, named `<Bucket> - <Metro> - <Mon YYYY>`. Nida's team loads overnight or the owning recruiter loads it.
- **LinkedIn Recruiter.** A Project per bucket and metro. Saved search: titles in the bucket, industry Construction, location the metro (or the Western states for the wide net), "Open to work" and "More likely to respond" on, experience 2 to 10 years for PE buckets. Alert daily by email. Pipeline export 25 at a time, 100 a day; Radar dedupes, tags and loads.
- **LinkedIn job (the wide net).** Posted from Eden, confidential client, one per bucket. Location: the target metro, with the title carrying "Western US" and "relocation welcome". Screening questions: years as a PE, trades worked, Procore / Bluebeam / P6, willing to relocate to the metro, earliest start. Applicants land in Recruiter and get tagged into the metro bucket.
- **Alerts.** Three per metro: the Recruiter saved-search alert, a ZoomInfo re-pull on the first Monday of the month (new records only), and a job-applicant digest. Radar reads them in the sweep and adds new names to the bucket's sheet; the stand-up puts the hottest on tomorrow's call sheet.
- **Ownership.** Kev owns the posting and the Recruiter seat. Radar owns pulls, tagging, dedupe and the bucket sheets. The owning recruiter owns the dials and the depth chart.

## Sheets
RPA Lead Lists folder, one tiered sheet per bucket and metro, plus a Crelate load with the same name. Columns on the tiered sheet: #, Tier, Name, Title, Company, Trade, Ph, DNC, Accuracy, Fit note, Called, Result, ZoomInfo ID.

## Done when
A metro has its buckets in Crelate, a Recruiter alert firing daily, a live job, and new names appearing on call sheets without anyone asking.
