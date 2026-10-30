# Market map · Data center low voltage (Texas, South Dakota, traveling), 30 Oct 2026

Scout, for Kev, Nick, Hoffman (Texas) and Megawatt (traveling data center). Sources: ZoomInfo search (0 credits) and web, 30 Oct 2026; Crelate read-only pull, 30 Oct 2026 (50,190 contacts). Internal, Eden only.

## The read

- **Texas is deep, South Dakota is thin.** ZoomInfo gives 404 low-voltage PMs in Texas, mostly in Houston (137) and DFW (Dallas 122, Fort Worth 36, Plano 18). South Dakota has 25, at Vikor, Muth Electric and Swiftec.
- **The bench is spread across many firms.** Convergint, Network Cabling Services, Cummings Electrical, Electra Link, Black Box, Melton, TSS, FireTron and Advanced Connections have the most PMs. Rosendin and Cupertino are union by reputation; everything else is unverified (Texas and South Dakota are right-to-work, so most Texas pure-play low-voltage firms are presumed open shop).
- **Crelate already holds 558 low-voltage PMs** (62 in Texas), and 663 of the 689 low-voltage people have a mobile. Low-voltage supers are thin under low-voltage tags (111 nationally, 2 in Texas), so Nick's supers are likely in a bucket that doesn't carry the tag.
- **"ICS" did not verify.** We found no data-center-focused low-voltage contractor by that name; the matches are small NC, MA and GA firms. Kev: what is ICS's full name or website?

## The lists (master leads folder, Lead Log)

| Ref | What | Rows | Use |
|---|---|---|---|
| EL-029 | Low-voltage PM talent pool: Texas, South Dakota, plus traveling data center | 435 (T1 98, T2 227, T3 110); 29 already in Crelate, 40 possible | Hoffman Amarillo/Texas and Megawatt traveling PM searches |
| EL-031 | Crelate reload: low-voltage PMs already in Crelate | 511 (T1 62 Texas, T2 5 data center, T3 444 national traveling) | Recruiters dial today; BPO adds existing records to a bucket by Crelate ID |
| EL-030 | Nick biz dev: field ops and ops leaders at low-voltage contractors | 95 at 31 firms (T1 27) | Nick, to win a new client in the space |

## Where they sit (EL-029, top employers)

Convergint 42, Network Cabling Services 40, Cummings Electrical 36, Electra Link 23, Rosendin 19 (union), Black Box 18, VSC Fire & Security 16, Melton 15, TSS 15, FireTron 12, Advanced Connections 11, Burr Computer Environments 11, Meriplex 11, Securitas Technology 10, Wachter 8.

## Biz dev targets for Nick (EL-030, Tier 1)

Black Box (Plano, data center operations group), Data Center Systems (Dallas), Electra Link (Spring, 300 staff, offices in Dallas, Austin, San Antonio), Linx, Muth Electric and Vikor (South Dakota), Network Cabling Services (Houston, 350), SitePro (hiring for Red Oak TX), Wachter (1,400, national rollouts).

## What Crelate already has

See `lv-crelate-pool-2026-10-30.md`. Tag fix worth making: one canonical "Low Voltage" company-type tag. Today LV people are spread across six spellings, so nobody can pull them with one click.

## Gaps and next pull

- Union status is unverified for almost every firm. Confirm on the first call, and record it as a tag.
- City for national firms is a placeholder (HQ), flagged in Note.
- Not pulled yet: Vikor, Teleco, Lan-Tel, SitePro, Mona, ArchKey PMs; I&C contractors (thin; I&C rows are Tier 3).
- Fiber, OSP and telecom title searches return carrier staff (AT&T, Zayo). Run those in LinkedIn Recruiter instead.

## Pull recipe

- ZoomInfo search_contacts, state filter TX or SD, titles: Project Manager, Senior PM, Assistant PM, Low Voltage PM, Structured Cabling PM, Technology PM, Security PM, Controls/BMS/EPMS PM, Data Center PM; plus companyIdList over the universe (`lv-contractor-universe-2026-10-30.md`).
- Biz dev: Director/VP/Head of Field Operations, VP or Director of Operations, COO, General Manager, and President at small firms.
- LinkedIn Recruiter Boolean (PMs): ("project manager" OR "senior project manager" OR "PM") AND ("low voltage" OR "structured cabling" OR fiber OR "Cat6" OR telecom OR "BMS" OR "EPMS" OR "access control") AND ("data center" OR hyperscale OR "mission critical") AND (Texas OR Dallas OR Houston OR Austin OR "San Antonio" OR Amarillo OR "South Dakota" OR "Sioux Falls")
- Exclusions: Eden clients (Hoffman, Megawatt and the rest), distributors, manufacturers, carriers.
