# XL Construction: ZoomInfo web-app recipes (4 Nov 2026)

Scout can't click in the ZoomInfo web app or save a web list, so no list URL exists yet. These are the filters to build it by hand (or have Noah/Kev build it), plus free counts from search-only calls (0 credits).

## Do the four staged sheets need rebuilding?
No. Concrete estimator (162), PM (418), safety/demo (100) and senior PM (213) landed 2 Nov and pass the check. The calls and tiers are fine. Only the phone columns are stale: senior PM has none, and the concrete/safety phones came from per-record pulls. The web export fills the phone gaps; the rows stay.

## Free counts (has-mobile filter on, Bay Area = San Francisco + San Jose metros)
| Role | Filter | Has-mobile count | Note |
|---|---|---|---|
| EL-033 Sr PM | Title "Senior Project Manager", industry Construction, 100+ employees | 1,827 | Too broad: add company filter below |
| EL-034 PM | Title "Project Manager", same | 7,717 | Far too broad: use pool companies only |
| EL-035 Safety/demo | Safety/EHS titles, keywords demolition OR decommissioning OR abatement | 19 | Small, export all |
| EL-036 Concrete est. | Estimator titles, description "concrete" | 309 | Loose (paving firms appear): drop non-structural-concrete firms |

## Web-app recipe (each role)
1. Contacts search. Location: San Francisco Bay Area (SF + San Jose metros). Job title as above.
2. Company: pool list for XL: Suffolk, Webcor, Build Group, DPR, Hathaway Dinwiddie, Rudolph and Sletten, Skanska, Turner, Holder, McCarthy, plus self-perform concrete firms for the estimator.
3. Exclude: Swinerton, Megawatt, Triton, PB South, VMG, Hoffman, Pence Kelly, Fortis, Carmel, Promethean, Prometheus. Moss people go to a separate referral tab. Baker rows are marked "Client · discreet".
4. Contact data: "Has mobile phone" ticked. Remove Do Not Call.
5. Save as a list named `2026-11-04 · XL · <role> · Bay Area`. Review, then Export (CSV).
6. Drop the CSV in the Leads Buckets Drive folder (1U6zVA_rBsft6mwYLjQ5F1Pr_DRz1OUg9). BPO cleans, tags, and loads Crelate.

## Credits
Upper bound is the has-mobile count minus anyone under management or already in the staged sheets. I did not run managed-record counts, so there is no firm estimate. Cap each export to the new, unmanaged rows.

## Open
- `memory/live/seats.md` does not exist. No seat is confirmed, so I am not naming one. The kev1 seat ran out of credits on 3 Nov. Kev or Docket needs to confirm which seat has credits.
- Unverified: whether web export uses the same credit pool as per-record enrich.

## Narrowed counts (4 Nov, search only, 0 credits)
Pool companies only (Suffolk, Webcor, Build Group, DPR, Hathaway Dinwiddie, Rudolph and Sletten, Skanska, Turner, Holder, McCarthy), San Francisco metro, has-mobile on:
- EL-033 Sr PM: 86 (was 1,827)
- EL-034 PM: 338 (was 7,717; title match overlaps Sr PM, so the real new count is lower)
Upper bound for both: about 424 credits before removing managed records, DNC and rows already in the staged sheets. Some hits are mobile DNC (first sample was), so expect fewer.
