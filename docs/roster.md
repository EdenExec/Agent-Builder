# Roster

Each employee is a folder under `employees/`. Shared parts (loader, QC gate, memory, briefs) live in `workshop/core/`, so a new hire is mostly content plus any tools it needs.

| Employee | State | Needs before it can work | Gated by default |
|---|---|---|---|
| Housing architect (Marlowe) | Phase 1 built | Image keys optional (Pixabay, Unsplash, Pexels) | spend, messages, publish, brief changes |
| Chief of staff (Radar) | R0 built: ledger lanes, four routines (brief, hourly sweep, check-out with the Friday review, stand-up with the Saturday Sunday Edition build), /radar | Superhuman, Google Calendar, Notion, Drive connectors (already attached) | spend; email beyond the current trust stage (`employees/radar/skills/trust-ramp.md`); deleting anything |
| Finance analyst (Tally) | Built (11 Oct 2026): month-end cadence, budget vs actual, cash forecast, tax ideas | QuickBooks (read-only), Gusto totals, Drive | spend; send; publish; any write into a live system; numbers gate on every send or publish |
| Counsel and risk partner (Docket) | Built (17 Oct 2026): contract and SOW review, recruiting paper, commission and classification, investor notes, leases, risk register, second key on finance numbers | QuickBooks (read-only), Drive; outside counsel for real exposure | spend; send; publish; signing anything (never); numbers gate on every send or publish |
| Workforce development and scorecards (Dean, name proposed) | Built (19 Oct 2026): Friday Crelate scorecard and Round Table pack, week-over-week trends, Eden University tracks and modules, new-hire setup packets, coaching notes | `CRELATE_API_KEY` (read-only GETs), Drive; Radar hands over the Eden Desk 42-box cards | spend; send (drafts for Kev only); publish; any write into Crelate or another live system; no individual calendar invites; no pay, health, family or age in anything |
| Short-term rental operator, 600 SE 101st (Keys, name proposed) | Built (19 Oct 2026): market research, City of Vancouver, Clark County and WA rules and lodging taxes, insurance and HOA, furnishing and turnover, listing drafts and pricing, expense and revenue tracker for Tally (KDTW Group). Becomes the VRBO general manager once live | Kev's answers on jurisdiction, ownership, insurance and HOA; Docket for leases and agreements; Tally reads `projects/600-se-101st-str/ledger.csv` | spend; send; publish (every listing); any platform or government portal entry; booking or signing anything (never on its own) |
| Finance assistant (invoices, QuickBooks logging) | planned | QuickBooks connector (available). Decide invoice approval rules | creating or sending invoices, logging transactions over a set amount |
| Travel planner and agent | planned | Preferences, loyalty accounts, budget rules | any booking or payment |
| Entrepreneur and business operator | planned | A list of the businesses and their KPIs | external communication, spend |

## Build order suggestion

1. Finish housing architect phases 2 to 4.
2. Finance assistant: the highest day-to-day leverage and the connector already exists.
3. Radar (chief of staff): built. Front door for every other employee via `skills/roster-liaison.md`.
4. VRBO manager (Keys, hired 19 Oct 2026, starts with setup), travel planner, operator.
