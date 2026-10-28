---
title: Today, the Eden Daily inside the Command Center
org: eden
author: Marlowe
date: 2026-10-28
compact: true
---

## Executive summary

1. **Today is a top-level mode, not a column.** A Floor | Today switch in the header, `T` on the keyboard and `#today` in the link. The board stays on screen as a one-line ribbon, so the floor is one tap away.
2. **The centre of the screen is the work surface.** Three columns at 1920: the clock and run of day on the left, the live call sheet in the middle, must-hits, decisions and the check-out on the right. A Power Hour collapses it to the clock and the sheet.
3. **Radar sets the day the night before; ticks and the clock are live.** One `daily/{date}` doc in, one `daily/{date}/ticks/{key}` doc per tick out (names fixed by Q and Marlowe, 28 Oct; schema in `projects/virtual-office/daily-schema.md`). The PDF drops to a one-page front on the Desk, because an artifact cannot print.

Kev asked on 28 Oct: "I could go full screen and live inside the Command Center with only Crelate in a separate monitor." Q builds it into `draft/eden-office.html`. Three one-tap asks for Kev close the page.

<!-- pagebreak -->

## 1. Where it lives

| Option | Verdict |
|---|---|
| **Today mode (chosen)** | Swaps everything under the header. The call sheet needs about 1,000px, with Notes as its widest column, and a column beside the floor cannot give it that. |
| Column beside the floor | Rejected. At 1920 it leaves the sheet about 600px wide, and the floor's live lights pull the eye mid-dial. |
| Sheet or panel over the floor | Rejected. Panels are for a visit; Kev means to live in Today all day. |

- **One tap back.** The header gets a joined `Floor | Today` pair to the left of the switches. The board shrinks to a ribbon (the seven cells in one 40px row, matte black, on `--bd`). Tapping a cell opens Floor at that card. `Esc` from Today goes nowhere; `T` toggles.
- **Remembered per device.** The last mode is kept in `localStorage` as `eo-mode`, so the big monitor opens on Today and the phone on Floor. `#today` opens Today from any link. The existing hash handler gets one more case.
- **Same toggles, same meaning.** Screen share, Still and Dark work as they do now. Recruit mode turns on by itself during a Power Hour (section 5), so Radar's chat context and the floor both know Kev is dialing.

## 2. Layout

### 1920 x 1080, full screen

```
+--------------------------------------------------------------------------------------------------+
| COMMAND CENTER  [Floor|TODAY]  TUE 27 OCT · PILLAR 02 WINNING        Share  Still  Dark  Full scr |
| BOARD  open 7 · oldest 2h 10m · shipped 4 · fails 0 · needs Kev 3 · streak ...        Floor  ->  |
+----------------------+------------------------------------------------------+--------------------+
| NOW            10:42 | [QC 8:00 · 2/7]  [PH 11:00 MIAMI]  [PH 1:00 VMG]      | MUST-HITS          |
| QC calls · Casey     | POWER HOUR 11:00-12:00 PT · 2:00 ET · 25 names        | [x] 01 7:00 Send   |
| ======------  18m    | Opener: "a career-maker seat on ..."      Brief  v    |     retainers      |
| NEXT  11:00  in 18m  | CONN 07/20  ooooooo.............  DIALS 18 · VM 9     | [ ] 02 8:00 QC     |
| POWER HOUR · Miami   |------------------------------------------------------| [ ] 03 11:00 25    |
|----------------------| NAME           TITLE / COMPANY      PH SRC  D V C  NOTES |--------------------|
| RUN OF DAY · PT      | Carl Corso     Dir, Field Ops       -  CR?  x . .        | DECISIONS · 3      |
|  5:45 Pray ...       | > R. Ellerman  General Super        -  CR?  x x .  O     | Retainer terms ... |
|  7:00 Admin          |                Coastal Construction                       | My pick: Yes       |
|  8:00 QC calls       | Gavin Hancock  ...                                        | [Yes][No][Talk]    |
| |11:00 POWER HOUR    | ...                                  (25 rows, no scroll) |--------------------|
|  12:00 Weekly call   |                                                           | SCRIPTURE  >       |
| |1:00 POWER HOUR     |                                                           | 1 Tim 1:1-2        |
|  5:30 Check-out      |                                                           |--------------------|
|----------------------| O = continue chasing · F.U. = follow-up email   ? keys   | CHECK-OUT 5:30  >  |
| HABITS  Bib RP MP .. |                                                           | RPs 6/15 Conn 7/20 |
+----------------------+------------------------------------------------------+--------------------+
```

