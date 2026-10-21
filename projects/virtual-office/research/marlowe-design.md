---
title: Eden Office, floor and design spec
org: eden
author: Marlowe
date: 2026-10-21
---

## Executive summary

1. **Draw it as an architect's plan, not an isometric game.** Top-down, north up, hairline walls, level labels. It reads on a phone and every click target is exact.
2. **Keep the floor quiet so the lights can speak.** Ink on cream, matte dark at night. The only saturated pixels on the page are the desk lights, each under 16px.
3. **Paper on a desk, a lamp, a light.** Physical cues carry state, with no numbers on the floor. Clicking a desk sits you down: the desk grows into a sheet.

Mock: `research/marlowe-floor-mock.html`, example data. Checked in headless Chromium at 1280px and 390px, light and dark: no horizontal scroll, no script errors. Scout's Do/Don't rules are folded in.

## 1. Research: what makes a workspace worth returning to

| Principle | Source | What Eden Office takes |
|---|---|---|
| Calm technology moves "from the periphery of our attention, to the center, and back" | Weiser and Brown, Xerox PARC, 1995 | Working agents stay peripheral. Only what needs Kev comes to the centre (the strip). |
| "Technology should require the smallest possible amount of attention"; "can communicate, but doesn't need to speak" | Amber Case, principles of calm technology | No sound, no toasts, no badges on the tab. |
| "Good design is unobtrusive"; "Less, but better" | Dieter Rams, ten principles (Vitsœ) | One light per desk, one strip, four levers. Nothing decorative. |
| "No fuzz… as little design as possible"; "removing [features] is the hard part" | Teenage Engineering, XLR8R Q&A, 29 May 2015 | Levers drawn as hardware keys with a 2px travel. Remove before adding. |
| "Don't compete for attention you haven't earned"; "structure should be felt not seen" | Linear, "A calmer interface", 12 Mar 2026 | Dashed zone lines. Only the principal seat gets a full ink border. |
| Flat design's big problem is "the lack of signifiers on clickable elements" | NN/g, Kate Moran, 27 Sep 2015 | Desks get a hairline shadow and press 1px. Flat, but clearly touchable. |
| Apple's sleep light "mimics the rhythm of breathing" (patent US 6,658,577, 2002) | 512 Pixels, 2010 (secondary) | "Working" breathes at 12 a minute, on the glow only. |
| Communication falls off sharply with distance (about 50m) | Allen curve, Thomas Allen, MIT, late 1970s | Seat by who talks: Tally beside Docket, Revenue between Recruiting and Finance. |
| Prospect and refuge: we like a protected back with a view out | Appleton; Hildebrand, *Origins of Architectural Pleasure*, 1999 | Radar's seat has a credenza behind it and the whole floor ahead. |
| Blinking over 5s needs a way to "pause, stop, or hide it"; nothing flashes over 3 times a second | WCAG 2.2, SC 2.2.2 and 2.3.1 | The "Still" switch. Every blink at 3 Hz or slower. |
| "Color is not used as the only visual means of conveying information" | WCAG 2.2, SC 1.4.1 | Every state has a shape and a word. |

<!-- pagebreak -->

## 2. The floor plan

Adjacency was set as an architect's matrix before drawing. North is up. Benches line the north glazing, as studios do, for even light. The entry is south-west, by Client Work, so client material stays at the door.

```
 N  ─ glazing ──────────────────────────────────────────────
 │ 01 RECRUITING (Scout Dean Host) │02 REV│ 03 FINANCE (Tally│Docket) │
 │ 04 PEOPLE (ramp, University)│05 Q │ RADAR (principal) ║ 07 FAMILY  │
 │ 06 CLIENT WORK (glass)      │     │ ▭ credenza        ║ own wing   │
 └─door──────────── colonnade of seven ─────────────────────────────┘
```

