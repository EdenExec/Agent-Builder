# Docket's seat: spec for the Eden Office (Docket, 21 Oct 2026)

**Result:** Docket's desk is usually dark, by design. Kev calls Docket sparingly (Tally double-checks, important documents, editing, contract review or build), so the desk shows what Docket guards and makes a bad request hard to send. It sits beside Tally on the Finance bench, sharing a gate tray.

## 1. What the desk shows (top down)

| Panel | Contents | Source |
|---|---|---|
| Second-key tray (shared with Tally) | Gates Docket checks (subject, items left, age) and gates Tally checks for Docket. Never Tally's number: the check is blind | `gates/*.json` via `npm run gate` |
| Open reviews | Document, entity, tier, due, and the verdict once given | Office tickets |
| Latest capital-allocation memo | SMART, SHARPEN or DANGER; kill list; three levers with gate ids; one question | `projects/legal/`, per `skills/capital-allocation-review.md` |
| Risk watch | Rows scoring 16+ or counsel YES: ID, risk, next step, date; count of the rest | `projects/legal/risk-register.md` |
| Paper calendar | Notice windows, renewals, note maturity (Feb 2028), ESHB 1155 (30 Jun 2027; notices by 1 Oct 2027), lease dates | Register next-step dates and contract inventory |
| Usage meter | Minutes used this month against Kev's budget | Ticket log |

Screen-share hides the whole desk (counterparties, investor terms, risk text). Client names show as counts only.

## 2. Light rules (Radar's LED semantics, Docket's triggers)

| Light | Docket turns it on when |
|---|---|
| Steady green | Working a ticket or a blind gate check |
| Blinking green | A verdict, redline, build or memo is ready |
| Blinking blue | Tally, Kev or Radar asks or comments on open work |
| Steady amber | Blocked on Kev: a fact that changes the verdict, a counsel choice, a risk to accept, or a written Docket–Tally disagreement |
| Blinking red | A failed gate blocking a send; a risk row reaching 16+ or counsel YES; a DANGER memo; a paper deadline within 7 days |
| Dark | Nothing open: the normal, healthy state |

Priority follows the brief.

## 3. The "Call Docket" lever

A short form that will not send until required fields are filled. If Docket still finds a gap, it returns the ticket naming the one missing field.

| Field | Required | Why |
|---|---|---|
| Type | Yes: Tally check, edit, review, build | Kev's four uses; anything else goes back to Radar |
| Document | Yes: link and version | No guessing at drafts |
| Our entity and the counterparty | Yes: EPG, EES or KDTW; their legal name | Entity mismatch is R-008 |
| Decision and deadline | Yes | Sets the tier |
| Dollars at stake | Yes, rough | Over $25,000 means outside counsel |
| Tier | Default Quick read | Quick read: verdict and top three, ~15 min. Full review: redlines and numbers, ≤90 min. Build: a gated draft |
| Deal terms (Build only) | Fee, trigger, terms, guarantee, exit, signer | Docket never invents a term |
| Known worries | Optional | Aims the review |

**Automatic (no ticket):** every Tally packet gate names Docket as checker; the capital-allocation review runs once it passes.

**Other levers on the desk:**

| Lever | Result |
|---|---|
| Capital-allocation memo | Reruns the review on demand |
| Risk register | Opens the full register |
| Paper calendar | Next 90 days of paper dates |
| Ask Docket and Tally | Joint ticket where money and paper collide (lease, loan, commission plan, distribution) |

## 4. What Docket writes to the Office

Status doc `docket`: light, task, last five log lines, ticket ids, gate ids and state, memo verdict and link, risk rows 16+, paper calendar, minutes used. Every figure carries its gate id or "not checked". Docket never signs, sends, files or moves money from the desk; a ticket is never approval, and sends still go through QC with a cleared gate.

## 5. Questions for Kev

1. Monthly minutes budget for the usage meter.
2. Capital-allocation memo on every packet, or month-end only?
3. Confirm the proposed cash floor: 90 days of fixed outflows, plus the next tax payment, plus accrued note interest.
