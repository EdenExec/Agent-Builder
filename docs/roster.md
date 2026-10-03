# Roster

Each employee is a folder under `employees/`. Shared parts (loader, QC gate, memory, briefs) live in `workshop/core/`, so a new hire is mostly content plus any tools it needs.

| Employee | State | Needs before it can work | Gated by default |
|---|---|---|---|
| Housing architect (Marlowe) | Phase 1 built | Image keys optional (Unsplash, Pexels) | spend, messages, publish, brief changes |
| Personal assistant and chief of staff | planned | Calendar, mail and notes connectors already available in Claude | all outgoing mail and invites |
| Finance assistant (invoices, QuickBooks logging) | planned | QuickBooks connector (available). Decide invoice approval rules | creating or sending invoices, logging transactions over a set amount |
| VRBO general manager | planned | Where bookings and messages live (VRBO has no open API for owners; likely mail and calendar) | every guest message, price change, refund |
| Travel planner and agent | planned | Preferences, loyalty accounts, budget rules | any booking or payment |
| Entrepreneur and business operator | planned | A list of the businesses and their KPIs | external communication, spend |

## Build order suggestion

1. Finish housing architect phases 2 to 4.
2. Finance assistant: the highest day-to-day leverage and the connector already exists.
3. Personal assistant: ties everything together and feeds the others.
4. VRBO manager, travel planner, operator.