| Pair | Relationship | Why |
|---|---|---|
| Radar to every desk | Clear sightline ("Plan notes" draws them) | Kev sits here and sees the room. |
| Tally and Docket | Side by side | The "two keys" check, re-derived blind next door. |
| Revenue | Between Recruiting and Finance | Tally and Dean share it: the seam of the business. |
| Dean, the ramp, Eden University | Adjacent, west side | One owner, one walk. |
| Q and Radar | Adjacent | Q builds the Office; the levers run through him. |
| Client Work and everything else | Glass partition, link only | Counts here, names stay in the Hub. |
| Family office and the business | Separate wing, own wall and door | KDTW Group. The door closes on Screen-share. |

**Screen-share:** Finance, Revenue, the coaching bench and the Family wing hatch over as "Closed". Task text hides and the strip shows state words only.

## 3. The desk object

- **At a glance:** name plate (Montserrat 800 caps), role (Plex Mono), the light top right with a "+1" count of lower states, and the current task in two lines at most.
- **Physical cues:** a chair arc marks the seat. Open tickets show as one to three stacked sheets. After dusk a working desk takes a warm lamp tint.
- **Meta line:** the state word and "last heard" (6m). **Stale** shows when an agent misses its rhythm, so a green glow never lies.

Benches carry no light and no figures: name, owner, update time, click through.

<!-- pagebreak -->

## 4. The light

| State | Shape | Motion | Rank |
|---|---|---|---|
| Urgent | Diamond | Full on/off, 1 Hz | 1 |
| Reply | Square | BlackBerry double flash, 150ms on, 150 off, 150 on, every 3s | 2 |
| Done, ready to look | Dot inside a ring | One 0.6s flash every 3s | 3 |
| Blocked on Kev | Bar | Steady | 4 |
| Working | Dot | Steady core, glow breathes at 12 a minute | 5 |
| Idle | Hollow | None | |

- **Size and glow:** 10px on a desk, 12px in the sheet. A 6px halo plus a 16px bloom, 38% strength in light mode, 70% in dark. The hit target is the whole desk.
- **Calm, not anxious:** blinks are full on/off, since faint pulses go unnoticed (Scout, FAA). All lights share one clock, so they flash in unison, not twinkle. A blink stops once Kev sits at that desk, or holds steady after 30 minutes.
- **Stillness:** the "Still" switch freezes every light, remembered per device. Under `prefers-reduced-motion` nothing blinks or breathes; shape and word carry it.

## 5. Sitting down

