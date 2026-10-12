# Eden owns its data, Claude Projects access, and agents from other vendors

Q with Radar, 11 October 2026. Read-only research. Nothing spent, sent or signed up for. Facts I could not confirm from an official source are marked UNVERIFIED.

## Result first

1. **Own the data: yes, in Supabase, but not on the free tier.** Eden's Supabase organisation is on the free plan. Free means 500 MB per project, no automatic backups, and the project pauses after one week of inactivity (Supabase pricing page, checked today). A Crelate mirror plus calls and transcripts will pass 500 MB. Pro is from $25 a month, with 8 GB included and $0.125 per extra GB. The Eden Daily login also fails today, so we cannot read it yet.
2. **Claude Projects: no way in that I could verify.** I found nothing official that lets Radar or Q read a claude.ai Project's knowledge. The practical route is for the knowledge to live in a folder we can both read (this repo or Drive), with the Project pointing at the same files.
3. **Codex and Gemini: not now.** The first win is to get Eden's own database and call pipe live. Other vendors' agents add keys, cost and a place where candidate data could leak, and they solve no problem Eden has this month.

## 1. Eden owns its data

**What the database holds** (all in one Postgres, one schema per source so a vendor can be swapped without touching the rest):

| Schema | Holds | Fed by | Notes |
|---|---|---|---|
| `crelate` | Contacts, companies, job orders, pipeline stages, activities, tags | Nightly read-only pull (Q) | EEO fields never copied. Salary and home details stay in Crelate. Stamped with sync time. |
| `calls` | CloudTalk calls, recording links, transcripts, AI notes | Nightly pull (Q), once CloudTalk records every line | Recording files stay in CloudTalk or Drive; we keep links and text. |
| `notes` | Call notes, Plaud and meeting notes, recruiter notes | Pipes from Plaud and the CloudTalk notes | Candidate names and role only, as everywhere else. |
| `tags` | The tagging standard: one canonical name per concept, with the merge map from variants | Seeded from `memory/seed/crelate-tagging.md` | Open points from the 14 July meeting stay marked open. |

**Who does what.**

| Cody (architect) | Q (runs it day to day) |
|---|---|
| Owns the schema, naming standard and access rules. Approves any new table. | Builds and runs the pulls, tests, backups check and the nightly log line. |
| Decides what Rhaven may read and write. | Keeps the mirror honest: row counts against Crelate, errors, sync time on every screen. |
| Signs off the upgrade and the retention rules with Kev. | Files every spend and every write into a live system as a QC item. |

**How Rhaven changes role.** Rhaven stops being the store. It gets a database login scoped to the schemas Cody approves, reads calls and the mirror from them, and writes its output (notes, deal-desk fields) back to Eden's tables. If Rhaven went away, Eden would lose a tool, not its history.

**Before any of this runs:**
- Eden Daily is on the free plan (Supabase organisation "Eden", plan free). Pro is a spend, so it goes to QC.
- Both read-only and admin logins failed with "password authentication failed" when I tried through the Supabase connector today. Kev or Cody needs to re-link the connector or reset the database password. I never need to see the password.
- UNVERIFIED: how much data Crelate actually holds. The first mirror run gives the real count; my planning size is 2 to 5 GB at 500,000 contacts.
- Cost note: on Pro, 5 GB over the included 8 GB would cost under $1 a month. Storage is not the cost to watch; people and tools are.

## 2. Access to Kev's six Claude Projects

Projects: Workshop Computer, EPG 2.0, The Word, BRAIN (Eden Brain), Strat Growth and Coaching, Eden Lead Gen.

**Verified (Claude Help Center, today):**
- Projects hold uploaded documents, text files and code snippets, used across the chats in that project.
- On Team and Enterprise plans a project can be shared by email or organisation-wide, as "Can view" or "Can edit".
- The two articles I read say nothing about an API, an export, or a connector that reads project knowledge from outside claude.ai.

