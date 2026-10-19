# CloudTalk nightly lead load: brief (Q, 19 October 2026)

Result: the first scheduled bot is built and proven offline. A tool turns any lead sheet into a load plan (tested, 40 tests), a routine prompt is compiled, and nothing has touched CloudTalk. It stays in DRY RUN until Kev approves a 10-row test.

Kev, 18 Oct: "Connect the MCPs (Crelate, Claude, CloudTalk) to upload leads at night. Nida should send Radar all the leads; Radar gets them into CloudTalk via MCP so the guys have contact info the next day."

Kev also said yes to a radar@edenexec.com alias into his mailbox under an auto-label (18 Oct), and "Q first" for scheduled bots (19 Oct).

<!-- pagebreak -->

## The night, start to finish

| Step | What happens | Who or what |
|---|---|---|
| 1. Intake | Nida mails sheets to radar@. They land in Kev's mailbox under label `Radar/Leads`. CSV and XLSX attachments only. Scout's sheets in `employees/scout/sheets/` join as a separate plan. | Alias + Gmail label |
| 2. Plan | `npm run leadplan` reads each sheet, maps the columns, normalises phones, tags, dedupes inside the sheets. | `workshop/cloudtalk/` |
| 3. Dedupe lookups | Phone and email against CloudTalk; LinkedIn URL, then name + company against Crelate. Read-only. | Routine, MCP + curl |
| 4. Load | `cloudtalk_create_contact` per row. Only in TEST or STANDING mode (below). | Routine, CloudTalk MCP |
| 5. No-phone rows | A Gmail draft to Nida lists them. A draft only; Kev sends. | Routine, Gmail |
| 6. Morning summary | Doc "CloudTalk load - date" in the Eden Daily folder, a file link on the Desk day row, one line for the 5:22 brief. | Routine |

## Mapping: sheet column to CloudTalk field

CloudTalk's `create_contact` takes: name (required), company, title, industry, website, address, city, state, zip, source, phone_numbers (E.164), emails, tags, favorite_agent_id, custom_fields. Source: CloudTalk's published MCP tool reference, 19 Oct. The live check is pending (see below).

| Sheet column | CloudTalk field | Rule |
|---|---|---|
| Name (or First + Last) | name | Required. No name, no load. Up to 150 characters. |
| Title | title | Up to 255. |
| Company | company | Up to 100. |
| City, State | city, state | Their own columns. A single "City, ST" Location column is split. |
| Time Zone | tag `TZ MST` | Normalised to PST, MST, CST, EST (the 14 July standard; spelling still open). Not a field, so it can be searched. |
| Phone, Mobile, Cell, Direct, Work Phone | phone_numbers | E.164, extensions dropped, every valid number kept. |
| Email, Work Email | emails | Personal or home email columns are never read. |
| LinkedIn | website | Only a real `/in/` profile URL of 100 characters or fewer. Search links are not loaded. |
| (batch) | source | `Eden lead load YYYY-MM-DD` |

Never read, by column name: salary or comp, ethnicity, gender, disability, veteran, birth date, age, SSN, home or street address, home phone, personal email. They are named in the report (header only) and their values never enter the plan; a test proves it.

## Tags

One closed pattern, each tag one short phrase. They are added at creation, so no second write is needed.

| Tag | Example | From |
|---|---|---|
| Owner | `Owner Evan` | Owner column, else the mail subject if it says so plainly. Blank means no Owner tag (Kev assigns at the JO meeting; the Suggested owner column is not used). |
| Client | `Client Hoffman` | Client column, else the Scout file name. |
| JO | `JO Hoffman Boise PM PE` | JO column, else the Scout file name. |
| Date | `Lead 2026-10-19` | The sheet's file date, else the night's Pacific date. |
| Time zone | `TZ MST` | The Time Zone column. |
| In Crelate | `In Crelate` | Only when the person is already in Crelate. |

City and state stay fields, not tags, so the tag list does not grow a tag per metro.

## Dedupe

| Against | By | Result |
|---|---|---|
| The sheets themselves | phone, email, LinkedIn, name + company | Second sighting skipped, pointing at the first row. |
| CloudTalk | phone, then email | Not created again. Listed as "tag only" (adds the batch tags to the existing contact) when Kev's approval covers it. |
| Crelate | LinkedIn profile URL, then name + company | Still loads, tagged `In Crelate`, owner and last activity in the summary. |