| Size | Columns | What moves |
|---|---|---|
| 1600px and up | 340px, fluid, 400px; `.wrap` widens to 1880px in Today only | Nothing scrolls at 1080 except a sheet longer than 25 names. |
| Laptop, 1100 to 1599px | 320px rail, fluid sheet | Decisions join the left rail under must-hits. Check-out and scripture drop below the sheet. Run of day shows the next four blocks plus "Full day". |
| Phone, 820px and down | One column | Order: now/next, must-hits, decisions, work surface, run of day, check-out, scripture. Call-sheet rows become cards: name and company, then D, V and C buttons at 44px, then a note line on tap. |

<!-- pagebreak -->

## 3. Sections, in reading order

| Section | Where | What it shows |
|---|---|---|
| **Now / next** | Left rail, top; matte black like the board | The time in 40px Plex Mono, the current block, minutes left as a hairline bar, the next block with "in 18m". During a Power Hour it adds the leads' local time ("2:14 PM in Miami"). Built on the existing `renderNext()` and the live calendar. |
| **Run of day** | Left rail | The day from the calendar. Power Hours carry a 3px ink rule, weight 700 and a POWER HOUR stamp, which works in both themes without gold. A hairline marks now; past blocks go mute. A tap on a Power Hour opens its sheet. |
| **Work surface** | Centre | Tabs: the QC must-calls, then one per Power Hour. The tab follows the clock (QC block, then each hour) unless Kev picks one. QC rows tick "Touched"; call-sheet rows tick Dial, VM and Conn, with an O or F.U. stamp and a note. Names are flush left with no index column, and Notes is the widest column (standing rule, 6 Oct). |
| **Connections count** | Top of the sheet | CONN 07/20 with the paper's 20 circles filling, plus dials and VM. It counts Conn ticks across every sheet today. |
| **Must-hits** | Right rail, top | Three, five at most: time stamp, one line, one line of why, a tick. Done rows go mute and stay in place, so nothing jumps. |
| **Decisions to answer** | Right rail | The existing Needs Kev strip, reused rather than copied. Radar files the night's decisions as needs-Kev alerts with "My pick". Yes, No and Talk write `actions/` exactly as they do on the floor. |
| **Scripture** | Right rail, one quiet line | "1 Timothy 1:1-2 · The greeting". A tap opens the study in the existing 880px sheet, a pen-free read. Its Done tick feeds the Bible habit. Hidden in a Power Hour. |
| **Habits and check-out** | Left rail foot (streaks); right rail foot (box) | The strip shows streaks from past check-outs, read only, with blanks where nothing was logged. The box stays one line until 5:00pm, then opens: RPs /15, Connections /20 (filled from ticks, editable), One win, One miss, today's habits, Send. |

<!-- pagebreak -->

## 4. Set the night before vs. live

