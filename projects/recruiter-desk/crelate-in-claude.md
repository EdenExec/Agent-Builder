# Crelate in Claude: the Eden way (for every recruiter)

Kev, 27 Oct 2026: no custom server, no hosting, no OAuth. Use the same setup Kev uses. Claude calls Crelate's API directly, from inside a Claude cloud session, with the recruiter's own key held as a secret in the environment.

## Setup (about 10 minutes, once)

1. **Get your own Crelate API key.** In Crelate, look under your account settings for the API key. If it isn't there, ask Kev to issue one. Use your own key, never someone else's.
2. **Open Claude Code on the web**: https://claude.ai/code. Start a session on the repo `EdenExec/recruiter-kit` (Kev or Nick adds you if you can't see it). It holds only what recruiters need; never use the main company repo (Kev, 30 Oct 2026).
3. **Add the key to the environment.** Open the cloud environment menu in the session's title bar, then Edit. Add the key under **Network secrets** (or as an environment variable) named exactly `CRELATE_API_KEY`. Never paste the key into the chat.
4. **Let the environment reach Crelate.** In the same settings, under Network access, add `app.crelate.com` to the allowed domains, and leave package managers allowed.
5. **Start a new session.** A new session picks up the key. Tell Claude: "Use the recruiting assistant, Crelate read-only." Step by step: `after-the-api-key.md`.

That's it. There is nothing to host, pay for or maintain, and the key never leaves the environment.

## Rules for Claude (read before the first call)

- **Read-only.** GET requests only. Never POST, PUT, PATCH or DELETE: no stage moves, notes, tags or edits. The recruiter does those in Crelate. If a write ever becomes worth automating, it goes to Kev first.
- **The basics:**
  - API v3 only: `https://app.crelate.com/api3/`.
  - Send the header `X-Api-Key: $CRELATE_API_KEY` on every call.
  - Read the key from the environment; never print it.
  - Responses come back as `{Data, Metadata, Errors}`. Page through `Metadata`, and back off on a 429.
- **Cloudflare blocks default clients** (error 1010). Use curl, or send a normal browser User-Agent on every request.
- **Endpoints that work**:
  - Find a person by name: `contacts/search?query=First%20Last`. The record's `Title` is "Last, First".
  - Active jobs: `jobs?statuses=<ids>&fields=Id,JobNum,Name,SalesWorkflowItemStatusId`.
  - Who moved through a job's stages: `jobs/<jobId>/contacts/history?created_after=<ISO date>`.
  - Calls, emails and meetings: `activities?verb_ids=<ids>&when_after=<ISO date>`.
  - Plain `contacts?search=` ignores the search term. Use `contacts/search` instead.
- **Privacy:**
  - Contact records hold EEO fields, salary expectations, home addresses and personal phones and emails. Never copy those into a file, a doc, a chat summary or the repo.
  - Names, titles, companies, stages and dates are fine for your own work.
  - No candidate details on team surfaces beyond name, stage and dates.
- **Discreet clients:**
  - Discreet clients show as "Client · discreet".
  - Material for one client never names other clients.

## What you can ask for on day one

- "Is <name> already in Crelate? Who owns them, and when were they last touched?"
- "Who is in each stage on <job>?"
- "Check this lead list against Crelate and mark who's already in."
- "What did I log this week: calls, submittals, first interviews?"
