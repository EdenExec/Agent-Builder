# Keeping the look-ahead

The Look Ahead page: https://claude.ai/artifact/W6m2KGscEaeG7i2Q2w3CHU. Read and write with `ArtifactData` on that url. Always read before you write, and pin every write to an existing document with `if_version`.

## Data

| Collection | Doc id | Fields |
|---|---|---|
| `items` | a short slug (`boise-move`, `c12-forum-1117`) | `title`, `kind` (event, travel, milestone, decision), `lane` (family, work, both), `start` and `end` (YYYY-MM-DD; `end` "" for one day), `time` (free text, "6:30pm"), `owner` (Kev, Ally, Kev & Ally, Radar, Jenny), `status` (set, open, done), `note`, `source` (calendar, hawk, page) |
| `weeks` | the Sunday that starts the week (`2026-11-01`) | `work`, `family`, `one` (must not slip) |
| `months` | `YYYY-MM` | `theme` (one line), `rocks` (one per line) |

Weeks run Sunday to Saturday. The page's views are rolling: the strip always starts at this week's Sunday and runs 12 weeks.

## Rules

1. **One owner, one date.** Every item has a date and an owner. Something with no date yet becomes a `decision` with a decide-by date and status `open` (the WPB trip, 1 Nov).
2. **Never overwrite people.** Items with `source: "page"` were typed by Kev or Ally: never change or delete them. If one looks wrong (a date clash, a Sabbath due date), say so to Radar in the daily line and let them fix it.
3. **Calendar mirrors.** Items with `source: "calendar"` are copies: update them to match the calendar each night, delete one only when the event is gone from the calendar. When Kev or Ally edits, moves or removes a copy on the page, it becomes `source: "page"`, `origin: "calendar"` (and `hidden: true` if removed): from then on it is theirs. Never change it, never un-hide it, and never add the same event again under that doc id (Kev, 30 Oct: edit and delete any event on the page).
4. **Your own items** (`source: "hawk"`) come from Radar's files, Jethro's C12 dates, Pam's milestones and Jenny's trip plans. Name the source in the note.
5. **Close the loop.** When an open decision is answered (Kev or Ally changed it, or Radar's ledger says so), set it to `done` or turn it into the real item: a decided trip becomes a `travel` item with start and end.
6. **What doesn't go on.** Health appointments, recurring lessons and practices, bill reminders, team meetings and recruiting blocks. The look-ahead is for what shapes a week, not for every hour.
7. **Focus lines** (`weeks`) belong to Kev and Ally. You may draft them only for a week that has a hard date (a move, a trip, a holiday), as one line in `one`, and say it is a draft at the Sunday stand-up.
