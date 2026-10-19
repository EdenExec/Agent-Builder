---
title: Bucket Refresh Plan, Monday 19 October 2026
org: epg
---

# Bucket refresh plan, Monday 19 October 2026

Result: every JO now has a fresh bucket (592 rows across 11 CSVs, all pulled from ZoomInfo search on 19 Oct, nothing enriched, nothing loaded or sent). Rank order is PB South, VMG, Triton, then the new inbound JOs. Flag key: GAP = no usable bucket, THIN = under 25 usable rows, STALE = older than 14 days or wrong metro, AGING = 8 to 14 days.

## Ranked map

| # | JO | Existing bucket (leads, built) | Flag | Fresh pull 19 Oct (rows) | Suggested owner |
|---|---|---|---|---|---|
| 1 | PB South WPB Field Engineer (GC or sub) | Miami PE 65 (9 Oct, Pool A). Nothing in West Palm Beach | GAP | `pb-south-wpb-field-engineer` (60) | Evan |
| 2 | PB South WPB Safety | Miami Safety Manager 51 (9 Oct). Nothing in West Palm Beach | GAP, THIN | `pb-south-wpb-safety` (24) | Noah |
| 3 | VMG Project Executive / MD, DC metro | None for PX/MD. Neighbours: Supers DC 25 (12 Oct, Andrew), APM/PE 23 (13 Oct), Sr PE/APM Mid-Atlantic 101 (5 Oct) | GAP | `vmg-px-md-dc` (122) | Andrew |
| 4 | Triton MEP and lead supers, Miami and WPB/South Beach | None for supers. Triton PM Miami 344 (14 Oct) and purchasing 368 (6 Oct) are other seats | GAP | `triton-supers-miami-wpb` (57) | Max |
| 5 | Moss Interior Superintendent, Surfside FL | None. "Moss referral asks" 19 is client staff, not leads | GAP | `moss-interior-superintendent` (34) | Evan |
| 6 | Moss VDC/BIM x2, Fort Lauderdale | None for Moss. PB South Pool B BIM Manager 57 (12 Oct) is the same pool | GAP, overlap | `moss-vdc-bim-fort-lauderdale` (26) | Noah |
| 7 | Moss Preconstruction Manager, South FL | None for Moss. SoFla estimating and procurement 66 (12 Oct) overlaps | GAP, overlap | `moss-preconstruction-manager` (44) | Max |
| 8 | Hoffman Low Voltage Supers, Amarillo | None. Hoffman Supers Boise and Texas (Crelate, 29 Apr) is data-center supers | GAP, STALE | `hoffman-amarillo-low-voltage-supers` (77) | Evan |
| 9 | Hoffman Boise PEs/PMs (HSI) | PE bucket 339 (6 Oct). No PM bucket | AGING (PE), GAP (PM) | `hoffman-boise-pm-pe` (70) | Max |
| 10 | Hoffman Area Supers, Houston (Big H) | None for Houston | GAP | `hoffman-houston-area-supers` (40) | Noah |
| 11 | Prometheus Sr Construction Manager, retail TI | One exists: 27 rows (built 2 Oct, edited 13 Oct, Andrew). 17 of 27 are Skyline or NOVO, 24 are LinkedIn search links | THIN, concentrated | `prometheus-sr-construction-manager-retail-ti` (38) | Andrew |

Files are in `employees/scout/sheets/`, named `2026-10-19-<client>-<role>.csv`. Each row has Tier, a LinkedIn people-search link, City, State, Time Zone as separate columns, a fit note and the ZoomInfo id. Tiers: 1 is the seat at the right company type, 2 is adjacent, 3 is a long shot (sorted last, same file).

## Three things to know

- **Owners are suggestions.** Andrew already carries VMG Supers and Prometheus, so he takes only the same-client VMG PX/MD. The rest are spread three each across Evan, Noah and Max. Kev decides.
- **Overlaps are flagged, not removed.** Moss VDC/BIM rows also on PB South Pool B (BIM) and Moss precon rows also on the SoFla estimating list carry "Also on PB South..." in Note. Prometheus rows already on Andrew's sheet are marked too. Recruiters should coordinate before dialing.
- **Location is metro-level.** ZoomInfo search returns no city, no LinkedIn URL and no phone. City is the metro anchor, with that stated in Note. In the Amarillo file, 53 of 77 rows have a blank City and 30 have a blank State and Time Zone (a national low-voltage pool); the BPO team should not load those until the location is confirmed.

## Pull recipes (ZoomInfo search_contacts, one title per call, sort by accuracy, 19 Oct)

| Sheet | Titles | Location filter | Other filters |
|---|---|---|---|
| vmg-px-md-dc | Project Executive (3 pages), Senior Project Executive, VP of Operations, VP, MEP-keyword PX | DC - Washington, person location | Construction industry; "Managing Director" title returned architects and developers, so MD level is covered by VP Ops, EVP and Division VP at contractors |
| pb-south-wpb-* | Field Engineer, Project Engineer; Safety Manager, Safety Director, Site Safety Manager | FL - West Palm Beach | Construction industry |
| triton-supers | MEP Superintendent (Miami, WPB), Lead Superintendent, Senior Superintendent | FL - Miami, FL - West Palm Beach | Construction industry |
| moss-* | Interior, Finish and Interiors Superintendent, Senior Superintendent; VDC Manager, BIM Manager, VDC Coordinator, VDC Engineer; Preconstruction Manager | FL - Miami (includes Broward), FL - West Palm Beach | Moss excluded by company name |
| hoffman-amarillo | Low Voltage Superintendent, Special Systems Superintendent (US-wide), Superintendent (Amarillo) | TX - Amarillo; state checks TX, NM, AZ, FL, GA, VA, NC, CA | None |
| hoffman-boise | Senior Project Manager, Project Manager, Senior Project Engineer | ID - Boise City | 28 Tier 1 company ids from `maps/boise-2026-10.md` |
| hoffman-houston | Area Superintendent, General Superintendent | TX - Houston | Construction industry |
| prometheus | Senior Project Manager at Skyline, NOVO, Level 10, Plant; Senior Construction Manager; Construction Manager at retail owners | CA - San Francisco | Retail industry for owner side |

## Clients and rules applied

- Excluded by company: Moss, Promethean Builders (PB South), Vertical Mechanical Group (VMG; vmgmech.com, found today), Triton Construction, Hoffman, Pence Kelly, Fortis, Megawatt, Carmel, Prometheus, Swinerton. Baker rows carry "Client · discreet".
- No homebuilders and no civil (Kev, 11 Oct). No phones, personal emails or comp on any row. Crelate dedupe is Pending on every row (Q's mirror not run); Nida dedupes on load.
- Credits: 0 spent. No enrich, no redeem, no contact_research.

## Blockers and open points

- ZoomInfo is authorized and search worked. The one hard limit is that search omits city, state and LinkedIn URL; a clean City/State on every row needs enrichment (a spend item for Kev) or a LinkedIn check.
- "MD level" is read as Managing Director level; if Peter meant Maryland, the DC-metro file already includes MD suburbs, so no re-pull is needed.
- Safety in West Palm Beach is the thinnest market (24). Broaden to Broward and Miami-Dade Safety (the 9 Oct Pool A list has 51) or run the LinkedIn Recruiter string.