Crelate, found read-only on 19 Oct (field names only, no records kept):

| Fact | Consequence |
|---|---|
| `GET /contacts?emails=` and `?phone_numbers=` are exact filters | Email and phone dedupe work today. |
| `GET /contacts/search?query=` matches name, phone start, email and city, not websites | A LinkedIn URL cannot be looked up through the API. LinkedIn dedupe waits for the Crelate mirror; name + company covers until then. |
| LinkedIn comes back as `Websites_LinkedIn.Value`, company as `CurrentPosition.CompanyId.Title` | Enough to confirm a name match. |

CloudTalk, from its tool reference: `create_contact` has no duplicate check, there is no delete tool, and the limit is 60 requests a minute per company. Our dedupe is the only protection, so the routine paces at 50 a minute and looks a contact up before retrying a failed create.

## Rules the tool enforces

| Rule | How |
|---|---|
| ZoomInfo phones never load | Blocked when the phone column is named ZoomInfo or ZI, when a `Phone Source` value says ZoomInfo, or, with no Phone Source, when the row's Source says ZoomInfo. A `Phone Source` such as "Crelate" releases Nida's own numbers on a ZoomInfo-sourced lead. Blocked rows go to the no-phone list with the reason. |
| No phone, no load | CloudTalk is a dialer; a contact without a number does not help the guys. |
| Counts and names only | No log, summary, draft or Doc carries a phone digit. The plan file holds phones, so it is written to `deliverables/` (git ignores it) and nowhere else. |
| Writes go through QC | Creating contacts is a write to a live system. |

## Modes (the safety gate)

| Mode | Needs | Does |
|---|---|---|
| DRY RUN (today, default) | nothing | Plan and summary only. |
| TEST | Kev's approval of "CloudTalk 10-row test load" | Creates 10 rows once, each tagged `Q Test Load` (a second test is refused while that tag exists). Kev looks at them in CloudTalk. |
| STANDING | Kev's approval of "CloudTalk nightly lead load" with a nightly cap | Creates contacts each night per the plan. |

The routine reads `qc/approved/` each night. No approval found means DRY RUN.

## Dry run, 19 October

Against `employees/scout/sheets/2026-10-19-*.csv`: 16 sheets, 1,089 rows (Scout was still adding sheets while this ran).

| Measure | Result |
|---|---|
| Ready to load | 0 |
| On the no-phone list | 1,089, reason "no phone on the sheet" |
| ZoomInfo phones blocked, duplicates, skipped | 0 (there are no phones on these sheets) |
| Client and JO resolved from the file name | 16 of 16 |
| Owner tag | None added: the sheets carry Owner blank, as Kev asked |
| CloudTalk and Crelate dedupe | Not run (no snapshots); the report says so |

The no-phone path works on real sheets. The loading path is proven by tests on made-up people: phones, two numbers on a row, ZoomInfo blocks, duplicates, snapshots, the limit and XLSX.

## Live check of CloudTalk (pending)

The CloudTalk connector was not attached to Q's session on 19 Oct, so Q could not run the read-only calls. Radar has it. Radar runs these three and pastes the results (names only, no contact data) into this section:

1. `cloudtalk_list_contact_tags` (limit 1000): are `Owner ...`, `Client ...`, `JO ...`, `Lead ...`, `TZ ...` already in use, and what pattern do existing tags follow?
2. `cloudtalk_list_groups`: the queues and teams.
3. `cloudtalk_list_agents`: names and ids, to match Owner tags to agents (and `favorite_agent_id` if Kev wants it).

Three things only the test load can answer: whether a tag that is not in the catalog is created on the fly, whether the account has a Time Zone custom field (there is no tool to list custom fields), and the exact shape CloudTalk accepts for phone_numbers.

## Failure handling

| Failure | What the run does |
|---|---|
| Rows with no phone | Gmail draft to Nida (reasons counted, list attached or inline), left in Kev's drafts. Never sent. |
| Mail tool or CloudTalk tool missing | Stops, writes "CloudTalk load did not run: <what was missing>" in the summary. |
| Create fails | Looks the contact up before any retry. Three errors in a row stop the run. |
| Count mismatch after load (tag `Lead <date>`) | First line of the summary. |
| Sheet has no recognisable header | That sheet is reported and skipped; the rest run. |
| More rows than the approved cap | Loads nothing and asks Kev. |

## The routine

