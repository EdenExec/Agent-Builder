# PB South five lists, 27 Oct 2026 (ticket t-202610271935-scpb)

Pulled 27 Oct from ZoomInfo (search only, 0 credits spent, no enrichment). Not yet in Drive, not yet staged to projects/leads, not deduped against Crelate (Crelate untouched; Radar/Nida dedupe on load).

| Ref | Sheet | Rows (T1/T2/T3) | Owner |
|---|---|---|---|
| EL-023 | bench-pm-west-palm-beach | 53 (38/15/0) | Max |
| EL-024 | vertical-transportation-sme-miami | 32 (14/18/0) | open |
| EL-025 | mep-project-executive-miami (+ Moss referral tab, 5) | 16 (6/9/1) | open |
| EL-026 | junior-mep-inspections-doc-control-miami | 26 (15/11/0) | Kev |
| EL-027 | field-operations-leader-backups-miami (+ Moss referral tab, 2) | 7 (3/4/0) | Kev |

## Caveats
- Search returns no city, LinkedIn URL or years of experience. City = company office (flagged in Note); LinkedIn = people-search link per row.
- ZoomInfo's Miami/WPB metro filter returns national firms too; Tier 1 is limited to firms headquartered in the metro. Tier 2 = national GCs with a SoFla office or lower accuracy.
- VT: Florida residence of OEM rows is unverified (state filter did not return location). Market is thin in ZoomInfo (about 14 real fits); run the Boolean below in Recruiter.
- PX: MEP background is not visible in ZoomInfo; only Jorda (MEP sub) is a clear fit.
- Junior role: years-of-experience filter was rejected by the connector, so level is inferred from title.
- Field ops: $500M+ tower experience not visible; Joey Walker excluded as the incumbent. Only 3 Tier 1.
- Excluded: Moss (referral tabs), Swinerton and all clients, Kolter and Meritage (homebuilders), Carrier and non-construction hits.

## Booleans (LinkedIn Recruiter)
- VT: ("vertical transportation" OR elevator OR escalator) AND (Otis OR KONE OR Schindler OR "TK Elevator" OR Thyssenkrupp OR "Lerch Bates" OR "Syska" OR "Walker Consultants") AND ("project manager" OR "construction manager" OR "field engineer" OR consultant OR "installation manager") AND (Florida OR Miami OR "Palm Beach" OR Broward)
- Bench PM: ("project manager" OR "senior project manager") AND (high-rise OR "mixed-use" OR commercial) AND ("general contractor" OR construction) AND ("West Palm Beach" OR "Palm Beach" OR Broward OR "Boca Raton") NOT (homes OR residential OR civil)
- MEP PX: ("project executive" OR "senior project manager" OR "MEP manager") AND (MEP OR mechanical OR electrical OR plumbing) AND (Miami OR "South Florida" OR Broward) AND (high-rise OR tower)
- Junior: ("project engineer" OR "field engineer" OR "assistant project manager" OR "document control" OR "permit coordinator") AND (Procore) AND (Miami OR Broward) AND (inspections OR permitting OR firestopping)
- Field ops: ("general superintendent" OR "director of field operations" OR "field operations manager") AND (high-rise OR tower) AND (Miami OR "South Florida") AND ("$500M" OR "$1B" OR "billion")
