# Can the Crelate API show Kev's notifications? (ticket t-202610300221-crnf, 30 Oct 2026)

Result: No notifications or mentions endpoint exists in API v3. Assigned tasks do exist and are readable. Read-only checks only.

## Findings
- The v3 spec (api3/swagger/v3/swagger.json) has no path for notifications, mentions, alerts or inbox. Probes of /notifications, /mentions, /alerts, /usernotifications, /notificationsettings all return 404.
- /tasks works: filter `owner_ids=<Kev id>&completed=false`. Each task has Display (text), CreatedById (who sent it), When (due), ParentId (the contact, with name and id), RegardingId (job), Pinned, Announced.
- Kev (user id from /users/self) has 35 open tasks. 33 he made himself, 1 from Micah Caires (June 2026), 1 from Admin (Sept 2025). So recruiters are not really sending him tasks today; nothing recent to show.
- Mentions inside notes: untested (the notes list needs a parent id; one try with a bad sort returned 400). /activities filtered by owner could carry some, not verified.

## Proposal (build nothing until Kev picks)
- Option A, small: "Crelate for you" list on Today and desk = open tasks assigned to Kev, created by someone else, newest first, each with a link to the contact in Crelate. Today it would show 2 stale items.
- Option B: add notes/activities scan for "@Kevin" or "Kev" text on recent records. Needs a test first.
- Real notifications (the bell) likely need Crelate's own email or Slack alerts; ask Crelate support whether an API exists.
- Recommendation: Kev asks recruiters to assign tasks to him in Crelate, then ship Option A.
