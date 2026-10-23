# Team hub: one place for depth charts, lead lists, project notes and resources (Kev, 12 October 2026)

Direction (Kev, 12 October, replaces the first plan):

- A **fresh standalone artifact**, shared with the whole team. The Eden Desk stays private to Kev and gets no team sections.
- **Segmented by client.** Each client (PB South, Triton, VMG, Prometheus, Hoffman, Pence Kelly, Megawatt and more) is a closed folder. Nothing from one client shows until that client is opened. Reason: when someone screen-shares with Triton, Triton must not see PB South, and VMG must not see Hoffman.
- Landing view is closed folders only: no cross-client totals, counts or names inside.
- Nothing from Kev's coaching, email or finance goes on it. Finance and Tally stay off.
- Private, named sharing only. No public link. Sharing is Kev's yes once he names the roster.

## What the draft does

`projects/team-hub/draft/eden-hub.html`, in Eden's look, with example rows until a database exists.

- Landing: a find box, a Screen-share mode button, closed client folders, and an "Eden playbooks" folder for material that is not client specific.
- Opening a folder replaces the list: only that client shows (depth chart as seat columns, lead lists table, project notes, resources). "All clients" returns.
- **Screen-share mode** hides every client name. You type the client you are presenting to and press Enter; only that client shows, with no way back to the list on screen. A link ending in `#triton` opens that client directly.
- When live, an open folder reads only that client's rows, so another client's data is never loaded into the page while presenting.
- The page only reads. Radar, Scout and Q write rows with `ArtifactData`; nobody edits from the page.

Checked once in a browser at 400px and desktop, light and dark: no sideways scroll, no script errors, and the isolation checks pass (opening Triton shows no PB South or VMG text; screen-share mode shows no client names). Not tested against a live database and not published or shared.

## Database layout (keyed by client)

| Path | One document is | Fields |
|---|---|---|
| `clients/{slug}` | A client folder | name, sort, updated |
| `clients/{slug}/depth/{id}` | One depth chart | title, updated, source, seats [{seat, loc, people [{name, status, note}]}] |
| `clients/{slug}/leads/{id}` | One lead list | pool, project, role, metro, leads, owner, sheet, built |
| `clients/{slug}/notes/{id}` | One project note | title, status (active, waiting, done), owner, decision, next [..], links [{title, url}], updated |
| `clients/{slug}/resources/{id}` | One link | title, kind, url, note, updated |
| `playbooks/{id}` | An Eden-wide resource | title, kind, url, note, updated |
| `jobs/{id}` | One job order, across every client (Job Orders folder) | client, client_slug, discreet (true hides the client), role, location, status (active, on-hold, filled, closed), opened, rank, leads [{title, url, count, built}], team [{recruiter, since, role_on_job (lead, co-lead, backup, standby), note}], condition, updated, source |

Slugs are lowercase letters, digits and hyphens (`triton`, `pb-south`).

Declare `capabilities: {db: {rules: [{path: "", read: "view", write: "admin"}]}}` so teammates read and only editors write. A rule can later lock a single client's path if a client ever needs a separate audience.

## Rules

- Names plus role and status only. No pay, phone, email, home address or EEO data.
- Family and KDTW material stays out. Finance stays out.
- Source and date on every row. A row older than 14 days shows "check with owner".
- Anyone who can open the hub can read every client in it. The folders protect a screen share, not access: do not share with anyone who should not see all clients.

## Job Orders folder (Kev, 19 October 2026)

Kev: "Build a folder just for Job Orders so we always know what Job Orders are active, where their leads are, and who is on what job. If someone stays on a job more than 2 weeks, we need to be alerted to adjust who is on this."

