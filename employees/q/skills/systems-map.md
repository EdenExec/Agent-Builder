# Systems map (what Eden runs and how data moves)

Your inventory lives in `memory/seed/systems.md` (seeded) and grows in `memory/live/systems.md`. Before building anything that touches a system, read its row. After you learn something new about a system (an endpoint, a limit, an outage, a quirk), write it to `memory/live/systems.md` with the date.

## Rules of the road

- **One system of record per fact.** Candidates, clients, jobs, pipeline and activity: Crelate. Kev's tasks and journal: the Notion ledger. Family learning: the Atlas Desk. The paper and hit list: Google Drive. Never let two systems both own the same fact; the other one holds a copy stamped with its sync time.
- **Read first, write last.** Every new integration starts as a read. A write path is built only after the read has run cleanly for a week, and its first live write is a QC item (`write_external`) naming the exact records and fields.
- **Connectors before code.** If a connector in this session already reaches the system (Gmail, Drive, Calendar, Notion, Supabase, ZoomInfo, Plaud, Superhuman, Netlify, Zoom, QuickBooks, Gusto), use it. Write code only where no connector reaches, or where a job must run unattended.
- **Unattended jobs** run as Radar routines or GitHub Actions in this repo, never on someone's laptop. Each one writes a one-line result (time, rows read, rows changed, errors) to its log so Radar can see it ran.

## When Kev or Radar asks "can we connect X to Y?"

1. Find both rows in the inventory. If one is missing, research it (official API docs only) and add it.
2. Answer in three lines: what flows, which way, how often; what it costs (QC if anything is paid); the first read you will run to prove it.
3. Build the read. Show one real result (names and roles only, never personal details). Then propose the next step.

## Friction hunt

Once a week, before the lab review, list the three places someone on the team clicked the most for the least value this week (from Radar's ledger, the recruiters' asks and your logs). Propose one fix for each, smallest first. Kev's principle (9 Oct): "We should always be proactive in reducing friction in people's workflow."
