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
   - Work that would send, spend or publish: `npm run qc -- submit`, then `gated` with `proposed` set to exactly what `npm run qc -- exact <id>` prints (`{kind, exact, hash, qc}`). Kev approves it with two taps in the Office; without the `hash` and `qc` his Approve button stays off.
   - Drafts for Kev: this routine has no Superhuman connector, so it saves the draft text in the repo and puts the path in `result.link`. The next inbox sweep moves it into Superhuman Drafts.
   - A ticket is delegation, never approval.
6. **Unstick.** A ticket `picked` or `working` for more than 2 hours with no result gets re-run once. If it fails again, it is `blocked` with `blockedOn` naming exactly what is missing (Kev, a connector, a person).
7. **Ship.** Commit the agents' files with the message "Ticket runner <date> <hour>: <n> closed" and the session trailer. Push to `claude/pensive-brown-18gll8` only (the routine's permissions refuse `workshop/phase-0`; Radar's live sessions mirror that branch). If the push is rejected as non-fast-forward, fetch, merge and push again.
   - **If the push is refused with a 403** ("not in this session's authorized repositories"), stop trying: this run was started without the repo attached. Put each deliverable's full text in its ticket's `result.body` (markdown, up to 20,000 characters) so nothing is lost, add "repo copy not pushed" to the summary, and log it in `friction.md`. The next live Radar session commits it from there. (22 Oct 2026: the test run hit this; the fix is Kev re-creating the routine in claude.ai with the repo attached.)
   - Never redo work another session already did: if the ticket's result or the repo shows it done, close it with that result.
8. **Refresh the floor. Every run, never skipped** (Kev, 22 Oct, on "Synced 8h ago": "Why aren't we syncing more regularly?"). The board's "Synced" stamp is how Kev knows the floor is live. If the run is short, do at least one pinned `update` on `meta/sync` setting `syncedAt` to now and `checkedBy` to "ticket runner"; otherwise do the full refresh:
   1. Write `versions.json` from step 1 (`{"agents/q": 3, "meta/sync": 2, "meta/records": 1, ...}`). Every agents, alerts and meta document needs its version, `meta/records` included.
   2. Re-list `tickets` (done ones too) and `actions` into the dump so the sync sees this run's closes and Kev's taps. Those two feed the scoreboard (points, FAILs, streak, records).
   3. Run `npm run office-prep -- in <dump> versions.json`, then `npm run office -- sync --tickets <dump>/tickets.json --actions <dump>/actions.json --existing <dump>/existing.json --out <outbox>`, then `npm run office-prep -- out <outbox> <dump> <dest>`.
   4. Push `<dest>/writes.json` with `ArtifactData batch`. Drop the `agents/host` write when no `--inbox` was passed, so Jenny's reply light survives.
8a. **Benches, once a day** (the first run after 6am Pacific; Kev, 22 Oct: "follow the cash flow"). Start the `tally` agent: pull from QuickBooks (cash basis where the report allows; label each figure's basis):
   - MTD and YTD revenue
   - open AR (plus the 31+ day amount)
   - cash on hand
   - open AP
   - the top 5 customers by MTD sales
   **What Eden is owed comes from EPG Cash Pulse's invoice list, not QuickBooks AR** (Kev, 23 Oct: "should be the past due amount and to be paid from the invoice section on the cash pulse"). Tally reads the `placements` dataset and sums `open` three ways: past due (status open, due before today), invoiced not yet due, and coming (status upcoming). One row per invoice goes in `benches/finance/rows/{id}`: client (Baker is "Client · discreet"), role, amount owed, due date, days late. No salary and no recruiter split. QuickBooks AR stays as one line, "Open AR in QuickBooks", until Joel books the invoices. Tally writes `projects/virtual-office/benches/{revenue,revenue-rows,finance,finance-rows}.json` and opens a numbers gate with `--doc projects/virtual-office/benches/revenue.json`. Then start `docket` to check it blind. Write `benches/revenue`, `benches/revenue/rows/{id}` and `benches/finance` (each tile carries `source`, `asOf` and `gate`; `needsGate: true` until the gate passes). The finance bench always carries a "Cash flow detail" tile pointing at EPG Cash Pulse (https://claude.ai/artifact/LxaFb1CvQgqcsrMn5KXie7). If QuickBooks needs re-authorising, write nothing and keep (or create) the `needsKev` alert `qbo-auth` on Tally (not `sync-` prefixed, so the floor sync leaves it alone): "QuickBooks sign-in expired: reconnect it so the Revenue bench goes live". Delete `qbo-auth` once a pull succeeds. No pay or payroll figures, ever.
8b. **Push decisions forward** (Kev, 22 Oct: "come up with a plan to move tasks off the tray faster… drawing attention to the to-do bars for me to make decisions or take action on"). At the first run after 6am, after 12pm and after 4pm Pacific, rank everything waiting on Kev: gated tickets, blocked tickets and `needsKev` alerts, money first, then the oldest. Put the top three in the cockpit doc's "Needs Kev" section, and end the run's final message with them, one line each with its link, so the routine's push notification carries them. Anything waiting on Kev for more than 24 hours gets "(waiting 1 day+)" on its line. Never re-ask about something he snoozed until the snooze ends.
9. **Cockpit for voice (Kev, 22 Oct: "read the Command Center like a cockpit by voice").** Rewrite the Google Doc "Command Center · cockpit (read by voice)" (id `1QfRZ7XBUr431THUd1Af5d0V_KqDCfLuh_i0QR8-rVrs`, Eden Daily folder) with the Google Docs connector: stamp the Pacific time; The Board (open, waiting on Kev, FAILs today, this week's closed, FAILs and points, streak, from meta/sync); Needs Kev (gated and blocked tickets plus needs-Kev alerts, one spoken line each, money first); Desks with open work (one line per agent with a task or open ticket; never health, prayer, coaching or family detail, only "a private brief for Kev"). Keep the "How to read this" section word for word. First read the "Tickets from voice" section: turn each line into an Office ticket (agent, ask, priority today, lever "voice"), then clear the section.
10. **Log.** One line to `employees/radar/memory/live/runner-log.md`: time, picked, closed, gated, blocked, FAILs found (open over 60 minutes at the start of the run). Any FAIL also gets a line in `friction.md` saying why it sat.

## Never

- Never approve QC, send, spend or publish. Gated means Kev decides with the Approve tap in the Office.
- Kev's **Done** tap means he did it himself: close it, cancel any ticket for it, never carry it out (Kev, 23 Oct 2026). Apply Kev's taps per the inbox sweep's Actions step.
- Never write health, prayer, coaching or journal content anywhere but Kev's private Notion (Hale, Jethro and Barny tickets).
- Never skip a ticket because the run is short: cut the refresh, not the tickets.
