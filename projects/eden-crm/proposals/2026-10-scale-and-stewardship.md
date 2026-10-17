# Will it scale, and what does it cost? CRM, Eden Daily and Radar's Notion

Q, 11 October 2026. Read-only research and sizing. Nothing spent. Numbers marked "assumption" are my planning figures, not measurements; UNVERIFIED means I could not confirm it from an official source.

## Result first

1. **The CRM data will scale fine. The cost to watch is call audio, not contacts.** 500,000 contacts with notes and tags is a few GB. A year of call transcripts is about 1 GB (assumption below). A year of call audio would be hundreds of GB. Kev's direction (12 October): get the facts out of the call, keep them forever in Eden's database, and move the audio to storage Eden owns. See the addendum at the end, which supersedes the earlier "audio stays in CloudTalk" idea.
2. **Stay up and live: Crelate stays the system of record until the switch.** Until then the mirror going down is an inconvenience, not an outage. The "never goes down" work (backups, restore drill, bigger compute, monitoring) lands in phase 4, before the switch, and is bought only when the numbers call for it.
3. **Radar will hit Notion's ceiling on machine-sized data, not on the ledger.** It already did once: on 10 October the hourly sweeps used up the shared SQL-query allowance (Radar's own note in `employees/radar/skills/ledger.md`). The fix is to give each kind of data one right home, not to buy a bigger Notion.
4. **Eden Daily today is the weak link.** The Eden Supabase organisation is on the free plan (500 MB, no backups, pauses after a week idle) and the connector login fails. The Pro upgrade is already queued (QC 2026-10-11-caaaac, $25 a month).

## The three-home rule (one place for each kind of data)

| Home | Holds | Why | Limit to respect |
|---|---|---|---|
| **Notion** | Kev's ledger, journal, pages he reads on his phone | Kev lives there and it is built for people | Notion API: about 3 requests a second per connection on most plans, 600 a minute on Business and Enterprise (Notion docs, checked today). A workspace-wide limit exists but its number is not published. Row and page-size limits: UNVERIFIED, the docs I read do not state one. |
| **Supabase (Eden Daily)** | Crelate mirror, calls, transcripts, notes, tags, sync logs, agent run logs | Built for volume, queries and joins; Eden owns it | Disk and compute, both cheap to raise (below) |
| **This repo (markdown)** | Playbooks, personas, tagging standard, project knowledge | Versioned, free, readable by every agent | None that matters at Eden's size |

Rule of thumb: if a machine writes it, or it grows without a person adding each row, it does not go in Notion.

## Sizing (assumptions: 10 recruiters, 30 calls each a day, 250 days a year)

| Item | Size | Where |
|---|---|---|
| Contacts, companies, jobs, pipeline, tags at 500,000 contacts | 2 to 5 GB (assumption) | Supabase |
| Call transcripts: about 75,000 calls a year at about 15 KB each | about 1.1 GB a year | Supabase |
| Call audio: 75,000 calls at about 10 MB each | about 750 GB a year raw, about 90 GB compressed | Office NAS plus a second copy (see addendum), not the database |
| Activity rows (calls, emails, notes) | tens of millions over years | Supabase, split by month once past about 10 million rows |

Supabase prices checked today: Pro from $25 a month, 8 GB disk included, $0.125 per extra GB, daily backups kept 7 days. At 20 GB the whole disk bill is about $1.50 over the included amount.

## Staying up

- **Now (mirror phase):** Pro plan so it never pauses and has daily backups; one health line a night in the sync log; Radar sees it ran.
- **Before the switch (phase 4):** a restore drill (prove a backup comes back), monitoring and alerts, and a compute size chosen from measured load. Point-in-time recovery and bigger compute are paid add-ons; UNVERIFIED prices, I will quote them from Supabase's pricing page at that point.
- **Design habits that keep it cheap later:** indexes on the lookups screens use, no personal fields stored at all, upserts instead of deletes, and a bulk-load path that never touches the live API in a loop.
- **Crelate's API has no total count** (probe on 11 October: `TotalRecords` is null), so syncs run by modified date. A full pull is paged and takes a while, which is why the first one goes to QC if it will run over an hour.

## Radar and Notion, step by step

| Stage | What changes | Cost |
|---|---|---|
| **Now** | Radar reads the two saved views once per run, never per email. Sweeps write one summary row, not one per message. | $0 |
| **After Pro is live** | Radar's run logs, sweep state and sent-item records move to a Supabase table. Notion keeps only what Kev reads. | $0 extra |
| **If the ledger itself slows** (say, over a few thousand open rows or repeated throttling) | Archive Done rows quarterly. If still needed, Supabase holds the working copy and Notion is the view, synced nightly. | Time, not licences |
| **Never** | Buy a bigger Notion plan to hold machine data. | n/a |

## Spend ladder: no throttling, no surprises

| Step | Trigger | Approx. cost | Who approves |
|---|---|---|---|
| Supabase Pro | Now | $25 a month | Kev (queued) |
| Extra disk | Disk over 70% | $0.125 per GB | Q reports, Radar queues QC |
| Compute upgrade | Slow queries seen in Supabase's own advisors or logs | UNVERIFIED, quote first | Kev |
| Point-in-time recovery | Before the switch | UNVERIFIED, quote first | Kev |
| Second vendor agents | Not before the mirror has run a week | usage-based | Kev |

Each step is a separate QC item with the number on it. Nothing here asks Kev to approve a range.