1. **Press (80ms):** the desk sinks 1px.
2. **Sit (320ms, cubic-bezier .2 .7 .2 1):** the sheet grows out of the desk's own rectangle (FLIP); the floor dims to 28% and leans in 2.5%; content fades in late.
3. **The sheet is a desk:** in-tray (tickets) left, blotter centre (task now, last five log lines), drawer right (Status report, Hand a ticket, the agent's own desk). The drawer notes that a ticket is delegation, never approval.

Stand up with Esc, the button or a tap outside (200ms); focus returns to the desk. Each desk has a plain anchor (`#tally`). Reduced motion: a 150ms crossfade.

<!-- pagebreak -->

## 6. Colour tokens

| Token | Light | Dark |
|---|---|---|
| floor | #F3F0E8 | #121210 |
| paper (desk) | #FCFBF7 | #1B1A17 |
| ink | #141412 | #EEEBE3 |
| mute | #5E5B54 | #A8A397 |
| line | #D9D4C8 | #33312B |
| soft (bench) | #EAE6DC | #201F1B |
| wall | #141412 | #8E897D |
| lens (light off) | #D6D1C5 | #2D2B26 |
| green / blue / red / amber | #2E8A55 / #2F66AE / #B03A2E / #A8730F | #5FCF8A / #72A6F0 / #F07462 / #E7B04C |

Ink, mute and line come from the org chart, so the pages feel like one building. Lights run deeper on cream, brighter on matte black.

## 7. Typography

- **Montserrat:** 800 for plates and wordmark (tracked .12 to .14em), 700 for bench titles, 400 to 600 for tasks at 12.5 to 15px.
- **IBM Plex Mono 500:** stamps, roles, counts, times, levers; caps tracked .08 to .16em, 9.5 to 11px.
- **Nothing else:** no other faces, no italics on the floor.

## 8. Phone (390px)

- **A walk through the room:** strip, Radar, Recruiting, Finance, Revenue, People, Q, Client, Family. Desks two across.
- **Thumb zone:** the four levers move to a fixed bottom dock, clear of the safe area. Sitting down is a 92% bottom sheet.
- **Dropped:** glazing, door swing, sightlines, north arrow, sun patch. The colonnade stays.

<!-- pagebreak -->

## 9. Three delights for coming back (no streaks, no guilt)

1. **The room keeps time.** Daylight through the south glass crosses the floor with the hour; after dusk, working desks show a lamp. Nothing to collect, just a room alive at that hour.
2. **The colonnade.** Seven columns along the south façade; the day's pillar is drawn solid, as on The Eden Daily (Wednesday, 03 Accountability). Hidden in plain sight.
3. **The out tray.** On Radar's desk, a sheet drops in for each thing shipped today. It empties at midnight and is never compared with yesterday.

Craft, not delight: a title block ("1 desk = 1 agent"), north arrow and door swing. **Never:** streaks, badges, confetti, sound, avatars or "you've been away" (confirmshaming, per Brignull's deceptive patterns).

## Assumptions and asks for Kev (one tap each)

| Ask | Options, recommendation first | If silent |
|---|---|---|
| Header name | **A. "Eden Partner Group · KDTW Group"**, with the Family wing marked KDTW · B. KDTW Group only · C. Eden only | A |
| Blink expiry | **A. 30 minutes, then steady** · B. Until seen | A |
| Default theme | **A. Follow the device** · B. Dark after sunset | A |

Assumed: light states follow Radar's brief table; the mock's tasks, counts and times are invented. Google Fonts was blocked in my sandbox check, so layout was verified with fallback faces, not Montserrat.

<!-- pagebreak -->

## Sources

| Source | Link |
|---|---|
| Weiser and Brown, "Designing Calm Technology" (1995) | https://calmtech.com/papers/designing-calm-technology |
| Amber Case, principles of calm technology | https://www.caseorganic.com/post/principles-of-calm-technology |
| Vitsœ, Good design (Rams) | https://vitsoe.com/gb/about/good-design |
| XLR8R, Q&A: Teenage Engineering (29 May 2015) | https://xlr8r.com/?p=54283 |
| Linear, "A calmer interface for a product in motion" (12 Mar 2026) | https://linear.app/now/behind-the-latest-design-refresh |
| MacStories, Things 3 review | https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/ |
| NN/g, Flat design and Flat 2.0 (2015) | https://www.nngroup.com/articles/flat-design/ |
| 512 Pixels, On sleep indicators (2010) | https://512pixels.net/2010/08/on-sleep-indicators/ |
| Allen curve | https://en.wikipedia.org/wiki/Allen_curve |
| Prospect and refuge, Hildebrand | https://www.forewordreviews.com/reviews/origins-of-architectural-pleasure |
| Adjacency matrix and bubble diagram | https://illustrarch.com/?p=79132, https://openlab.citytech.cuny.edu/arch3510fall2018/?p=6488 |
| WCAG 2.2, SC 2.2.2 | https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide |
| WCAG 2.2, SC 2.3.1 | https://w3c.github.io/wcag/understanding/three-flashes |
| WCAG 2.2, SC 1.4.1 | https://www.w3.org/WAI/WCAG22/Understanding/use-of-color |
| MDN, prefers-reduced-motion | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion |
| Deceptive patterns (Gray et al. taxonomy) | https://courses.cs.washington.edu/courses/cse340/22sp/slides/wk09/Dark-Patterns-Deceptive-Design.pdf |
| BlackBerry LED | https://itpro.com/mobile/mobile-phones/364102/how-to-stop-the-red-flashing-light-on-blackberry-phones |
| Scout, `research/scout-virtual-office.md` (21 Oct 2026) | local file |
