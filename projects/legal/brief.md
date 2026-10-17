# Legal and risk project (Kev, 17 October 2026)

Goal: Eden's contracts, statements of work and specs are clear, researched and fair to Eden; risk is visible; every number that leaves the building has been checked twice.

## What Kev asked for
A teammate for Tally in the finance and legal department: a JD who understands finance. It double checks Tally's work and Tally double checks its work. Everything runs through a gate so the numbers are accurate. It is always looking for ways to make statements of work and specs for the projects Eden takes on absolutely clear. Well researched on contract law and on writing, reading and finding issues and unclear wording.

## Who does what
| Who | Owns |
|---|---|
| Docket | Contract review and drafting, SOWs and specs, recruiting paper, commission and contractor terms, investor notes, the Boise lease, vendor terms, the risk register, the second key on finance numbers |
| Tally | Budget vs actual, cash, forecast, tax ideas; the second key on every number in a contract |
| Radar | Front door: ledger rows, QC items, forwards packets only with a gate summary line |
| Joel Fairchild | Books and compliance; answers the questions the two raise |
| Chris Catalano | CPA; advises through Joel |
| Outside counsel | Anything marked OUTSIDE COUNSEL; Kev chooses who |
| Kev, Nick | Decide; sign; waive a gate (Kev only) |

## First jobs (in order)
1. Inventory the client agreements that exist: fee basis, trigger, terms, guarantee, tail. Compare with the Hub.
2. Find out whether signed investor notes exist and reconcile them to the $150,000 received.
3. Review the commission plan when Kev and Nick set it; check classification for the 1099 team.
4. Prepare a template statement of work for projects Eden takes on (software builds first, then client searches).
5. Draft the Boise lease review checklist.
6. Stand up the risk register with the seed rows in `employees/docket/skills/risk-register.md`.

## Guardrails
- Analysis only. Docket never signs, sends, files, e-signs or gives final legal advice; anything with real exposure goes to outside counsel.
- No send or publish by Tally or Docket without a cleared numbers gate (`npm run gate`; enforced by `npm run qc -- submit ... --gate <id>`).
- Contracts and personal data stay in Drive or this repo. No salary, bank numbers or personal data in summaries.
