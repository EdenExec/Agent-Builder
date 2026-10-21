---
title: Eden Office and Round Table, polish pass 1
org: eden
author: Marlowe
date: 2026-10-21
---

## Executive summary

1. **The floor closes up.** Q's empty bay is gone. Radar takes row two, Client work runs along the south wall to the door, and the Family wing goes three desks across. The page is about 130px shorter at 1280px.
2. **One weight per job.** Item rows drop from six identical boxes to a joined Done | Follow up pair (Done in ink), one Zzz, and quiet text links for Read draft, Open and Seen.
3. **Phone and dark mode fixed.** Jenny's sheet was stuck at three columns on phones; it is now one column. At night the keys draw in wall grey, so the lights stay the brightest things on the floor.

Checked in headless Chromium at 1280px and 390px, light and dark: no console errors and no sideways scroll. `office.test.ts` passes 21 of 21. CSS and markup only; no data logic changed.

<!-- pagebreak -->

## Office (`draft/eden-office.html`)

| Area | Change |
|---|---|
| Floor grid | Row two: People 4, Radar 3, Family 5 columns. Row three: Client work 7. Radar is top-aligned. Home list sits at the foot of the wing. |
| Door | 44px. Swings out, as an egress door does, clear of Client work. |
| Desks | Meta reserves two lines, so hairlines align when "Ready to look" wraps. Role tracking eased, so "Counsel and risk" fits on one line. |
| Benches | Revenue reads top-down, with its title in line with Recruiting and Finance. Client quick links run four across in mute, a step below Radar's levers. |
| Header | Clock and sync on one line. Upload drawn as a key (an action), not a switch. Switches are one height, 36px. |
| Strip | Zzz options form one dashed chooser; Cancel is a text link. On phones, actions sit under the text and the header wraps cleanly. |
| Sheet | Item rows: look, decide, dismiss. Rank and age set as mono stamps. Jenny's tray leads with "To answer", then "In tray". Drawer links out become a hairline list with an arrow. |
| Upload | Thumbnail at its true size, not stretched. Send and Create keys take their own width. |
| Phone | Fixes the `wide-tray` three-column bug. Switches 2 by 2 at 40px. Small buttons 34px tall. Sheet header: name and Stand up on one row. Chat Send goes under the box. |
| Dark | New `--key` token: ink by day, wall grey (#8E897D) at night. |

<!-- pagebreak -->

## Round Table (`workforce/draft/round-table.html`)

| Area | Change |
|---|---|
| Trend chart | Capped at 600px, so labels no longer render at 2x. Labels carry a paper halo where they cross the standard line. |
| Tables | Baseline-aligned, so "Down" sits level with the figures. |
| Phone | Tabs on one scrolling row instead of three ragged rows. Headline tiles go two across. |
| Consistency | Switches match the Office: 36px tall, 40px on phones. |

## Left as is (for Radar or Kev)

- **The banner repeats the strip's first red item.** That is behaviour, not CSS. Recommend that the strip skip the item the banner holds.
- **Fonts.** Google Fonts were blocked in my sandbox. I checked with local Montserrat Regular and Bold; Plex Mono fell back to the system mono.

Screenshots: scratchpad `shots/before/` and `shots/after/` (paths in the hand-back).