## Three decisions for Kev

1. **Adopt the three-home rule.** My pick: yes. Notion for what Kev reads, Supabase for what machines write, the repo for knowledge.
2. **Keep call audio out of our database, and out of CloudTalk's hands.** My pick: yes. Facts and transcripts live in Eden's database forever; audio goes to storage Eden owns (addendum).
3. **Approve the spend ladder as the standing rule** (each step quoted and approved when its trigger hits). My pick: yes. Pro at $25 a month is step one.

## Sources

Supabase pricing (supabase.com/pricing), Notion request limits (developers.notion.com/reference/request-limits), Radar's ledger playbook, the Crelate probe in `employees/q/memory/live/systems.md`.

## Addendum, 12 October 2026: facts first, then audio to storage Eden owns

Kev: "How do we get the info out of the call transcripts, saved to Eden brain memory for context, then get rid of housing the large file. Or move the file to a storage rack I own." Read-only research. Nothing bought or deleted.

### 1. The nightly pipe

1. **Pull** yesterday's calls from CloudTalk: call record, transcript (CloudTalk's Conversation Intelligence) and the recording file. The API is documented to "fetch call history, download recordings" (CloudTalk developer site); the exact endpoint and file format are in its API reference, which I have not yet read. UNVERIFIED: the WAV format and sample rate Radar mentioned.
2. **Extract** from each transcript into Eden's database: a short summary, the template fields Kev writes (for example "Were there any managers mentioned?"), people and companies mentioned, follow-ups with dates, and the Crelate contact or job it belongs to. Stored forever, tied to the call id. Candidate pay talked about on a call stays out of the extracted fields, per the privacy rule.
3. **Archive** the audio: download, compress speech to Opus (about 16 kbps is enough for talk, roughly 8 times smaller than raw WAV), write it to the NAS, then verify a checksum of the stored copy against the file we built.
4. **Only then** is the CloudTalk copy eligible for removal, and only under a retention rule Kev sets. The job never deletes anything in CloudTalk. When a call passes the rule, it lands on a QC list ("these 412 recordings are safely archived and past retention") and nothing is removed until Kev says yes. Deleting there is a `delete` item every time.
5. **Log** one line per night: calls pulled, facts saved, files archived, checksum mismatches, errors. Radar sees it ran. A mismatch stops that file's removal and tells Radar.

### 2. The box (sized from the 75,000 calls a year assumption)

| | Raw WAV | Opus |
|---|---|---|
| One year | about 750 GB | about 90 GB |
| Five years | about 3.75 TB | about 450 GB |

Assumes a 10-minute average call; real averages will move this, and the first week of data gives the true number.

- **Recommendation:** a 2-bay NAS with two mirrored drives of 4 TB each (4 TB usable). Compressed audio would fill it in decades; even raw WAV would last about five years. A 4-bay is not needed.
- **Must be able to run the job itself**, so no laptop has to be on. UNVERIFIED: that the specific model runs containers and a compression tool. The Synology DS224+ and DS423+ are x86 machines (a 2023 comparison article), but I found no confirmation of container support on those pages; check the model's product page before ordering.
- **Network design:** the NAS reaches out to CloudTalk and Supabase. Nothing on the office network is opened to the internet.
- **Price, all UNVERIFIED until quoted:** the 2023 comparison article put the DS224+ at about $330 to $360 and the 4-bay DS423+ at about $450 to $500, before drives. Two 4 TB NAS-grade drives are an additional cost I have not priced. Expect a total in the hundreds of dollars, not thousands. The purchase is a QC `spend` item with a real quote attached.

### 3. Risks and how each is covered

| Risk | Answer |
|---|---|
| One box in one office: fire, theft, flood, drive failure | Mirrored drives cover a single drive failure but not the building. Add a second copy: an encrypted cloud cold-storage bucket. Backblaze B2 lists "$6.95 / TB / mo" with no minimum storage duration fees (its pricing page, checked today). At 90 GB a year that is under $1 a month in year one. A rotating offsite drive is the cheaper alternative if Kev does not want cloud. |
| Recordings hold candidate personal and pay details | Encrypted at rest on the NAS and in the cloud copy, access limited to named people, no sharing links, nothing public. The cloud copy is encrypted before upload so the provider holds only scrambled files. |
| Recording consent | The notice at the start of every call still applies (Florida and Washington). Counsel confirms the wording before recording goes on. |
| Kev moves to Boise on 6 November | Pick the NAS location with that in mind (below). The sync job runs wherever the box is; moving it later is a power-and-network job, not a rebuild. |
| Lossy compression can't be undone | Fine for speech. The transcript and facts are made from the original before compression, and the original stays in CloudTalk until the checksum passes and Kev says yes. |
| Losing the facts | They sit in Supabase with daily backups (Pro). Back up the extracted facts to the repo or Drive as a monthly export too. |

### 4. Two questions for Kev

1. **Which office does the NAS live in?** My pick: the one that will be staffed longest through 2027. If that is Boise, buy it after the move, and until then the job can keep audio in cloud cold storage so nothing is lost in the gap.
2. **How long do we keep audio?** My pick: audio 2 years, transcripts and extracted facts forever. Set the rule before the first recording is removed.

### Next, if Kev says go

I read the CloudTalk API reference, prove one call end to end (pull, extract, compress, checksum) on a single test call with no deletions, and bring a priced NAS quote to QC. CloudTalk has to be recording every line first; that is still the step everything depends on.
