# Systems Eden runs (seed inventory, 11 October 2026)

Facts as Radar knew them on hire day. Check a row before relying on it; write what you learn to `memory/live/systems.md` with the date. "Connector" means a tool in this session reaches it without code.

| System | What it holds or does | Owner of the facts | How you reach it | Known quirks |
|---|---|---|---|---|
| Crelate | Candidates, client contacts, companies, job orders, pipeline, activities, tags, client portal. System of record for recruiting. | Crelate | API v3 `https://app.crelate.com/api3/`, header `X-Api-Key: $CRELATE_API_KEY` (Network secret) | v1/v2 return 410. Cloudflare blocks Python's default client (1010): use curl or a browser User-Agent. Contacts carry EEO, salary and home details: never copied. |
| Supabase "Eden Daily" | Default home for the Crelate mirror and Eden's own tables. Org "Eden" (`qnauepekhurcovyhfedv`), project `fgteoiwoysrjjoenozed`. | Eden | Supabase connector | 11 Oct: `list_tables` fails, password authentication failed for the read-only user. First task: find out why and fix it (reset or reconnect, never paste a password in chat). |
| Notion | Kev's ledger (database `d18ce0753b65404a86e4992be19124df`) and the Eden Journal. | Radar | Notion connector | SQL query tool hit the workspace quota; read through the saved views "Radar · Open for Kev" and "Radar · All open" instead. Select fields accept only their listed options. |
| Google Drive | The Eden Daily folder (`1DvqQIdEi0gt9AEImtR20_T3HdQAa8AaN`), the archive (`19EYZokFjw0KgT-_ollIgYRP11UnTBavN`), lead lists, the Eden App blueprint doc. | Kev | Drive and Docs connectors | Uploads take text content; large base64 uploads fail. One file per call. |
| Gmail (personal) | kdt.williams@gmail.com: orders, family, Google Voice voicemail emails once Kev turns them on. | Kev | Gmail connector | |
| Superhuman | Kev's work mail and calendar (edenexec.com accounts). | Kev | Superhuman connector | Several accounts may be linked: list them first. |
| Google Calendar | Kev's calendar. | Kev | Calendar connector | |
| CloudTalk | Eden's VOIP. Plan: all incoming calls route to Kev's Google Voice line; Radar ranks call-backs. | Eden | No connector yet. CSM: Matias. | Ask whether it can hand calls to an AI voice agent before buying anything. |
| Google Voice | Kev's number; voicemails and missed calls arrive as emails once enabled. | Kev | Through Gmail | Voicemail-by-email not yet turned on (11 Oct). |
| ZoomInfo | Company and contact search for lead lists. | Eden (licence) | ZoomInfo connector | Eden recruiting use only; no resale, no bulk unsolicited outreach. |
| Plaud | Kev's recorded meetings and trainings with transcripts. | Kev | Plaud connector | Newest files were from September on 11 Oct; Kev's new training may land elsewhere first. |
| Zoom, Wispr Flow | Meeting recordings and notes. | Kev | Connectors | |
| Netlify | Static sites (the Kim and Dave trip site, `london-rome-thenhome`). | Kev | Netlify connector; deploys on push to the site repo's main | |
| Claude artifacts | The Eden Desk (https://claude.ai/artifact/5SuFoioujKFV6KgX4dXi3G), Atlas Desk, Marlowe's Desk. Each has a small shared database. | Radar, Atlas, Marlowe | Artifact and ArtifactData tools | Another session may publish the same page; merge onto the live version, never overwrite. |
| ElevenLabs | Voice audio for Atlas episodes and tours. | Kev | `ELEVENLABS_API_KEY` (Network secret) | Creator plan, character budget limited: check before a long render. |
| QuickBooks, Gusto | Books and payroll. | Kev | Connectors | Read only unless Kev asks; never touch payroll. |
| This repo (EdenExec/Agent-Builder) | The employees, Radar's routines, the workshop code, QC queue, project briefs. | Kev | Git | No pushes on Saturday. |
