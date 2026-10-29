---
title: Eden brand contact sheet · design check
subtitle: Marlowe's check on Jenny's Draft 1 · 23 October 2026
author: Marlowe
date: 2026-10-23
toc: false
cover: false
compact: true
---

# Design check

## Executive summary

- **Verdict: not yet.** Show Kev **Mark 1 (parent), Mark 5 (Eden Crew) and Mark 6 (Eden Bench, alternate)** after one revision round. All three hold up; each has small geometry faults that Kev would notice.
- **Agree with Jenny's picks, 1 and 5.** They are the strongest pair because they share an idea: courses. Build them on one module and the family is visible without the tile.
- **Drop 2, 4, 7 and 8. Park 3 and 9.** Marks 2, 7 and 8 fall apart at 16 px, and Mark 4 reads as a bar chart.

## How I checked

- Sheet read on 23 Oct 2026 (Draft 1), with `brief.md`, `names.md` and `workshop/brand/eden.ts`. The artifact was not edited.
- Each mark was rasterised from the sheet's own SVG geometry at 16 and 32 px, on cream (#FAF8F3) and on ink (#151515), using area coverage like a browser's anti-aliasing. Pixel figures below come from that: at 16 px, 1 unit of the 100-unit box is 0.16 px.
- "Close to a known mark" means a common icon or trope by eye. **No trademark or design-code search was run.** Docket still does that.

<!-- pagebreak -->

## Mark by mark

| # | Hierarchy and proportion | 32 px / 16 px | Cream / ink | Family with Eden | Generic or lookalike risk | Call |
|---|---|---|---|---|---|---|
| 1 Course E | Clean monoline E: stem and bars both 14 units. Mark (y 16 to 84) overshoots the text block (cap top about 24, baseline 76) by 8 units at each end | 32: crisp. 16: the 6-unit stem gap is about 1 px and greys out | Good on both, but the bare mark is ink-only: as a fixed-colour favicon it vanishes on a dark browser tab | Strong: lifted from the bold-caps wordmark | Detached stem plus three bars reads as "IE" or a list/menu icon at small sizes | **Show, after fixes** |
| 2 Colonnade | Seven columns under a lintel, centre column pierces it. Busy for a primary mark | 32: stripes. 16: fails, grey barcode (columns 1.3 px, gaps 1 px, lintel 0.8 px) | Moiré on both | Strong story (Seven Pillars), but it is the Daily's internal device | Classical temple is the bank, law and university trope | **Drop as logo.** Keep it on the Daily |
| 3 Slant E | Solid italic E, the heaviest and simplest of the three | Best of the parent set at both sizes | Good on both | Good: echoes the bold italic title line | Bold italic E is a common initial mark; the slant says speed, not Eden's quiet register | **Park** as the fallback for 1 |
| 4 Foreman Line | Three headless bars, tallest in the middle. Figures do not read as people | 32: reads. 16: ground line (0.6 px) merges with the bars | Fine | Tile and lock-up only | Reads as a bar chart, signal or podium icon | **Drop** |
| 5 Running Bond | Right idea, loose geometry: top and bottom rows are 29 and 31 wide, joint off-centre at x 49; centre brick 26 wide against full bricks of 29 to 31 | 32: reads as brick. 16: head joints (4 units, 0.6 px) close up, leaving three bars | Good on cream; on ink the tile inverts to a bright cream square | Strong if built on Mark 1's courses | Brick wall is a stock UI and clip-art icon; owned only through Eden proportions | **Show, after fixes** |
| 6 Lintel | Clear and sturdy. Beam 60 by 14 on 36-unit legs reads as a table more than a bench | Crispest staffing mark: holds at both sizes | Good on both | Tile and lock-up; the beam echoes the colonnade's lintel | Reads as Greek pi or a table icon; a trilithon is common | **Show as the alternate,** after the bench fix |
| 7 Ready Row | Content sits high (top margin 28, bottom 38); seats float 8 units above the bench | 32: borderline. 16: fails; outlined seats (0.6 px strokes) blur into the filled one, so the idea is lost | Same failure on both | Tile only | Reads as UI checkboxes or carousel dots | **Drop** |
| 8 Vial | Neat, but the idea depends on 3-unit tick marks | 32: reads. 16: ticks (0.5 px) vanish; reads as a dot in a slot | Fine | Tile only; the only curve in the set | Spirit level is a stock tool icon; also reads as a toggle switch | **Drop** |
| 9 Datum | Quietest mark. "Square" is 20 by 22, so it reads as a mistake; content sits above centre | Holds at both; 4-unit line is faint at 16 | Good on both | Most Eden in register | Reads as the perpendicular sign ⊥ | **Park** with the Level name |