| Set by Radar the night before (`daily/{date}`) | Live on the page |
|---|---|
| Must-hits, the call sheets (rows, brief, opener, leads' time zone), the QC list from the Team Hub, the study, the pillar and habit streaks, and a run-of-day snapshot | The clock and now/next (calendar via MCP, 60-second refetch, already wired) |
| The decisions, filed as needs-Kev alerts | The run of day: calendar edits Kev makes show within a minute, and the snapshot is only the fallback |
| Daytime additions such as a new hot callback are appended by a sweep with an "added 11:40" stamp | Every tick, note and count, through `onSnapshot`, so the phone and the big monitor agree |

- **Rollover at 3:00am local,** so a late check-out still lands on the right day. No `daily/{date}` yet means the page shows the calendar and a "Paper not built" line. It never shows yesterday's sheet as today's.
- **Sabbath:** from Friday sundown to Saturday sundown, Today shows the board's rest state and nothing else.
- **After the move to Boise on 6 Nov,** times follow the device clock (Mountain). Each sheet keeps its leads' zone. If an East Coast sheet sits after 1:00pm PT (2:00pm MT), the header shows an amber "past 4pm ET" stamp (rule of 27 Oct).

## 5. Behaviour

| Event | What it writes |
|---|---|
| Any tick on a call sheet | Merges `{d, v, c, out, note, at}` into `daily/{date}/ticks/row-{leadId}` (the lead id is `{sheet}-{NN}`). The write is optimistic, and notes save 600ms after typing stops. Counts are derived from ticks and never stored. |
| QC "Touched" | A tick (`touch-{qcId}`), plus one `actions/` row so that Radar logs the touch on the Team Hub next sweep and the red row clears. |
| Must-hit, scripture or check-out Send | A tick (`must-{id}`, `scripture-read`, `checkout-{field}`). Send also files a ticket to Radar, who reads the check-out for tomorrow's paper and habit strip. F.U. rows become follow-up drafts that wait for Kev's yes; nothing is sent. |

| Key (Today only; off while typing) | Action |
|---|---|
| `J` / `K` or arrow keys | Next or previous name |
| `Enter` | Copy the name to paste into Crelate search (clipboard inside the keydown; if refused, select the text) |
| `D` / `V` / `C` | Dial, VM or Conn. `V` moves to the next name; `C` opens the note. |
| `N`, then `Enter` | Write a note; `Enter` saves it and moves on. `Esc` leaves the note. |
| `O` / `F` | Stamp "continue chasing" or "follow-up email" |
| `Z`, `[` / `]`, `P`, `T`, `?` | Undo the last tick (ten deep); previous or next sheet; Power Hour focus; Floor or Today; the key card |

- **Power Hour focus.** It turns on by itself when a block titled POWER HOUR starts and Today is open. The screen becomes the clock and counts (30%) and the sheet (70%). Recruit mode switches on, so the floor greys and Radar holds interruptions. Only a red banner breaks through, as one slim line.
- **It ends by itself** at the block's end, with one line: "Dials 22 · VM 12 · Conn 6". `P` leaves early. A Full screen button calls `requestFullscreen` from a click and does nothing if refused.
- **Screen share hides the people.** In Today it keeps the clock, the counts and the run-of-day times. Names, companies, notes and decisions blank out, as calendar titles already do.

<!-- pagebreak -->

## 6. Style

| Token or rule | Use in Today |
|---|---|
| `--floor`, `--paper`, `--ink`, `--mute`, `--line`, `--soft` | All surfaces. Dark mode comes free from the existing three-block token set. |
| `--bd`, `--bd-fg`, `--bd-line` | The board ribbon and the now/next block: always matte black, the day's scoreboard |
| `--r` only | The TODAY stamp on QC rows. No other colour; ticks are ink. |
| Montserrat 400 to 700 | Names, blocks, must-hits and the study, at 13px and up, letter-spacing 0 |
| IBM Plex Mono 500 | Times, counts, stamps and labels; tracking 0.12em at most (paper typography rule) |
| Hairlines and boxes | 1px `--line` rules. Tick boxes are 18px with a 34px hit area (44px on a phone); the tick is an SVG stroke. No emoji. |
| The frieze | The seven pillar names in the ribbon's eyebrow, the day's pillar at weight 600: the paper's mark, quietly carried over |

## 7. The PDF: what goes, what stays

| Paper page | Fate |
|---|---|
| Front: habits, run of day, must-hits | **Stays** as a one-page PDF on the Eden Desk ("Front page" link in the Today header). The artifact frame blocks `window.print()`, so the page can never offer Print itself. |
| QC must-calls and both call sheets | **Move** to the work surface. Live ticks replace pen marks and the photo-back loop. |
| Study, check-out box, decisions page, notes grid | **Move** to the Today sheet and the check-out box. Decisions are answered on the strip. The notes grid becomes the check-out's "Tell Radar" line. |

## Kev's answers (28 Oct 2026)

| Ask | Answer |
|---|---|
| Desk print | **Only a one-page front stays printable.** No study, no call sheets on paper. |
| Power Hour focus | **Turns on by itself** when a POWER HOUR block starts. |
| Overlap | **The six-page PDF stops after Tue 3 Nov.** From Wed 4 Nov the routine builds the front page and the `daily/` doc only. |

## Asks for Kev (answered above; kept for the record)

| Ask | Options |
|---|---|
| Desk print | **Front page only** · front plus study · nothing |
| Power Hour focus | **Turns on by itself** · ask me at the start |
| Overlap | **Six-page PDF until Tue 3 Nov, then front only** · drop it now |

Assumptions: phone numbers stay in Crelate and the page carries only the M/D flags, as the paper does. The connections count includes call sheets only, and QC touches are counted apart. The page code writes `daily/.../ticks` as well as tickets, seen, actions and chats; the database rule needed is in `daily-schema.md` (one new rule, `daily`, admin read and write).
