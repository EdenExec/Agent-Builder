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

Slugs are lowercase letters, digits and hyphens (`triton`, `pb-south`).

Declare `capabilities: {db: {rules: [{path: "", read: "view", write: "admin"}]}}` so teammates read and only editors write. A rule can later lock a single client's path if a client ever needs a separate audience.

## Rules

- Names plus role and status only. No pay, phone, email, home address or EEO data.
- Family and KDTW material stays out. Finance stays out.
- Source and date on every row. A row older than 14 days shows "check with owner".
- Anyone who can open the hub can read every client in it. The folders protect a screen share, not access: do not share with anyone who should not see all clients.

## Seed (Radar, 12 October)

- PB South: Project X (Miami) has 11 role buckets, 651 leads, built 9 Oct. Pool A, one sheet per role, folder `1yO3P2KJ_9fzWtLlt6MwCv2cIXm5uXfMU` (PE 65, SPM 66, VT 69, Asst MEP 66, Safety 51, Controller 60). Pool B, one sheet per role, folder `1X8FZdKoiLsld7PGKLDni_wcPEvcztWGm` (Accountant 57, Procurement 58, Admin 59, BIM 57, Demo 43). Controller owner Noah; the other ten unassigned.
- VMG Supers DC (25) and Prometheus Sr PM/PM (27), both owned by Andrew.
- Triton: depth chart and shot clock from `projects/eden-crm/reports/2026-10-12-triton-screener-stats.md` (internal names; the client version never shows names).

## Steps

1. Radar publishes `eden-hub.html` as a new private artifact with the db declaration above.
2. Seed the client folders with `ArtifactData`, one client at a time.
3. Read back one client as a lower-level viewer to confirm teammates can read.
4. Kev names the roster and approves sharing.