- File: `employees/q/routines.yaml`, compiled by `npm run ct-routine -- compile` into `employees/q/routines/cloudtalk-nightly.md` (38,000 characters, self-contained, reads the live repo first like Radar's). Playbook: `employees/q/skills/cloudtalk-nightly.md`.
- Schedule: `CRON_TZ=America/Los_Angeles 3 23 * * 1-5`, 11:03pm Pacific, Monday to Friday, never Saturday (a test refuses any Saturday cron).
- `trigger_id` is empty on purpose. **The trigger must be created from Kev's account with the Gmail and CloudTalk connectors attached.** A schedule created by an agent carries no connectors, so it could not read the label or reach CloudTalk. `npm run ct-routine -- deploy` prints the payload.

## Decisions for Kev (Q's recommendation first)

| # | Question | Recommendation |
|---|---|---|
| 1 | Which nights? Monday to Friday nights load weekend mail on Monday night, ready Tuesday. | Sunday to Thursday nights, so Monday to Friday mornings are covered and nothing runs Friday night. One change (`0-4`). Built as asked until Kev says. |
| 2 | Already in Crelate: load or skip? | Load with the `In Crelate` tag so the guys still get the number. |
| 3 | Leads with no owner yet? | Load without an Owner tag, add it later. |
| 4 | Block ZoomInfo emails too? The rule says phones. | Yes, same rule. |
| 5 | Nida's phone source | Ask her to add a `Phone Source` column (Crelate, LinkedIn, own research). |
| 6 | Mobile numbers (Kev, 13 Oct: allowed on internal lead sheets) | Tool loads cell and mobile, refuses only home phones. Confirm. |

## Kev's two-minute steps

1. **The alias.** Google Admin, Users, kev@edenexec.com, Add alternate email: `radar@edenexec.com` (or add it as a group alias delivering to Kev). In Gmail, Settings, Filters and Blocked Addresses, Create a new filter, Has the words `deliveredto:radar@edenexec.com`, Apply the label `Radar/Leads` (create it). Leave the mail in the inbox. Ask Nida to mail her sheets there.
2. **The trigger.** From his account on claude.ai: Routines, New. Name "Q · CloudTalk nightly lead load (11pm, Mon-Fri)". Schedule: 11:03pm Pacific, weekdays. Attach the Gmail and CloudTalk connectors (and the CRELATE_API_KEY secret in the environment). Model Sonnet. Paste the prompt from `employees/q/routines/cloudtalk-nightly.md`. Send the trigger id to Radar to put in `routines.yaml`.
3. **The test.** Say yes (or no) to the QC item "CloudTalk 10-row test load" when Radar brings it. Until then the bot only reports.

## Files

| Path | What |
|---|---|
| `workshop/cloudtalk/leadplan.ts`, `csv.ts`, `xlsx.ts`, `cli.ts` | The tool (`npm run leadplan`) |
| `workshop/cloudtalk/leadplan.test.ts`, `routine.test.ts` | 40 tests |
| `workshop/cloudtalk/routine.ts` | Routine compiler (`npm run ct-routine`) |
| `employees/q/routines.yaml`, `employees/q/routines/cloudtalk-nightly.md` | The schedule and compiled prompt |
| `employees/q/skills/cloudtalk-nightly.md` | The playbook |

## Live check, done by Radar 19 Oct 2026 (read-only)

- **Connection:** the health check passes for company 344918.
- **Groups (3):**
  - Admin Team (307312)
  - Agents (283714)
  - Headhunters (307311)
- **Agents (7), name and extension:**
  - Kevin Williams 1000
  - Nick L 1001
  - Evan MacArthur 1002
  - Andrew Johnson 1003
  - Max Betcher 1004
  - Bridger Stainbrook 1005
  - Noah Fields 1006
- **Owner tags map to these agent ids:** favorite_agent_id can be set from the Owner column once Kev fills it in.
- **Contact tag catalog: 1,611 free-text tags.** None use the Owner / Client / JO / Lead / TZ prefix scheme yet, so the prefixed tags stay distinct.
- **Compliance flag for Kev:** the existing catalog holds tags on compensation ("150k", "$170 - 200k"), age ("45 years old"), family ("2 kids") and health or disability ("burn victim", "bad stutter"), plus personal judgments. The nightly load must never write tags like these. Kev decides whether the team retires them and how; nothing is deleted without Kev.