- **An internal Eden folder.** One closed folder titled "Job Orders" (marked "Internal · Eden only") sits after the client folders. Its head shows no client names, counts or totals. It opens only when clicked: no link anchor and no find-box match opens it.
- **Screen-share safe.** It shows every client at once, so it is hidden in Screen-share mode, and turning Screen-share mode on closes it. Its rows load only while it is open and are dropped on close or when a client folder opens, so no other client's data sits in the page during a presentation.
- **What it shows.** A summary (active JOs, assignments past 14 days, JOs with no owner), then active JOs grouped by client (by best rank) or by recruiter. Each JO shows its lead sheet links with counts, who is on it with days on the job, any condition, and the source. On-hold, filled and closed JOs sit in a closed list at the bottom.
- **Rotate flag.** A team entry more than 14 days past its `since` gets "14+ days, rotate?" and its card turns red. Standby entries (on the job only if a condition is met) are not flagged. Radar's morning brief (`employees/radar/skills/morning-brief.md` step 5) and the Eden Daily build (`stand-up-tomorrow.md` step 1b) list the same assignments under "Rotate?" for Kev's decision.
- **Discreet clients.** A row with `discreet: true` shows "Client · discreet" everywhere: the client name is kept out of the row itself, and the page also scrubs any trace of it. The INL safety client is one; never write its name into `jobs`, the brief or the paper.
- **Prometheus vs Promethean.** Prometheus is the Bay Area real-estate investor. Promethean is the NYC and Miami GC, sister company to PB South. Different `client_slug` values: `prometheus`, `promethean`.
- **Writes.** Radar writes `jobs` with `ArtifactData` (batch for more than a couple, `if_version` on every existing row). A rotation is a new team entry with `since` = the change date; the old entry is removed. Names, roles and links only: no pay, phones or emails.

### Board fields and Casey (Kev, 23 October 2026)

Casey, the Client Care Manager (`employees/casey/`), now owns the job-order board and the depth charts; Radar and Scout still write when a playbook says so. New on `jobs`:

| Field | Meaning |
|---|---|
| `status` | Adds `killed` (Kev pulled the JO). Killed rows are never deleted; the reason goes in `board_note` |
| `board_note` | Kev's latest instruction on the JO, close to his words |
| `depth` | `[{client_slug, chart, seat}]`, linking the JO to seats on that client's depth chart (`seat` matches `seats[].seat`) |
| `scout` | `{requested, at, status}`: queued, briefed, landed |

`scout_queue/{id}` is written when a JO is added on the board; Casey briefs Scout from it (a `scout` ticket on the Command Center) and marks it briefed. `clients/{slug}/meetings/{id}` holds client meeting notes. Write rules and the voice-note intake: `employees/casey/skills/hub-board.md` and `voice-note-intake.md`.

### Seed (Radar, 19 October 2026)

26 rows from the 19 Oct JO meeting, Kev's answers, the "Who's taking what" Doc and Scout's bucket plan (`employees/scout/sheets/2026-10-19-bucket-refresh-plan.md`). Every `since` is 2026-10-19. 25 active, 1 on hold (Hoffman Houston area supers, not on the 19 Oct list). No owner: Moss Interior Super, Moss Precon, Hoffman Amarillo low-voltage supers. Standby (only if Tim Norton doesn't land the Prometheus Sr PM seat): Andrew on the Triton role to confirm ("NP"), Noah on Megawatt San Jose Sr PM/PX and on Promethean NYC occupied healthcare. To confirm with Kev: the client for Noah's "Supers, Miami" (filed under PB South).

## Seed (Radar, 12 October)

- PB South: Project X (Miami) has 11 role buckets, 651 leads, built 9 Oct. Pool A, one sheet per role, folder `1yO3P2KJ_9fzWtLlt6MwCv2cIXm5uXfMU` (PE 65, SPM 66, VT 69, Asst MEP 66, Safety 51, Controller 60). Pool B, one sheet per role, folder `1X8FZdKoiLsld7PGKLDni_wcPEvcztWGm` (Accountant 57, Procurement 58, Admin 59, BIM 57, Demo 43). Controller owner Noah; the other ten unassigned.
- VMG Supers DC (25) and Prometheus Sr PM/PM (27), both owned by Andrew.
- Triton: depth chart and shot clock from `projects/eden-crm/reports/2026-10-12-triton-screener-stats.md` (internal names; the client version never shows names).

## Steps

1. Radar publishes `eden-hub.html` as a new private artifact with the db declaration above.
2. Seed the client folders with `ArtifactData`, one client at a time.
3. Read back one client as a lower-level viewer to confirm teammates can read.
4. Kev names the roster and approves sharing.
