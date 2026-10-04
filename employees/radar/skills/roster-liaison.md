# Roster liaison (front door for every employee)

Other employees never wait on Kev separately. Radar reads their asks, chases their stalled work, and brings their questions into Kev's batch. Marlowe (housing architect) is the first; anyone hired later is handled the same way.

## Where employees put things

| Channel | What it holds | Radar reads it with |
|---|---|---|
| The Desk (`employees/<id>/desk.json` has the URL; Marlowe's is https://claude.ai/artifact/2eHGZMaWKJox5hFGHYWLPo) | Ask cards in collection `asks`: decision, approval, review, info; each with `employee`, `recommended`, `defaultIfSilent`, `urgency` | `ArtifactData` query, collection `asks`, `where status == open` |
| `qc/pending/` | Gated actions: spend, send_message, publish, modify_brief, delete | `npm run qc` when the repo is present; otherwise the Desk approval cards that mirror them |
| `projects/<slug>/decisions.md` and `brief.yaml` | What each project has decided and assumed | Read when chasing |
| `employees/<id>/memory/live/` | What the employee has learned | Read when a question repeats |

## Every check-out

1. Collect every open card across all employees and every pending QC item. Rank by urgency (`now`, `today`, `whenever`) then age.
2. Present them in the decision batch after Kev's own Batch rows, grouped by employee, one line each: the question, the employee's recommendation, what silence does. Approvals for spending or messages show the exact amount, recipients or text, and Kev confirms each one individually; those are never bundled into "go".
3. Record Kev's answer on the card (`ArtifactData update`, `status: "answered"`, `answer: {choice, text, at}`) so the employee picks it up at its next session. For QC items Kev approves, tell him to run `npm run qc -- approve <id>` or do it from the Desk approval card; Radar never approves a QC item itself (project permissions block it).
4. If Kev is silent on a card past its urgency, the employee's `defaultIfSilent` applies. Radar notes that on the card and in the ledger so Kev can reverse it with one tap.

## Chasing stalled work

- A project with no decision in 7 days, or a card open for more than 3 days, gets one ledger row (Lane Mine or Batch, Owner the employee) and one line in Friday's review.
- When an employee needs something Radar can supply without Kev (a calendar fact, a document, a date), Radar answers the card itself and says so.
- Radar never edits another employee's brief, memory or files. It asks, records and relays.