**Not verified:**
- UNVERIFIED: any official API endpoint for Projects. One third-party blog claims a project parameter exists in the SDK; I do not believe it, and found nothing in Anthropic docs.
- UNVERIFIED: whether Projects can sync from Google Drive or GitHub today. I remember such features, but neither page I fetched mentions them. Kev can check in the Project's knowledge panel in a minute.
- No connector in this session reads claude.ai Projects (Radar's note matches my tool list).

**Fallbacks, best first:**
1. **One home for knowledge.** Kev moves the files that matter from each Project into a folder: `knowledge/<project>/` in this repo, or one shared Drive folder. The Project then points at the same files if it supports Drive or GitHub, or Kev re-uploads when they change. Radar and Q read the folder. Cost: nothing. Effort: one sitting for six projects, then a weekly check.
2. **Drive folder.** Same idea, easier for Kev to drop files in. Both of us already read Drive through the connector. Weaker for version history.
3. **Notion pages.** Works through the Notion connector, but it adds a third copy to keep in step. Use only if the team already lives there for that project.

**Privacy line:** nothing with salary, home details or EEO data goes in these folders.

## 3. Managing agents from other vendors (Codex, Gemini)

**What it would take:**
- **Access.** An API key per vendor, stored as an environment secret, never in chat or the repo. Gemini CLI has a non-interactive mode and supports MCP servers (Gemini CLI docs). Its docs say a free API key allows 250 requests a day on the Flash model, and a paid key bills per token. The same page says Gemini CLI was replaced by Antigravity CLI on 18 June 2026, so the details may be stale. UNVERIFIED: current Gemini pricing.
- **Codex.** The Codex SDK has TypeScript and Python libraries for running Codex from CI (OpenAI docs). The page I read did not cover billing or API-key login. UNVERIFIED: how Codex bills when run unattended.
- **Where work lands.** In a branch or a Drive file, never directly in Crelate. Every write to a live system still goes through `npm run qc -- submit`.
- **Data risk.** Candidate records sent to another vendor widen who holds Eden's data, which cuts against Kev's own principle. Only job-description-level or de-identified text should go out.
- **Cost.** Per-token usage plus someone's time to supervise. No spend has been made.

**Is it worth it now? No.** Eden's friction today is calls not recorded, a mirror not built, and a database Q cannot log into. A second vendor fixes none of those. Gemini is already in use for Plaud call notes, so that stays as a prompt, not an agent.

**When to revisit:** after the mirror and call pipe have run for a week. The first pilot should be one small unattended job (for example, summarising one call into a note) run from a GitHub Action, with the key in secrets, writing to a table, and QC on anything that leaves the database.

## Three decisions for Kev

1. **Upgrade Eden Daily to Supabase Pro (about $25 a month) and make it the home of the Eden database.** My pick: yes. Free pauses after a week idle and has no backups, which is wrong for the company's records. This is a spend, so it goes to QC; nothing is bought until Kev approves.
2. **Put Project knowledge in one folder Radar and Q can read.** My pick: `knowledge/<project>/` in the repo for text files, with Drive for anything bulky. Kev starts with BRAIN (Eden Brain), since it matters most to Q. Please also check whether your Projects show a Drive or GitHub sync option and tell Radar.
3. **Keep other vendors' agents off the list until the mirror and call pipe have run a week.** My pick: yes, wait. Then pilot one small Gemini or Codex job under the rules above.

Also needed, not a decision: Kev or Cody re-links the Supabase connector or resets the Eden Daily database password so I can read it.

## Sources

- Supabase pricing: https://supabase.com/pricing
- Claude Help Center, Projects: https://support.claude.com/en/articles/9517075-what-are-projects and https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects
- Gemini CLI quota and pricing: https://geminicli.com/docs/resources/quota-and-pricing/
- Codex SDK: https://learn.chatgpt.com/docs/codex-sdk
- Brief and call-intelligence study in this folder.
