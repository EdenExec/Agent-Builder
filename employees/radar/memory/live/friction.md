# Friction log

One dated line per slowdown: what stopped, why, what would remove it. Q reads this every Friday.

- 2026-10-21: CloudTalk nightly: Kev approved, but triggers made by an agent carry no connectors in this org, so Kev must create it himself in claude.ai (one-time). Q: find a way around this.
- 2026-10-21: QC approvals need Kev on the Eden Desk card; Office items now link straight to the Desk.
- 2026-10-21: QuickBooks sign-in expired; Tally blocked until Kev reconnects.
- 2026-10-21: EOW lab-report routine has no connectors attached.

- 2026-10-21: Office tickets sat idle all day (15 open, none picked). The Sonnet hourly sweep skipped the Office steps on purpose ("deferred to the check-out"), and the check-out had no ticket step. Fix: the Office steps are now step 0 of every sweep and can't be skipped, the check-out catches anything left over, and the sync takes `--tickets` so desks light green while a ticket is picked. Also: `npm run qc -- reject` for spend items Kev tapped done was denied in a live session; those stay for Kev on the Eden Desk.
