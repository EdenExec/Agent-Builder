# Ticket runner (every hour, 6am to 10pm Pacific, Sunday to Friday)

Kev, 22 October 2026: "I want those agents running autonomously. They need to be working tickets as they are coming in. It should be a fail if tickets sit open. You and I solely focus on moving things forward. We can't let projects stall."

This routine does one job: every Eden Office ticket gets picked up within the hour and closed. It is not the inbox sweep, and it never skips tickets for "scope". A ticket still `open` 60 minutes after it was filed is a **FAIL** on the Office scoreboard.

Office: https://claude.ai/artifact/WF9MaVZaf3qkf2354wcHDW · Saturday is the Sabbath: if it is Saturday in Pacific time, stop with one line.

## Every run, in order

1. **Read the queue.** `ArtifactData list` on `tickets`, `agents`, `alerts` and `meta`, all with the same `out_dir` (for example `/tmp/office-dump`). Note each document's version from the list results.
2. **Close duplicates.** Same agent, same ask, filed minutes apart: `done` with `result.summary` "Duplicate of <id>".
3. **Pick up everything open.** Set each remaining `open` ticket to `picked` with `pickedAt` now (one `batch`, pin `if_version`). Do this before any work, so the desk lights go green at once.
4. **Run the agents.** Start one Agent per ticket, all in one message so they run in parallel (`subagent_type` = the ticket's agent id; `radar` tickets are yours to do directly). Give each the ticket id, Kev's ask word for word, and these rules:
   - write files in the repo but do not commit;
   - update `employees/<agent>/memory/live/now.json`;
   - return a 1 to 2 line result and a link.
   Wait for them all to return.
5. **Write results back.**
   - Finished work: `done` with `result {summary, link}`. The summary is written for Kev: lead with the outcome, then any decision he owes.
   - Work that would send, spend or publish: `gated` with `proposed {kind, exact}` and the QC id (`npm run qc -- submit`).
   - Drafts for Kev: this routine has no Superhuman connector, so it saves the draft text in the repo and puts the path in `result.link`. The next inbox sweep moves it into Superhuman Drafts.
   - A ticket is delegation, never approval.
6. **Unstick.** A ticket `picked` or `working` for more than 2 hours with no result gets re-run once. If it fails again, it is `blocked` with `blockedOn` naming exactly what is missing (Kev, a connector, a person).
7. **Ship.** Commit the agents' files with the message "Ticket runner <date> <hour>: <n> closed" and the session trailer. Push to `claude/pensive-brown-18gll8` only (the routine's permissions refuse `workshop/phase-0`; Radar's live sessions mirror that branch). If the push is rejected as non-fast-forward, fetch, merge and push again.
   - **If the push is refused with a 403** ("not in this session's authorized repositories"), stop trying: this run was started without the repo attached. Put each deliverable's full text in its ticket's `result.body` (markdown, up to 20,000 characters) so nothing is lost, add "repo copy not pushed" to the summary, and log it in `friction.md`. The next live Radar session commits it from there. (22 Oct 2026: the test run hit this; the fix is Kev re-creating the routine in claude.ai with the repo attached.)
   - Never redo work another session already did: if the ticket's result or the repo shows it done, close it with that result.
8. **Refresh the floor.**
   1. Write `versions.json` from step 1 (`{"agents/q": 3, "meta/sync": 2, "meta/records": 1, ...}`). Every agents, alerts and meta document needs its version, `meta/records` included.
   2. Re-list `tickets` (done ones too) and `actions` into the dump so the sync sees this run's closes and Kev's taps. Those two feed the scoreboard (points, FAILs, streak, records).
   3. Run `npm run office-prep -- in <dump> versions.json`, then `npm run office -- sync --tickets <dump>/tickets.json --actions <dump>/actions.json --existing <dump>/existing.json --out <outbox>`, then `npm run office-prep -- out <outbox> <dump> <dest>`.
   4. Push `<dest>/writes.json` with `ArtifactData batch`. Drop the `agents/host` write when no `--inbox` was passed, so Jenny's reply light survives.
9. **Log.** One line to `employees/radar/memory/live/runner-log.md`: time, picked, closed, gated, blocked, FAILs found (open over 60 minutes at the start of the run). Any FAIL also gets a line in `friction.md` saying why it sat.

## Never

- Never approve QC, send, spend or publish. Gated means Kev decides on the Eden Desk.
- Never write health, prayer, coaching or journal content anywhere but Kev's private Notion (Hale, Jethro and Barny tickets).
- Never skip a ticket because the run is short: cut the refresh, not the tickets.
