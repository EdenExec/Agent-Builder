---
title: Bucket Refresh Plan, Monday 19 October 2026
org: epg
---

> SUPERSEDED (19 Oct, Kev's correction): `2026-10-19-vmg-px-md-dc.csv` (122 rows, "Project Executive / MD level") is replaced by five role files below. The seat is Project Executive, not Managing Director. The old file is kept for reference and is not in the Drive folder. Its PX-titled rows were reused in the new PX file.

# Bucket refresh plan, Monday 19 October 2026

Result: every JO has a fresh bucket, 967 rows across 15 sheets, all from ZoomInfo search (nothing enriched, nothing loaded or sent). Each sheet is a Google Sheet in the Drive folder "JO Meeting · Lead Buckets · Mon Oct 19" (https://drive.google.com/drive/folders/1U6zVA_rBsft6mwYLjQ5F1Pr_DRz1OUg9); the "Who's taking what" Doc sits in the same folder. Each CSV has a "Suggested owner" column and an empty "Owner" column for Kev. Flag key: GAP = no usable bucket, THIN = under 25 usable rows, AGING = 8 to 14 days.

## Ranked map

| # | Client | Role | Leads | Flag | Sheet | Suggested owner | Owner |
|---|---|---|---|---|---|---|---|
| 1 | PB South | WPB Field Engineer (GC or sub) | 60 | GAP | [open](https://docs.google.com/spreadsheets/d/1ovBpIyQ9A_b81__hLk4KD8PY60-IH0keGpuRtw4AVso/edit) (`pb-south-wpb-field-engineer`) | Evan | |
| 2 | PB South | WPB, Broward and Miami-Dade Safety | 77 | GAP, expanded 19 Oct | [open](https://docs.google.com/spreadsheets/d/1JBZ0Ers2-XVfRoGuZEElmEHudPUwsDW3u7vXKfLipjM/edit) (`pb-south-wpb-safety`) | Noah | |
| 3 | VMG | Project Executive, Baltimore or DC | 131 | GAP | [open](https://docs.google.com/spreadsheets/d/1t3djWsl6660MHqqL2i3iNcN5Deso3w49QVpCxT1LXXc/edit) (`vmg-project-executive-baltimore-dc`) | Andrew | |
| 4 | VMG | VDC Manager, Reston VA | 28 | GAP | [open](https://docs.google.com/spreadsheets/d/1VD78hxFaVK1SmB0L5_Z43D3lCTabZZVZoHKTE4EfNko/edit) (`vmg-vdc-manager-reston`) | Noah | |
| 5 | VMG | Superintendents, DC metro | 96 | 8 rows overlap Andrew's 25 | [open](https://docs.google.com/spreadsheets/d/14RNwIaNfCVg3a0L507lClwK1ufW-_oB7oquDYp0Ky9Q/edit) (`vmg-superintendents-dc`) | Andrew | |
| 6 | VMG | Project Managers, DC metro | 82 | GAP | [open](https://docs.google.com/spreadsheets/d/1Ru7pK8IRd-Rfi_BBcqTP4xxUP6Hr2GzkZpZdRB8eUfw/edit) (`vmg-project-managers-dc`) | Max | |
| 7 | VMG | Project Engineers, DC metro | 107 | 24 rows overlap the 101 Sr PE/APM sheet | [open](https://docs.google.com/spreadsheets/d/1WY3QyGkeDXTWOWPHLu0dgxoPPLTYq6gu4q5FGIOeICU/edit) (`vmg-project-engineers-dc`) | Evan | |
| 8 | Triton | MEP and Lead Superintendents, Miami and WPB | 57 | GAP | [open](https://docs.google.com/spreadsheets/d/1UsSHarrlvYngqm-GiYMcHWgDGjmzKtn5xCaZoYkRIl8/edit) (`triton-supers-miami-wpb`) | Max | |
| 9 | Moss | Interior Superintendent, Surfside FL | 34 | GAP | [open](https://docs.google.com/spreadsheets/d/1mYgElQcfk3yyhD8XNINji1tTy3KBsJ5aqtzu-tOF4Do/edit) (`moss-interior-superintendent`) | Evan | |
| 10 | Moss | VDC / BIM x2, Fort Lauderdale | 26 | GAP, 14 overlap PB South Pool B | [open](https://docs.google.com/spreadsheets/d/1pAVP_QD0x537lXIdP152v_4Qm-Doeb59nOrT81swGU4/edit) (`moss-vdc-bim-fort-lauderdale`) | Noah | |
| 11 | Moss | Preconstruction Manager, South FL | 44 | GAP, 10 overlap SoFla estimating | [open](https://docs.google.com/spreadsheets/d/1eE1YLiNynw4r1WFv3PEifsy1hAN21Btim9-L9o4WbWE/edit) (`moss-preconstruction-manager`) | Max | |
| 12 | Hoffman | Low Voltage Superintendents, Amarillo TX | 77 | GAP, 24 Amarillo matches | [open](https://docs.google.com/spreadsheets/d/1UbtgGjRXQsyu3q2Tydc9qkV6jidQXMrjN_RAGJ1kjjc/edit) (`hoffman-amarillo-low-voltage-supers`) | Evan | |
| 13 | Hoffman | PMs and PEs, Boise ID (HSI) | 70 | AGING PE, GAP PM | [open](https://docs.google.com/spreadsheets/d/1WZU6mOJSfX6X3Z-tB51_NQhrtfug2H8NWGBHjpNXoug/edit) (`hoffman-boise-pm-pe`) | Max | |
| 14 | Hoffman | Area Superintendents, Houston TX | 40 | GAP | [open](https://docs.google.com/spreadsheets/d/1cJmTGARwDsMCeUdI2ajkVH-agX2BWAhzq4MV4PhV3pw/edit) (`hoffman-houston-area-supers`) | Noah | |
| 15 | Prometheus | Sr Construction Manager, Retail TI | 38 | THIN, 8 on Andrew's sheet | [open](https://docs.google.com/spreadsheets/d/1dmN6eZIpSEHD6yMofH7f3n6YXjf723f8ce1LSn2rh6M/edit) (`prometheus-sr-construction-manager-retail-ti`) | Andrew | |

CSVs are in `employees/scout/sheets/`, named `2026-10-19-<client>-<role>.csv`. Each row has Tier, a LinkedIn people-search link, City, State and Time Zone as separate columns, a fit note, the ZoomInfo id, and a Note. Tiers: 1 is the seat at the right company type, 2 is adjacent, 3 is a long shot (sorted last, same file). On the VMG files, mechanical and MEP contractors sort first inside Tier 1, then GCs.

## VMG, rebuilt as five role files

- **PX (131).** Baltimore (39) and DC (92) Project Executives, 120 at Tier 1. The old file's PX rows carried over; VP and operations titles dropped.
- **Field roles.** VDC Manager 28 (DC metro, seat is Reston VA), Superintendents 96, Project Managers 82, Project Engineers 107.
- **Dedupe against Andrew's sheets.** Overlaps are flagged in Note, not removed: 8 on the VMG Supers sheet (25), 1 on the APM/PE sheet (23), 25 on the Sr PE/APM sheet (101). None of the VMG depth-chart PX names (Zach Melton, Thomas Filardo) returned from ZoomInfo.

## Things to know

- **Owners are suggestions.** Andrew keeps VMG PX, VMG Supers and Prometheus; Max, Evan and Noah take the rest. Kev fills in the Owner column.
- **Overlaps.** Moss VDC/BIM rows also on PB South Pool B (14) and Moss precon rows also on the SoFla estimating list (10) carry an "Also on PB South..." note. Prometheus rows already on Andrew's sheet (8) are marked. Coordinate before dialing.
- **Location is metro-level.** ZoomInfo search returns no city, no LinkedIn URL and no phone. City is the metro anchor, stated in Note. In the Amarillo file 50 of 77 rows have no city (a national low-voltage pool) and 24 are Amarillo-metro matches; do not load the blank ones until the location is confirmed.

## Pull recipes (ZoomInfo search_contacts, sort by accuracy, 19 Oct)

| Sheet | Titles | Location filter | Other filters |
|---|---|---|---|
| vmg PX | Project Executive, Senior Project Executive | DC - Washington and MD - Baltimore, person location | Construction industry |
| vmg VDC, Supers, PM, PE | VDC Manager; Superintendent; Project Manager, Senior PM; Project Engineer, Senior PE | DC - Washington, person location | Company ids: 17 mechanical/MEP contractors and 17 DC-area GCs |
| pb-south WPB FE, Safety | Field Engineer, Project Engineer; Safety Manager, Director, Site Safety Manager | FL - West Palm Beach; Safety also FL - Miami (includes Broward and Miami-Dade) | Construction industry |
| triton supers | MEP Superintendent, Lead Superintendent, Senior Superintendent | FL - Miami, FL - West Palm Beach | Construction industry |
| moss | Interior and Finish Superintendent; VDC and BIM Manager; Preconstruction Manager | FL - Miami, FL - West Palm Beach | Moss excluded by company name |
| hoffman Amarillo, Boise, Houston | Low Voltage Superintendent; PM and PE; Area and General Superintendent | TX - Amarillo (plus state checks); ID - Boise City; TX - Houston | Boise: 28 Tier 1 company ids from `maps/boise-2026-10.md` |
| prometheus | Senior Project Manager; Construction Manager at retail owners | CA - San Francisco | Retail industry for owner side |

## Clients and rules applied

- Excluded by company: Moss, Promethean Builders (PB South), Vertical Mechanical Group (VMG), Triton Construction, Hoffman, Pence Kelly, Fortis, Megawatt, Carmel, Prometheus, Swinerton. Baker rows carry "Client · discreet".
- No homebuilders and no civil (Kev, 11 Oct). No phones, personal emails or comp on any row. Crelate status is Pending on every row (Q's mirror not run); dedupe on load.
- Credits: 0 spent. No enrich, no redeem. Internal Eden-only sheets, not shared with anyone.

## Open points

- A clean City and State on every row needs enrichment (a spend item for Kev) or a LinkedIn check.
- The Safety bucket now covers West Palm Beach, Broward and Miami-Dade; its City column says West Palm Beach or Miami (Broward and Miami-Dade share the Miami metro).
