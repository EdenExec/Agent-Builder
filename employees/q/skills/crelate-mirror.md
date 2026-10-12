# Crelate mirror (phase 1 of the Eden CRM)

Goal: a nightly read-only copy of Crelate in a database Eden owns, so Radar, Scout and the new screens can read it without touching Crelate. Brief: `projects/eden-crm/brief.md`.

## Facts that bite (checked 11 Oct 2026)

- API v3 only: `https://app.crelate.com/api3/`, header `X-Api-Key: $CRELATE_API_KEY`. v1 and v2 return 410.
- Cloudflare blocks Python's default client (error 1010). Use curl, or set a normal browser User-Agent on every request.
- Responses are `{Data, Metadata, Errors}`. Page through `Metadata` until done; respect rate limits and back off on 429.
- Contact records carry EEO fields (ethnicity, gender, disability), salary expectations, home addresses and personal email and phone.

## What the mirror holds

| Table | From Crelate | Kept | Left out |
|---|---|---|---|
| contacts | Contacts | id, name, current title and company, LinkedIn URL, tags, owner, created and modified dates, record type (candidate, client contact, both) | EEO fields entirely; salary and comp; home address; personal email and phone stay in Crelate and are looked up there when needed |
| companies | Companies | id, name, type, sector, location (city and state), tags, client status | none |
| jobs | Job orders | id, title, company, status, location, owner, open date, seats | fee terms |
| pipeline | Job pipeline entries | job id, contact id, stage, stage date, owner | private notes |
| activities | Activities | type (call, email, meeting, submittal, interview), date, owner, contact id, job id | message bodies |
| tags | Tag lists | id, name, group (book, sector, company type, referral and the rest) | none |
| sync_log | written by the job | run time, rows read, rows changed, errors | |

Work phone numbers for missed-call matching are the one contact detail the mirror may hold, hashed or last-seven-digits only, so Radar can match a caller without the number sitting in a table anyone can browse. Decide the exact form with Kev before the first run (QC `modify_brief`).

## Where it lives

The Supabase project "Eden Daily" (org Eden) is the default home. Its read-only connector currently fails to authenticate (11 Oct); fixing that is your first task. Schema changes are migrations in this repo, reviewed before apply. Row-level security on, no public read.

## The job

1. Nightly at 2am Pacific, skipped on Saturday (Sabbath) unless Kev says otherwise.
2. Incremental by modified date after the first full pull; the first full pull is a QC item if it would run more than an hour.
3. Upsert, never delete: a record gone from Crelate gets `removed_at` set.
4. Write one `sync_log` row. If errors exceed 1% of rows, stop and tell Radar.
5. Every screen or sheet that reads the mirror shows "Crelate copy, synced <time>".

## Proof before claiming done

- Row counts in the mirror match Crelate's own counts for contacts, companies and jobs (within the incremental window).
- Three random contacts compared field by field, reported by Crelate id only.
- A query proving no EEO, salary or address column exists.
