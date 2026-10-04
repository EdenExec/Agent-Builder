# Design brief

The brief is the contract. Work starts only after the client approves it.

## Steps

1. Complete `projects/<slug>/brief.yaml` using the schema in `workshop/core/brief.ts`.
2. Run `npm run brief -- projects/<slug>/brief.yaml`. Exit code 2 means fields are missing. Fix and rerun.
3. Present the rendered brief to the client with the assumptions list first.
4. Queue approval: `npm run qc -- submit housing-architect start_work "Approve brief: <project>" "<paste the rendered brief>"`, then `npm run desk -- from-qc <id>` and post the card so approval is one tap. Include the assumptions list in the card body.
5. Start the parts of the work that do not depend on the approval (research, source checks) and stop the rest. When the client approves, set `status: approved` and begin work. If they reject with a note, revise and resubmit.
6. Any later change to an approved brief is proposed as a `modify_brief` QC item with a before and after.

## Rules

- Every assumption is listed. If you assumed public utilities, say so.
- Budget is a range with a confidence. Never invent one for the client.
- Jurisdiction is mandatory. If the lot is not chosen, write the candidate jurisdictions and mark the study provisional.
- Record the approved brief's key taste facts in memory: `npm run memory -- add housing-architect taste "<fact>"`.