<!-- pagebreak -->

## What I would put in front of Kev

| Pick | Why |
|---|---|
| **Mark 1, Course E** (parent) | The most Eden of the parent set: it comes straight from the wordmark and stays quiet. Mark 3 is more legible but louder and more generic. |
| **Mark 5, Running Bond** (Eden Crew) | Pairs with Mark 1 by idea: the E's courses become the crew's courses. It is the only staffing mark that says "building" at a glance. |
| **Mark 6, Lintel** (Eden Bench, alternate) | The most robust small-size performer, and a literal bench once it is lowered. It lets Kev choose between the Crew and Bench names, not just between marks. |

Kev can then answer in one tap: "1 and 5" or "1 and 6".

## Must fix before Kev sees it

| # | Mark | Fix | Why |
|---|---|---|---|
| 1 | All lock-ups | Outline the type to paths and track it by hand. Drop `textLength` justification | Forced width adds wide, uneven letter-spacing and re-flows if Montserrat fails to load |
| 2 | 1 | Widen the stem gap from 6 to 9 or 10 units. Align the mark to EDEN's cap top and PARTNER GROUP's baseline | The gap is the mark's only distinctive feature and it greys out at 16 px. The mark currently overshoots the text by 8 units at each end |
| 3 | 1 | Add a tiled version (cream E knocked out of the ink tile) for the favicon, LinkedIn avatar and app icon | The bare ink E disappears on a dark tab. The tile also brings the parent into the family |
| 4 | 5 | Rebuild the bond on Mark 1's module: courses 14 high at y 16, 43 and 70; rows of 30 + 30 and 13 + 30 + 13; head joints 6 units or more | This fixes the unequal bricks and off-centre joint, keeps the joints open at 16 px, and makes 1 and 5 visibly one family |
| 5 | 4 to 9 | Set one lock-up rule: tile height close to the two-line text block (about 45 units now, against a 100-unit tile), and one mark-to-text gap for parent and staffing (42 and 24 units now) | The tile currently outweighs the name, and the two lock-ups do not match |
| 6 | 4 to 9 | Define the ink-ground version: keep the tile ink with a hairline edge, or drop the tile and draw the cut-outs in cream. Show it on the banner | On ink the tile turns into a bright cream square, the loudest thing on a quiet page |
| 7 | 6 | Lower and lengthen it: a seat about 68 wide on legs about 22 high | It should read as a bench, not as a table or pi |
| 8 | Card | Raise the descriptor line to at least 6.5 pt in print (about 5 pt now) | It is too small to read at arm's length |

## Worth raising, not blocking

- **Name weight.** In EDEN **bold** + CREW regular, the word that tells this line apart is the weaker one. Show one alternative with equal weights so Kev sees the trade-off.
- **Banner line.** "Executive search for construction" under Eden Partner Group runs into the naming question in the brief (the brand PDF assigns search to Eden Executive Search). Keep it as a placeholder until Kev answers that.
- **Lookalikes.** Ask Docket to check Marks 1, 5 and 6 first, since they are the ones going to Kev.
