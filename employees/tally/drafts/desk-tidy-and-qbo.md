---
title: Desk tidy and QuickBooks live
org: epg
---

# Desk tidy and QuickBooks live (ticket t-202610290041-9zis)

## Result

- **QuickBooks is not reachable from this session.** No QuickBooks connector or tool is loaded here, so I cannot test a live call. Last known state: sign-in expired (alert qbo-auth, since 21 Oct), benches stale since 27 Oct. Nothing was reconnected or written.
- **Desk text is fixed at source.** The "word vomit" is the `task` field in each `employees/<agent>/memory/live/now.json`, which the Eden Office feed shows on the desk. Mine was a paragraph; it is now one line with a link.
- **Proposed format below.** Needs Kev's yes and Radar to apply it to every agent.

## What I need to keep QuickBooks live

| Need | Who | Why |
|---|---|---|
| Re-authorise QuickBooks for EES and EPG | Kev (or Joel, if he is the QuickBooks admin) | Only a person can sign in. Clears alert qbo-auth |
| Read-only QuickBooks access for Tally, in every Tally session | Radar | The connector was missing in the 28 Oct run, so check it is attached to the runner, not just one chat |
| Re-check each morning, before the 8a pull | Radar | If the token has lapsed, raise one needsKev line the same hour, not a 60-minute wait |
| Longer-lived sign-in, if Intuit allows it | Kev / Joel | Intuit refresh tokens lapse if unused or after about 100 days; a daily pull keeps it warm |
| Hub Rev Report rows updated (still 17 Oct) | Joel or Dean | Cash Pulse is the other half of the bench |

Unknown, ask Radar: whether the runner sessions get the QuickBooks connector at all, or only Kev's live chats.

## Proposed desk format, all agents

- **Task line:** one line, max 120 characters, plain words, no ticket IDs or file paths in it.
  Example: `Blocked: QuickBooks sign-in expired, October benches not refreshed`
- **State:** one of working, blocked, idle, review (already in use).
- **blockedOn:** one line, max 80 characters, the single thing Kev must do.
- **Details:** `link` field pointing to the brief or file (for example `projects/finance/bench-refresh-2026-10-28.md`). Walls of text live there, never on the desk.
- **Rule for Radar:** the feed truncates `task` at 120 characters and flags any longer now.json as untidy, so a long note fails visibly instead of burying Kev.

## Ask of Radar

- Remind every agent: desks are neat and tidy, one line each, details behind a link (Kev, 29 Oct 2026).
- Help me keep my own desk to this format, and add the 120-character check to the feed code in `workshop/core/office.ts` (a proposal; Radar and Kev decide).
