# Eden Office: Radar's workstation and the virtual office (Kev, 21 October 2026)

Kev: "I want a UI for you... a desk or work station that I come interface with you at in place of always coming to this chat... a separate desk or icon for each agent... glowing green they're working... indicator light... think BlackBerry notification blink... everything at your desk ready to go... hand them a work ticket... it's like work benches I'm looking down at for each part of the business... levers inside to be pulled for functions... if we want to run a WIP report at any moment, we should have a button for that... start weaving [our tools and dashboards] together to be interacted with in a virtual office."

This replaces the "Virtual Studio + work chart v1" ledger item (due Wed 21 Oct). The org chart artifact (https://claude.ai/artifact/CyZ475DJjbNNaGbfc93nZN) is the seed of its visual language.

## What it is

One private artifact, **Eden Office**, seen from above: a floor of desks and benches. Radar's desk is in the middle. Every agent has a desk with an indicator light. Each part of the business is a bench. Click a desk or a bench to sit down at it; every tool Kev already uses is one click away from the right desk.

It is a **front end over what already exists**, not a rebuild. The Hub, Eden Daily, Day Board, Employee Workshop, Eden Desk, Atlas Desk, Marlowe's Desk, the Notion ledger, QuickBooks, Gusto, Crelate and the QC queue stay where they are; the Office links to them, summarises them and shows their alerts.

## Indicator lights (Radar's proposal, Kev to confirm)

BlackBerry LED semantics: one light per desk, colour says what kind of thing, blink says it needs Kev.

| Light | Meaning | Example |
|---|---|---|
| Steady green glow | Working a task right now | Scout building tonight's buckets |
| Blinking green | Finished work waiting for Kev to look at | Tally's month-end packet cleared the gate |
| Blinking blue | A message to reply to (team, client, candidate) | Evan asked about a submittal; Joel replied on the invoice |
| Blinking red | Urgent: missed call, overdue, failed gate, deadline today | Missed call from a client; QC item expiring |
| Steady amber | Blocked on Kev (a decision, a connector, a spend yes) | EOW reports routine has no connectors |
| Dark | Idle, nothing open | |

Priority when several apply: red > blue > green blink > amber > green glow. A desk shows the highest one and a small count of the rest.

## The floor (v1 layout)

- **Radar's desk (centre).** Today strip (Day Board), the ledger by lane, decision log, Eden Daily, QC queue, open tickets, and the levers: *WIP report*, *Status from everyone*, *Hand a ticket*, *What did we ship that we're not using*.
- **Agent desks.** Scout, Q, Dean, Host (recruiting desk); Tally with Docket beside her (finance and risk); Atlas, Marlowe, Keys (family office). Each desk: light, current task, last 5 log lines, open tickets, "status report" lever, link to the agent's own desk or artifact.
- **Benches** (parts of the business):
  - *Recruiting floor (Vancouver).* Org chart of Evan, Noah, Max, Andrew (Juicy) and the rest, with coaching notes, scorecard trends and deliverables per recruiter (Dean).
  - *Hiring depth chart.* People moving through the onboarding ramp (Kyle Cockell first) (Dean).
  - *Revenue.* Revenue tracker for the Vancouver recruiters' numbers only (Tally + Dean).
  - *Eden University.* Tracks, modules, certifications, Wednesday training (Dean).
  - *Finance.* Top down: cash and active balances, open invoices, notes from Joel Fairchild and Chris, monthly P&L and cash flow, Gusto; click through to the Hub Rev Report or QuickBooks (Tally). Docket's desk sits beside it.
  - *Client work.* The Hub and Job Orders folder (link only; never mixes client data into the Office).
  - *Family office.* Atlas, Marlowe, Keys benches (Home list; never shown during a screen share).

## Work tickets

Kev (or Radar) writes a ticket on a desk: agent, ask, due, priority. It lands in the Office database. Radar picks tickets up in the hourly sweep (or at once when Kev says "go"), runs the agent, and the agent's desk light goes green; when the agent finishes, the ticket closes with a link and the light blinks green until Kev opens it. Anything the agent would send, spend or publish still goes through QC; a ticket is never approval.

## Rules

- Private to Kev. Not shared. No public link.
- No phones, comp, SSNs, health, family or age on any surface Kev might screen-share; a *Screen-share* switch hides the finance, coaching and family benches entirely.
- Client names stay in the Hub; the Office shows counts and links only for client work.
- Read-mostly. Agents and Radar write status, logs and tickets through `ArtifactData`; the page writes only tickets and "seen" marks.
- Every number carries its source and date; Tally and Docket figures show their gate id.

## Who is doing what (round 1, started 21 Oct)

| Owner | Piece | Output |
|---|---|---|
| Scout | Research: what makes engineering and remote-team virtual offices work (Gather, Kumospace, Sococo, Linear, trading floors, control rooms, ops dashboards) and what fails | `research/scout-virtual-office.md` |
| Marlowe | UX and spatial design: the floor plan, desks, benches, light design, materials and mood; what makes it a pleasure to come back to (without dark patterns) | `research/marlowe-design.md` |
| Q | Architecture: data model, status feed, tickets, levers, how routines write to it, v0 build | `research/q-architecture.md`, `draft/` |
| Tally | Finance bench spec: what shows top down, sources, refresh cadence, revenue tracker for the Vancouver team | `research/tally-finance-bench.md` |
| Dean | Coaching, hiring depth chart, Eden University benches: fields, trends, deliverables per recruiter | `research/dean-people-benches.md` |
| Docket | Upgrade himself: Munger-style mental models, contract-specialist training, a standing "is this the smartest use of cash to grow the umbrella" review of Tally's work; spec for his seat beside finance | `employees/docket/` + `research/docket-seat.md` |
| Radar | This brief, the light rules, integration, publishing, the ledger | |

Round 2: Q and Radar build v1 from the specs; Marlowe reviews the look; Kev sits at it Thursday morning.
