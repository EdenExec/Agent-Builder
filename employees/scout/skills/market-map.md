# Market map (the talent pools in every core market)

Kev, 6 October 2026: "We market map the entire US and have alerts set for each major metro we're working in." Kev, 11 October: "Scout should market map the talent pools for all of our core markets." The original play and its mechanics are in `employees/radar/skills/market-map.md`; Scout owns it from 11 October and Radar reads what Scout files.

## What a market map is

For one metro, one page (an artifact on the Eden Desk, Eden Partner Group) and one sheet behind it:

1. **The pool by bucket.** Rows: the Eden title tags (Superintendent, General Superintendent, Project Manager, PX, APM, PE, Estimator). Columns: company types (GC, Mechanical, Electrical, Drywall, Concrete, Civil, Owner Builder, CM, Owner's Rep). Each cell: how many people ZoomInfo shows, and how many are already in Crelate.
2. **Where they sit.** The top 15 employers in the metro by headcount in the buckets, with company type, sector and client flag.
3. **Who is moving.** Companies with a signal this month (layoff, lost or won project, leadership change, new office) and the bucket people at them.
4. **The pull recipe.** Titles, metro ids, filters and the Boolean string, so the next refresh repeats it exactly.
5. **Date and source** on every number: "ZoomInfo, pulled <date>".

## Order of markets

1. Markets with live searches first (Kev's answer on the hit list sets the list; until then Miami and West Palm Beach for PB South and Triton, and Boise for Hoffman).
2. Then the markets in the Eden App bucket mockup, one time zone at a time (`memory/seed/buckets.md`).

## Rhythm

- Build: one metro at a time, title by title. A metro is done when every cell has a number and the recipe is written.
- Refresh: first Monday of the month, new records only; flag the movers to Radar for the stand-up.
- Never on Saturday.

## Done when

A recruiter can open the map for any core market, see where the people are, and start a list from it in minutes.
