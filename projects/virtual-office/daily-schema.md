---
title: The Eden Daily as data
org: eden
author: Q
date: 2026-10-28
compact: true
---

## Result

The Command Center database now holds the paper as `daily/{YYYY-MM-DD}` (written nightly by `npm run daily -- build`) and Kev's live marks as `daily/{date}/ticks/{kind}-{ref}` (written only by the page and the check-out). Today, Wed 28 Oct, is written (version 1). Code: `workshop/core/daily.ts`, `workshop/office/daily.ts`; tests: `workshop/core/daily.test.ts`. Marlowe's view spec: `research/today-view-design.md`.

## The document `daily/{date}`

| Field | Shape |
|---|---|
| `schema, date, dow, label` | 1, "2026-10-28", "Wednesday", "Wednesday, October 28" |
| `pillar, scripture` | `{n, name, verse}` from the weekday (Mon 01 to Sun 07); scripture ref string, held until Kev says move on |
| `habits` | `{bible, rps, mps, workout, drinks, wisdom, agency, growth, weight}`, all "" until the check-out; a rebuild keeps what is filled |
| `streaks` | same keys, a whole number from the past check-out rows or `null` (never inferred) |
| `run` | `[{at "HH:MM" PT 24h, title, note, powerHour, sheetId}]`, sorted. A snapshot: the page prefers the live calendar and falls back to this |
| `must` | `[{id m1.., addedAt, at, title, note}]`, 3 to 5 |
| `decisions` | `[{id d1.., text, pick, alertId}]`; Radar also files each as a needs-Kev alert and puts its key in `alertId` |
| `qc` | `[{id q1.., addedAt, name, clientSeat, date, lastTouch, do, today, group, asOf}]`; a discreet client is "Client · discreet" |
| `sheets` | `[{id, title, eyebrow, window {pt, et} "HH:MM-HH:MM", tz, eastCoast, brief, opener, sub, url, leads: [{id {sheet}-{NN}, addedAt, name, title, company, ph, src, crelateUrl, linkedin, note}]}]` |
| `study` | `{ref, text, setting, words [{word, orig, note}], reflect [text], prayer, memory}` or null |
| `sources, builtAt, builtBy` | where it came from (short strings), ISO time, "radar" or "q" |

`ph` is a flag only: `M`, `D`, `M D` or `—`. `addedAt` is null for items set the night before and an ISO time for items a daytime sweep added (the page shows "added 11:40"). Rollover is the page's job: it reads the doc whose date is the device clock minus 3 hours. No doc for that date means "Paper not built"; it never shows yesterday's.

## Kev's ticks `daily/{date}/ticks/{kind}-{ref}`

| Kind | Ref | Fields |
|---|---|---|
| `row` | lead id (`vmg-est-precon-07`) | `d, v, c` true/false, `out` "" / "O" / "F.U.", `note` (600 chars), `at` |
| `must` | must id | `value` true/false, `at` |
| `touch` | qc id | `value`, `at` (the page also files an `actions/` row so Radar logs the touch on the Team Hub) |
| `habit` | habit key | `value` as Kev enters it, `at` |
| `scripture` | `read` | `value`, `at` (feeds the Bible habit) |
| `checkout` | `rps`, `conn`, `win`, `miss`, `note`, `sent` | `value`, `at` |

One document per thing ticked; a re-tick overwrites; the latest `at` wins. Dial, VM, Conn and the O/F.U. stamp are one `row` document so three quick taps never race. Counts (connections, dials, RPs) are derived from ticks and never stored. The nightly writer replaces `daily/{date}` only; it never touches `ticks`, so a rebuild cannot erase a tick.

## What the writer will not write

Pay, comp, phones, personal emails, home addresses, health detail and EEO fields never reach the document. It is a whitelist (unknown keys are dropped), free text is scrubbed, a lead's phone must already be a flag (a number stops the build; it is never guessed), only Crelate and LinkedIn links are accepted, and `assertSafe` re-checks the finished document. Every redaction is logged by field and reason, never by content.

## Database rules the page needs

The Command Center is declared with five rules, all `write: "admin"`, root `read: "view"`. Kev is admin as owner, so his ticks and Radar's nightly write (which runs as Kev) already pass the root rule. One rule is new, for privacy not for access:

```
{"path": "daily", "read": "admin", "write": "admin"}
```

It covers the document and the `ticks` subcollection beneath it. Read is `admin` rather than `view` because the document carries candidate names, QC rows and decisions; a teammate who is later given view access to the floor must not read the day's call sheets. No `interact` rule is needed: nobody but Kev writes ticks. The full list at publish becomes root, `tickets`, `seen`, `actions`, `chats` (unchanged) plus `daily`. Kev sets this when he publishes; nothing here republishes the page.

## Running it

```
npm run daily -- build 2026-10-29 --in <paper-data.json> [--version N] [--existing get.json] [--out dir]
npm run daily -- check <doc.json>
```

Then one `ArtifactData batch` with `<out>/writes-1.json` (pinned with `if_version` on a rebuild). The stand-up routine dumps `<paper-data.json>` from the same arrays it prints the PDF from, so the paper and the page cannot disagree. Seed for 28 Oct: `projects/virtual-office/daily/2026-10-28.input.json`.
