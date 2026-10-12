# Will it scale, and what does it cost? CRM, Eden Daily and Radar's Notion

Q, 11 October 2026. Read-only research and sizing. Nothing spent. Numbers marked "assumption" are my planning figures, not measurements; UNVERIFIED means I could not confirm it from an official source.

## Result first

1. **The CRM data will scale fine. The cost to watch is call audio, not contacts.** 500,000 contacts with notes and tags is a few GB. A year of call transcripts is about 1 GB (assumption below). A year of call audio would be hundreds of GB. So: audio stays in CloudTalk, and Eden's database holds the transcript text and a link.
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
| Call audio: 75,000 calls at about 10 MB each | about 750 GB a year | CloudTalk, not ours. Keep a link and a retention rule. |
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
2. **Keep call audio out of our database.** My pick: yes. We hold transcripts and links; CloudTalk holds audio. Ask Matias about retention and export so the audio is not lost if we ever leave CloudTalk.
3. **Approve the spend ladder as the standing rule** (each step quoted and approved when its trigger hits). My pick: yes. Pro at $25 a month is step one.

## Sources

Supabase pricing (supabase.com/pricing), Notion request limits (developers.notion.com/reference/request-limits), Radar's ledger playbook, the Crelate probe in `employees/q/memory/live/systems.md`.
