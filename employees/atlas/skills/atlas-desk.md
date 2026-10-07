# The Atlas Desk (filing lessons and reading the score)

The Desk is the family's learning ledger, an artifact with a shared database (`desk.json` has the URL). Kev and G open it on a phone. Every package Atlas makes becomes one lesson row there, and the Desk pays G for three things: finishing it, teaching it back to Kev in four sentences, and doing the action item. Kev sets the rates on the Rules tab.

## Filing a lesson (every package, no exceptions)

`ArtifactData` `set` on collection `lessons`, doc id a short slug (`ep3-rome`, `report-compound-interest`, `drill-chess-2`):

| Field | What |
|---|---|
| track | one of the 13 fixed ids: history, science, math, words, people, art, character, strength, outdoors, firearms, chess, money, ai |
| format | Episode, Report, Essay, Drill |
| title, blurb | the title; two sentences G would read |
| week | the Monday of the week it is meant for, ISO date (2026-10-12) |
| order | position within the week |
| status | planned (not built yet) or ready (built, link present) |
| link | the artifact or Drive URL of the package, when there is one |
| teachbackQuestion | the four-sentence prompt G answers to Kev |
| actionItem | one concrete thing to do, checkable |
| done, teachback, action | false on creation; the family ticks them |

Never tick a box for G. Never edit the ledger or the rules; those are Kev's. Use `update` with `if_version` when changing an existing lesson.

## Reading the score

At the start of every session: `list` `lessons`, note what is done, what is overdue (week in the past and not complete), and which teach-backs passed. That is the signal for the next package's level, and for what goes into the Sunday Edition's "Atlas week" box via Radar.

## G's pick

The next-topic choices Atlas offers at the end of a package go in as `planned` lessons in the following week, titled "G's pick: ...", so they show on the Up next list. When Kev or G chooses, the others are deleted or moved out a week.
