---
title: Finance and Revenue bench refresh, blocked on QuickBooks sign-in
org: epg
---

# Finance and Revenue benches: not refreshed, QuickBooks sign-in needed

Ticket t-202610282054-1am3. Prepared by Tally, 28 Oct 2026. Books not closed for October; no new figures in this brief.

## Result

- **Not refreshed.** The Tally session has no QuickBooks connection, so the daily pull could not run. Both benches stay as of 27 Oct 00:00Z. Nothing was written to them, and no figure here is new or estimated.
- **Cause.** QuickBooks sign-in expired (alert qbo-auth, open on Tally). Nothing was reconnected from this session; I cannot re-authorise it.
- **Not run.** Gusto was not touched (no payroll figures, and listing payrolls creates records as a side effect). The numbers gate with Docket was not opened, since there is nothing new to check.

## What I recommend

- Reconnect QuickBooks (EES and EPG). Then a live Radar session or Q-launched Tally run does the pull.
- On that run: read QuickBooks balances and AR aging, read the Hub Rev Report (EPG Cash Pulse invoice list), write the benches, open a gate with Docket, and clear qbo-auth once the pull succeeds.
- Until then, treat both benches as 37h+ old. They already carry as-of dates and "Cash Pulse is 10 days old" flags.

## Decisions I need from Kev

1. **Reconnect QuickBooks now?** Yes / no (this is the only blocker).
2. **If Hub Rev Report rows are still 17 Oct,** ask Joel or Dean to update them before the pull? Yes / no.
3. **Row 62059's $2,000 gap** (rate entered as 22.0, should be 22%) stays open for Joel to correct. OK to leave flagged?

## Check I ran

Searched this session's tools for QuickBooks: none available. Only Gusto is connected, and I did not use it.
