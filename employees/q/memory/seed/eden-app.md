# The Eden App (the "Eden brain"): blueprint for the engineer

Seeded 11 October 2026. Everything below is taken from the sources listed at the bottom. Where a source is silent, this file says "not stated". Kev's own words are in quotes.

## Bottom line

1. **Crelate stays the system of record for now.** The newest plan (11 Oct 2026) is: nightly read-only mirror of Crelate first, then screens on the mirror, then write paths back into Crelate through its API, then switch off Crelate only "after the team runs a full week on the new screens" [Brief, Goal; Phases 1-4]. The older blueprints assumed the app reads Crelate live through the API [App §2.4] and that the app makes the recruiter "more effective in Crelate" rather than replacing it [Notes §I]. Build to the newest plan.
2. **Tags carry the data model.** Crelate's API does not support custom picklist fields, so every bucket level (time zone, market, book, sector, company type, title) lives in Crelate as a tag, and the app translates between its UI fields and Crelate tags [App §2.4; App §5.1]. The tag vocabulary is set out in `crelate-tagging.md`.
3. **The recruiter's own day comes first.** Phase 1 of the Nov 2025 roadmap is the Personal Desk (daily checklist that deep-links into Crelate, block calendar, notes, personal scorecard), the company scoreboard and leaderboard, hot job orders, and a minimal work-ticket form [Notes §IV]. The app is meant to be the "Recruiter ADD killer" [Notes §I].
4. **The look is part of the spec.** "Johnny Ive meets James Bond", a cream or off-white background, Montserrat, collapsible "beautiful tiles", and an "Augusta Masters scoreboard" for performance [App, Feature Checklist]. Kev on the CRM: "Loxo's skin is far more pretty than Crelate." [Brief #12].
5. **Partners are 1099 contractors, so features must read as optional.** Present training, tickets, templates and leaderboards as optional resources and peer tools. Do not build them as management controls [App §1.1 table; PDF §1.1].

## Sources and how they are cited

| Key | Source | Date | Notes |
|---|---|---|---|
| App | Google Doc "Eden App" (Drive `1Uw-iPrwY3CxRmSHl8MK7V_J4GI6Q0iDc8rCQFxIusc0`), titled inside "APP: Eden Partner Group" | modified 16 Jul 2026 | Kev's living blueprint: one tab, about 35k characters, 3 mockup images. Kev's own edits are marked "I (kw)". |
| App mockup: X | The 3 images in the App doc's "Page Examples" section (Biz Dev Buckets, Job Order Dashboard, Daily Standup / "Kev's Daily Guide") | same | Read visually. The sample job orders in the dashboard mockup are placeholder companies. |
| Notes | Google Doc "APP Meeting Notes" (`1nJLroSjZgQDfxjEHNFXr6k4K_xhPfC_4bt4dB4pTdw4`), in folder "Eden App: Running Meeting Notes" | created 24 Nov 2025, modified 19 Jun 2026 | Summary of an "App Deep Dive". The sections run I, II, IV, V. There is no §III. |
| PDF | "APP_ Eden Partner Group.pdf" (`1e-kkqwixIAxhAwMtCoYXit9WdV5Mjl8C`) | 1 Sep 2025 | The earlier, longer research version of the App doc, with 64 works cited. Where it differs from App, App is newer. |
| Brief | `projects/eden-crm/brief.md` | 11 Oct 2026 | Kev's CRM feature dump and the four build phases. Newest. |
| Radar sources | `employees/radar/memory/live/sources.md` | 11 Oct 2026 | Crelate API v3 facts. |
| Tag mtg @mm:ss | Plaud recording "07-14 Weekly Meeting: Standardizing CRM Tagging System..." | 14 Jul 2026 | See `crelate-tagging.md`. |
| Tag SOP §n | "EPG - Playbook - Crelate Tagging SOPs" (Google Doc `10piWHfIzD1q-cVVYNiu396BCJwQDY8cGTORT31vKqjQ`; same text as the .docx `1LdUtRQsD6aVuzlsn8dsmddJxzLpIqyaG`) | Dec 2025 / May 2026 | The written tagging guide from before the 14 Jul meeting. See `crelate-tagging.md`. |

## 1. What the app is

| Item | Statement | Source |
|---|---|---|
| Purpose | "Create an all-in-one landing space, where recruiters and team members can fall in love with the work they are doing." | [App §1.2, "The desired result"] |
| Core metaphor | A central **Command Center** for recruiters and leadership; "the antithesis of the existing Crelate experience: simple, clear, and focused" | [Notes §I] |
| Primary job | "Recruiter ADD killer": combine checklist and calendar, give admin and progress tracking one home, "thus allowing the recruiter to be more effective in Crelate" | [Notes §I] |
| Culture goal | A "tribe" and a "home base" built with "dopamine design": celebrations for closed deals, animations as candidates move through the pipeline, a "virtual watercooler" | [App §1.2; PDF §1.2] |
| Three areas | Company Command Center/Scoreboard; Personal Desk/Command Center; Ecosystem (EdenU, Doc Hub, Job Board, Work Tickets) | [Notes §I table] |
| Users | Recruiters and partners (1099 network), researchers/BPO, admins/owners, team leads, clients (portal), third-party partners (job order dashboard) | [App §3.2; Notes §II.D; App §5.2; App, Page Examples] |

## 2. Modules and screens

### 2.1 Company Command Center (landing page, also called the "Bullpen")

| Screen or feature | What it does | Requirement or rule | Source |
|---|---|---|---|
| Landing Page / Bullpen | First view after login | Company-wide metrics plus a leaderboard for all users | [Notes §II.A] |
| Company Metrics & Leaderboard | Firm standings, company revenue, placements, top performers | Weekly, monthly, quarterly and annual views "to prevent discouragement" | [Notes §II.A] |
| Landing dashboard KPIs | Revenue, active interviews, close rate | "Five-second rule". Key KPIs at top-left. Green/red status. Simple trend graphs. Separate views for owner and recruiter | [App §4.1; App §VI Phase 3] |
| On-track/off-track gauge | Each recruiter's weekly KPI, monthly goal, quarterly projects | On the recruiter's landing view | [App §4.1; App, Feature Checklist] |
| Announcements / Bulletin Board | Company news, monthly focus ("scripture"), core values | Display only. Leadership manages the content | [Notes §II.A] |
| Dopamine Drip / Deal Celebration | Company-wide visual when a deal closes | Triggered when a Revenue Report entry is submitted | [Notes §II.A] |
| Revenue Report | Recruiter logs a closed fee or deal | Quality-control gates, e.g. a check for a signed offer and background clearance | [Notes §II.A] |
| Hot Job Orders | Shown on the company view | Phase 1 | [Notes §I; §IV] |
| Easy Navigation Menu | Links to EdenU, Doc Hub, Job Board, and other modules | Phase 1 | [Notes §II.A] |

### 2.2 Personal Desk (per recruiter)

| Feature | What it does | Requirement or rule | Source |
|---|---|---|---|
| Daily Checklist ("Big Three") | 3 to 5 core daily tasks, e.g. call list, submittals | "**Crucial:** Must hyperlink directly to the specific list/page within Crelate." | [Notes §II.B] |
| Block Calendar View | The user's Google Calendar block schedule, e.g. Power Hours | Simple Google Calendar integration | [Notes §II.B] |
| Time Zone Clock | Current time in the calling time zones | Simple widget | [Notes §II.B] |
| Personal Scorecard | Individual KPI tracking, e.g. "15 RPs/day", tied to annual compensation goals | Must be separate from the company leaderboard | [Notes §II.B] |
| Notes / Scratch Pad | Quick capture of thoughts and leads | Feeds the daily Recap/Checkout | [Notes §II.B] |
| AI Hyperlinking Suggestion | Highlights names and companies in notes that could be linked to Crelate records | "System intelligence to identify potential Crelate entities" | [Notes §II.B] |
| "My Why" | Personal motivation text or image | Simple setting | [Notes §II.B] |
| Quick Links | The user's own saved links (Calendly, Zoom, templates) | User can add and save | [Notes §II.B] |
| Open Work Tickets panel | The user's uncompleted tickets | Collapsed by default, but always visible as a reminder | [Notes §II.C] |
| Daily Standup / "Kev's Daily Guide" | "Your intelligent to-do list, ready for the day" | Built from a Crelate WIP report plus "a GPT that prompts me every EOD to recap what we're working on". Kev: "I envision this becoming a teammembers daily To Do list." | [App, Page Examples; App mockup: Daily Guide] |

The Daily Guide mockup shows these panels: Stand-up Notes (collapsible), Important Emails ("Connect Gmail"), the day's schedule blocks (e.g. All Team Sync, Pwr Hr blocks per job order, Admin, Admin: daily review), Top Priorities (client: roles), WIP, Ops, New To-Do's (free-text add), a progress ring, and a To-Do List grouped as "Daily Rituals" and "Ops", with a History button [App mockup: Daily Guide].

### 2.3 Business development and recruiting

| Screen | What it does | Detail | Source |
|---|---|---|---|
| Biz Dev Buckets | Hierarchical, collapsible tiles for company leads | Time Zone > Geographic Market > Book of Business > Sector > Company Type > Individual Company | [App §2.4] |
| Recruiting Buckets | The same drill-down for candidates | Time Zone > Geographic Market > Book of Business > Sector > Company Type > Title within that sector (e.g. Field Operations, Project Management, Engineering, Sales) | [App §2.4] |
| Bucket per book and per senior recruiter | "There would be a market list built for the Construction recruiting book, the Oil & Gas Book, the healthcare book, the finance book, etc. Each Senior Recruiter we bring in would have buckets built out for their desired markets." | Each subcategory is "a clickable link that takes you to Crelate call lists. OR those links could take you directly to Call Logic for calling campaigns" | [App, Page Examples] |
| Biz Dev Lead Buckets (Nov 2025 framing) | "A passive view for junior recruiters to see high-level market/lead data" | Data "pulled and beautified from external sources (e.g., LinkedIn Talent Insights)". Phase 3 | [Notes §II.D; §IV] |
| Job Boards page | Ranks inbound job orders | By dollar amount, percent to close, client ranking (A-level, new, proven) | [App, Feature Checklist] |
| Job Board (Curated) | Branded list of open job orders **with signed fee agreements** | Only Team Leads can post or edit. Recruiters "claim" a job order by adding their initials | [Notes §II.D] |
| Job Order Dashboard | "Where 3rd party partners can view active jobs, add jobs to be worked on, and get a quick overview on the recruiting side of the business" | See mockup below | [App, Page Examples] |
| Client Portal | Clients "shop" for candidates | See §2.5 | [App §5.2] |

**Biz Dev Buckets mockup** [App mockup: Buckets]:
- Header: a live clock, "Drive Time Active", and time-zone chips (Pacific, Mountain, Central, Eastern).
- Sort toggle: "North to South" or "Growth Rate".
- One column per time zone. Each market card shows city, state, one sector chip (Tech, Government, Logistics, Energy, Healthcare, Entertainment, Finance) and "Y.o.Y growth rate".
- An expanded card shows the company-type tree:
  - GCs: commercial, high-tech, public, civil, water
  - Subs: structural, MEP, Electrical, Interiors
  - Developers: mixed-use, office, emerging
  - Consultants: Owners Reps, CMs, Designers
  - MPCs: GC Dawgs, Owner Dawgs, Sub Dawgs
- Markets shown: Pacific: Seattle, Portland, Sacramento, Stockton, SF Bay Area, Bakersfield, Oxnard-Thousand Oaks, Los Angeles, Riverside-San Bernardino, San Diego. Mountain: Boise, Salt Lake City, Provo, Reno, Greeley, Denver, Colorado Springs, Las Vegas, Phoenix, Tucson. Central: Minneapolis, Chicago, Kansas City, Nashville, Oklahoma City, Dallas-Fort Worth, Huntsville, Austin, Houston, San Antonio. Eastern: Columbus, Indianapolis, Raleigh & Durham, Charlotte, Charleston, Atlanta, Jacksonville, Orlando, Tampa, Miami.
- Footer: "EDEN EXECUTIVE SEARCH | edenexec.com".

**Job Order Dashboard mockup** [App mockup: Job Order Dashboard]:
- Header: "EDEN PARTNER GROUP", "+ New Job Order", Logout.
- KPI tiles: JOs Posted (last 7 days), FTIs Scheduled (last 30 days), Split Deals Closed (YTD).
- Active Job Orders: title, company, location, and a status chip. The chips are Retained (green), Signed Fee Agreement (blue), Hot (orange), Warm (yellow) and Lead (grey).
- Right rail: Website Expectations & Rules, New Partner Welcomes, Tips & Best Practices.

### 2.4 Operations

| Feature | What it does | Detail | Source |
|---|---|---|---|
| Work Ticket System | Offload repeatable tasks: research, invoices, email blasts | Kev rejects a third-party tool: "***I (kw) feel we could achieve this simply by incorporating a form to be filled out for desired results.***" | [App §2.3] |
| Ticket forms Kev named | "MPC Marketing Help form", "Invoice form", "Candidate Pool Creation form" | "Need a list built for targeted research? Fill out the Candidate Pool Creation form." | [App §2.3] |
| Ticket destinations | Drop-down: Recruiting, Business Development, Operations | MVP in Phase 1 | [Notes §II.C; §IV] |
| Ticket framing (legal) | Voluntary back-end support for contractors | App: "an internal tool to enable Contractors, on a voluntary basis, to receive back-end support". PDF (older): an "internal marketplace" where contractors "claim" tasks and the requestor is a peer, not a manager | [App §1.1 table; PDF §1.1 table] |
| Document & Template Hub / Doc Hub | All SOPs and templates (resume, fee agreement, cover letter), flowcharts, Loom videos | Flat top-level folders. Metadata tags by client, project or document type. Role-based access | [Notes §II.D; App §2.2] |
| Centralised transcripts | "The centralization of all transcripts, documents and templates within the application is a foundational step" | | [App §2.2] |
| Admin back-end | Roles: Researchers, Recruiters, Admin | See §6 | [App, Feature Checklist; App §3.2] |
| Private framework | "Blank pages dogtagged for future expansion": hidden pages to build and test features before launch | Only developers and admins can see them | [App §3.2] |
| Outsourced admin | BPO team for back-end administration and data clean-up | | [App, Feature Checklist] |

### 2.5 Client-facing

| Feature | Detail | Source |
|---|---|---|
| Client Portal "shop" | Clean menu of qualified candidates, "similar to an RMLS report from a real estate agent". Each profile is a "file". The client "checks out" a candidate for an interview | [App §5.2] |
| Cart | "Clients can select candidates to be added to their 'cart'." (The older PDF said clients "set interviews directly".) | [App, Feature Checklist; PDF, Feature Checklist] |
| Search status report | Dashboard "with a Manila folder vibe": what has been done and which candidates are at which stage | [App §5.2] |
| Resume review | "Clean and simple resume review for screen sharing purposes (pull directly from google drive for client staffing meetings)" | [App, Feature Checklist] |
| Auto-close stalled jobs | The portal "would also enforce best practices... by automatically closing jobs that become stalled (e.g., the Swinerton Dallas example)" | [App §5.2] |
| RP activity per job | "RPs tagged to specific jobs, so clients see how much activity we put into their searches" | [Brief #6, #7] |
| Phase | Full client portal is "Future" in Phase 3 (Nov 2025). It is a write-path item in the Brief (Phase 3) | [Notes §IV; Brief, Phases] |

### 2.6 Learning, communication, culture

| Feature | Detail | Source |
|---|---|---|
| EdenU / Eden University | LMS: modules, a badge system, linked to the compensation structure. Automated course assignment by role and start date. Progress tracking. Videos, documents, quizzes. Push reminders | [Notes §II.D; App §2.1] |
| Levels | 101 / 201 / 301. Loom playlists: "Eden 101: 30 day, Intros videos, how to's on setup", then "30-90 day, in the weeds", then "90+ Eden 201" | [App, Feature Checklist; App §2.1] |
| Onboarding | Ramp plan, 30-day and 90-day checklists, 6-month review, annual planning ("10-5-3-1, Recruiter GPS, Vision/Traction/Rocks") | [App, Feature Checklist] |
| Training GPT / RAG | A training GPT plus NotebookLM visuals. Content runs "through Next Level Exchange, The Recruiter University" and Eden SOPs | [App §2.1] |
| Client Script Generation | Recruiter submits a client name. AI pulls from CRM, Drive and other sources to build a "buzzword sheet", a living document | [App §2.1] |
| RAG chatbot | Answers questions from the private knowledge base and CRM. Turns call notes into CRM tasks, e.g. "Create a company profile for Acme Inc." Data source: "Ketch all Gemini or GPT file" (spelled "Catch all" in §3.1) | [App §3.1] |
| Messaging | In-app announcements and notifications. Live channels for "PwrHrs", live training and role play, "I do/we do/you do". The Nov 2025 action item is to use **Google Chat** "avoiding rebuilding a messaging service" | [App, Feature Checklist; Notes §V.4] |
| Live-streamed calls | Stream recruiter calls over a headset into Zoom for training | [App, Feature Checklist] |
| Recruiter Directory | Shows recruiter partners for collaboration | [App, Feature Checklist] |
| Mentoring Corner | Monthly Q&A with other leaders in recruiting (the PDF said weekly) | [App; PDF, Feature Checklist] |
| Gamification | Segmented leaderboards ("Hard-to-Fill Jobs Filled", "Top Conversion Rate", "Candidates Interviewed and Called"). Badges, e.g. "$1M biller". Celebration animations and sounds | [App §4.2] |

## 3. Data model

No source gives a schema. This is what the sources name. Anything marked "not stated" needs Kev or the Crelate API before you build on it.

### 3.1 Entities

| Entity | Fields or attributes named in the sources | Source |
|---|---|---|
| Company (lead or client) | Time zone, geographic market, book of business, sector, company type (stored as tags). Market cards also show sector chip and YoY growth rate. Master target database sorted "by timezone, market, and size" | [App §2.4; App mockup: Buckets; App mockup: Daily Guide, WIP] |
| Contact / Candidate | Book, sector, company type, title, verification, location, time zone, project specialty, salary range (tags). Resume. Pinned note. EEO fields exist in Crelate and must never be mirrored | [App §2.4; Tag SOP §1-8; Brief, Crelate API facts] |
| Job Order | Client, market, salary, priority, Ditch-or-Date Scorecard (intake). Status: Retained, Signed Fee Agreement, Hot, Warm, Lead. Ranking: dollar amount, percent to close, client ranking (A-level, new, proven). Claimed-by initials | [Notes §II.C; App mockup: Job Order Dashboard; App, Feature Checklist; Notes §II.D] |
| Pipeline stage | Candidate pipeline per job; stages mirrored nightly | [Brief #4; Brief, Phase 1] |
| Activity | RPs (e.g. "15 RPs/day"), MPs, calls, submittals, interviews, FTIs, placements | [Notes §II.B; Tag SOP §5; Brief #2; App mockup: Job Order Dashboard] |
| Revenue Report entry | Closed fee or deal, with QC gates (signed offer, background clearance) | [Notes §II.A] |
| Work Ticket | Form type, destination (Recruiting, BD, Operations), status (open or completed) | [App §2.3; Notes §II.C] |
| Daily Recap / Checkout | Auto-filled from checked to-dos, revenue and completed actions. Manual sections for uncovered leads, "Tickler File" items and companies to target | [Notes §II.C] |
| Scorecard | Personal daily and weekly KPIs. Company scoreboard | [Notes §II.B; App, Feature Checklist] |
| Tag | The carrier for every custom picklist value | [App §5.1] |
| User / Role | Researcher/BPO, Recruiter, Admin/Owner, Team Lead, Systems Administrator | [App §3.2; App §2.2; Notes §II.D] |
| Document | Tagged by client, project or document type | [App §2.2] |
| Course / Badge | Modules, badges, link to compensation | [Notes §II.D] |
| Announcement | Leadership-managed content | [Notes §II.A] |

### 3.2 Picklists the sources spell out

| Picklist | Values | Source |
|---|---|---|
| Time zone | Pacific, Mountain, Central, Eastern | [App §2.4; App mockup: Buckets] |
| Geographic market (examples) | Spokane, Boise, Phoenix, plus the 40 mockup markets | [App §2.4; App mockup: Buckets] |
| Book of business | Construction, Oil and Gas, Development (Tag SOP). The App doc also names healthcare and finance books. Kev on 14 Jul: "construction, finance or health" | [Tag SOP §1; App, Page Examples; Tag mtg @07:53] |
| Sector (App examples) | Insurance, Oil and Gas | [App §2.4] |
| Company type (App examples) | GC, Electrical, Mechanical | [App §2.4] |
| Title within sector | Field Operations, Project Management, Engineering, Sales | [App §2.4] |
| Job order status | Retained, Signed Fee Agreement, Hot, Warm, Lead | [App mockup: Job Order Dashboard] |
| Client ranking | A-level, new, proven | [App, Feature Checklist] |
| Ticket destination | Recruiting, Business Development, Operations | [Notes §II.C] |

The full, current tag vocabulary for sector, company type, title, location, contact, grade and salary is in `crelate-tagging.md`.

## 4. Workflows

| Workflow | Steps as the sources give them | Source |
|---|---|---|
| Job order intake | A senior staff member fills in a survey-style **Job Order Intake Form** (client, market, salary, priority, Ditch-or-Date Scorecard). Submitting it triggers an AI (Gemini "or other AI model") to generate the **MRR/JOL** document. Phase 2 | [Notes §II.C; §IV] |
| MRR/JOL | What the letters stand for and what the document contains: not stated | not stated |
| Candidate pool creation | A recruiter fills in the "Candidate Pool Creation form" to request a researched list. Researchers/BPO add data to the buckets | [App §2.3; App §3.2] |
| Buckets | Researchers tag records in Crelate. The app pulls records by tag and renders the drill-down tiles. A leaf links to a Crelate call list or a Call Logic campaign | [App §2.4; App, Page Examples] |
| Bulk company import into Crelate | Two steps: import company records first, then import contacts and link them to those companies. Spreadsheet: one header row in row 1, data from row 2, no empty rows, no colours or borders | [App §5.1 table] |
| Submittals | Named as a daily checklist item and as a step in the ratios. No separate flow is described | [Notes §II.B; Brief #2] |
| Ratios | "call to submittal to interview to placement" | [Brief #2] |
| Scorecards | Personal Scorecard (e.g. 15 RPs/day). Daily and weekly scorecard. Company scoreboard and leaderboard. Kev on 14 Jul: the tagging guide poster is "a scorecard thing" | [Notes §II.B; App, Feature Checklist; Tag mtg @09:18] |
| Deal close | Revenue Report entry, then the QC gates, then the company-wide celebration | [Notes §II.A] |
| End of day | Recap/Checkout auto-fills, the recruiter adds leads and tickler items, and the recaps roll up into the **Leadership Weekly Report**, sent on a cadence ("e.g., Thursday night") for coaching | [Notes §II.C] |
| Daily standup | Crelate WIP report plus an EOD GPT recap, which becomes each team member's to-do list | [App, Page Examples] |
| Work tickets | Recruiter fills in a form and picks a destination. The ticket shows in Open Tickets until done | [App §2.3; Notes §II.C] |
| Stalled jobs | Auto-close in the client portal | [App §5.2] |
| Job board claim | A Team Lead posts a job order that has a signed fee agreement. A recruiter claims it with their initials | [Notes §II.D] |

## 5. KPIs (App §4.1 table)

| KPI | Formula as written |
|---|---|
| Revenue | Total billed revenue for a period |
| Active Interviews | Number of candidates with a scheduled interview |
| Offer Acceptance Rate | (Offers Accepted ÷ Total Offers Made) × 100 |
| Percent to Close (Close Rate) | (Closed Deals ÷ Total Sales Leads) × 100 |
| Time to Hire | Days from candidate contact to offer acceptance |
| Quality of Hire | Combined score (performance, retention, fit) |
| Sourcing Channel Effectiveness | Hires from a channel ÷ candidates from that channel |

The Brief adds daily reporting, the scoreboard, and the ratios computed from the mirror [Brief #1, #2; Phase 1]. The dashboard mockup adds JOs posted (7 days), FTIs scheduled (30 days) and split deals closed (YTD) [App mockup: Job Order Dashboard].

## 6. Roles and permissions

| Role | Access | Source |
|---|---|---|
| Researchers / BPO team | Back-end access to add data to the lead buckets and manage Google Drive folders. **No** access to recruiter-specific information or admin controls. "The data engine" | [App §3.2] |
| Recruiters | Their own profile, the recruiter directory, and the lead and candidate buckets. Front-end only | [App §3.2] |
| Admin / Owners | Full back-end: user management, EdenU content, turning private-framework features on and off | [App §3.2] |
| Systems Administrator | Manages role-based access to the document repository, "this portion of the company's IP" | [App §2.2] |
| Team Leads | The only role that can post or edit on the curated Job Board | [Notes §II.D] |
| Senior staff | Fill in the Job Order Intake Form | [Notes §II.C] |
| Leadership | Manages announcements. Receives the Leadership Weekly Report | [Notes §II.A; §II.C] |
| Junior recruiters | Passive view of the Biz Dev Lead Buckets | [Notes §II.D] |
| Third-party partners | Job Order Dashboard: view and add jobs | [App, Page Examples] |
| Clients | Client portal for their own searches | [App §5.2] |
| 1099 scoping | "A partner may only need access to a limited set of client information" | [App §2.2] |

## 7. Integrations named

| System | Role in the plan | Source |
|---|---|---|
| Crelate | Core CRM and ATS. API v3 only: base `https://app.crelate.com/api3/`, header `X-Api-Key` from the `CRELATE_API_KEY` secret. Send a normal User-Agent, because Cloudflare blocks Python's default client (error 1010). v1 and v2 return 410. Responses come as `{Data, Metadata, Errors}`. No custom picklists through the API, so use tags | [Radar sources; Brief, Crelate API facts; App §5.1] |
| Loxo | Visual reference only: "Loxo's skin is far more pretty than Crelate" | [Brief #12] |
| ZoomInfo | Upload into the CRM (write path, Brief Phase 3). Shared ZoomInfo cost across partners | [Brief #10; App, Feature Checklist] |
| LinkedIn | Browser extension to add contacts to the CRM (Brief #9, Phase 3). Shared LinkedIn cost. LinkedIn Talent Insights as a data source for the Biz Dev buckets | [Brief #9; App, Feature Checklist; Notes §II.D] |
| Google Workspace | Calendar (block calendar), Chat (instead of building messaging), Drive (resume review, researcher-managed folders), Gmail ("Connect Gmail" panel in mockup) | [Notes §II.B; §V.4; App, Feature Checklist; App §3.2; App mockup: Daily Guide] |
| Gemini / GPT | Generates the MRR/JOL. RAG chatbot model. EOD recap GPT. Training GPT | [Notes §II.C; App §3.1; App, Page Examples; App §2.1] |
| NotebookLM | Training visuals and mind maps | [App §2.1] |
| Call Logic | Possible target of bucket links for calling campaigns | [App, Page Examples] |
| Loom | SOP training playlists | [App §2.1; Notes §II.D] |
| Zoom | Live-streamed training calls. Personal quick link | [App, Feature Checklist; Notes §II.B] |
| Calendly | Personal quick link | [Notes §II.B] |
| n8n | "RAG Agent Development: Continue building the n8n email workflow" (a line in the Daily Guide mockup) | [App mockup: Daily Guide] |
| Plaud + Gemini | "All PTCs seem to be caught up due to the new Plaud + Gemini prompt" (mockup) | [App mockup: Daily Guide] |
| Zendesk / Jira Service Management | Suggested in the research for tickets. Kev prefers simple forms | [App §2.3; PDF §2.3] |
| Connecteam / iSpring Learn | LMS options compared in the PDF only | [PDF §2.1] |
| Claude | Used in July 2026 to tag candidate profiles in Crelate. It cannot create tags, which forced the tag standard | [Tag mtg @02:01] |
| CloudTalk / Ringover | Not stated in any of these sources | not stated |
| Notion | Not stated in any of these sources | not stated |

## 8. Look and feel

| Rule | Source |
|---|---|
| "Johnny Ive meets James Bond". Cream or off-white background, simple lettering, Montserrat. Final spec: "James Bond/Montserrat/Creams/Black" | [App, Feature Checklist; Notes §V.2] |
| Collapsible "beautiful tiles" for navigation | [App, Feature Checklist] |
| Leaderboard as the "Augusta Masters scoreboard" or a "beautiful golf scoreboard" | [App, Feature Checklist; App §4.1] |
| Minimalist UI, mono- or bichromatic soft palette, high contrast only for calls to action and progress | [App §1.2] |
| Five-second rule. Most important KPI at top-left | [App §4.1] |
| Loxo-level polish for the CRM screens | [Brief #12; Brief, Phase 2] |
| Unified brand across the network (Filament Haus; "Evan as Brand Director") | [App, Feature Checklist] |

## 9. Priorities and phasing (three versions, newest first)

| Plan | Phases | Source |
|---|---|---|
| **Eden CRM brief, 11 Oct 2026 (current)** | 1. **Mirror**: nightly read-only copy of contacts, companies, job orders, pipeline stages and activities. First uses: call-back matching on missed calls, depth charts, lead-list dedupe, scoreboard and ratios. 2. **Screens on the mirror**: scoreboard and ratios, job pipeline and client job dashboards with RP activity, tag browser, Eden visual standard. 3. **Write paths** to Crelate via API: resume to profile, ZoomInfo upload, LinkedIn capture, client portal, resume search. 4. **Switch** after a full week on the new screens | [Brief, Phases] |
| APP Meeting Notes, Nov 2025 | 1. Foundation (MVP): Personal Desk, scoreboard and leaderboard, hot job orders, navigation, checklist-to-Crelate links, work-ticket MVP. 2. Workflow automation and QC: Recap/Checkout, Leadership Weekly Report, open tickets, JO intake, AI report trigger, Revenue Report. 3. Ecosystem: EdenU, Doc Hub, Biz Dev buckets, then the client portal. "Prioritizing the internal recruiter's daily experience first" | [Notes §IV] |
| Eden App doc (and PDF) | 1. Legal review of the contractor agreement ("most critical and non-negotiable"), Crelate integration, UI/UX. 2. Doc and messaging hub, work tickets. 3. Landing dashboard, gamification, partner incentive program. 4. EdenU, RAG chatbot | [App §VI; PDF §VI] |

Action items from Nov 2025, owners in brackets: wireframes [Design]; final design spec [Design]; **Crelate data mapping** of "the exact Crelate URLs and data fields needed for the Daily Checklist hyperlinking and Scoreboard metrics" [Dev/Product]; Google Workspace strategy [Dev/Product]; developer handoff package [Dev/Product] [Notes §V]. Whether any of these were done: not stated.

## 10. Business context the engineer will meet

| Item | Detail | Source |
|---|---|---|
| Partner splits | "70% first 100k, 75% first 200k, 80% 300k+", profit-sharing bonus at 400k+. Referral shares for bringing in partners: to be defined | [App, Feature Checklist; App §VI Phase 3] |
| Network entities | Eden Labs, Eden Capital, Estrem & Associates, Mancino & Mancino | [App, Feature Checklist] |
| Legal guardrails | NDAs and narrow non-solicitation, not non-competes. Semi-annual legal review. Leaderboards framed as self-comparison | [App §1.1] |
| Research capacity | The mockup notes a pivot of the BPO structure to "2 Researchers instead of a Jr. Recruiter", and a long-term "Master Market Database" of all target companies "sorted by timezone, market, and size" | [App mockup: Daily Guide] |
| Privacy rule for the mirror | Leave EEO fields out entirely. Salary and home details never reach the paper, the hit list or any shared sheet | [Brief, Crelate API facts; Radar sources] |

## 11. Open questions (not answered by the sources)

1. What do MRR and JOL stand for, and what template should the AI fill? What is the "Ditch-or-Date Scorecard", and what are its fields?
2. Expansions of RP, MP, FTI, PTC and MPC are not defined in these sources. Confirm them with Kev before naming columns.
3. Live API or mirror for the bucket pages? The App doc says live Crelate API [App §2.4]. The Brief says screens run on the nightly mirror [Brief, Phase 2]. Assume the mirror unless Kev says otherwise.
4. Does Crelate tag search support OR? In the 14 Jul meeting, Nick said it ANDs and Kevin thought OR works [Tag mtg @04:48-06:38]. Test it against the API.
5. Which Crelate pipeline stages map to submittal, interview and placement for the ratios? Not stated.
6. Daily checklist deep links: the exact Crelate URLs were an open action item [Notes §V.3].
7. Messaging: Google Chat, or in-app channels? Notes §V.4 leans to Google Chat. Not stated as decided.
8. Call platform: the App doc names Call Logic. CloudTalk and Ringover are not mentioned in these sources. Which dialer do bucket links and call-back matching target?
9. Are the RAG chatbot and EdenU still in scope, given the CRM-first brief?
10. Revenue Report QC gates: which fields prove "signed offer" and "background clearance"? Not stated.
11. Client portal auth and data exposure rules (which candidate fields a client may see): not stated.

## 12. Related documents not read for this seed

- "Biz Dev Bucket Plan for app", Google Doc `12U3uifprBUoxLEd2Dv_EVAhrrxDzWCggNbCHeapF6h0` (modified 23 Feb 2026). Likely the detailed bucket spec. Read it before building the bucket pages.
- Onboarding ramp doc linked from the App checklist (`1gAoFGcJkqcCUQ1JWXkRwJ1nAdg5l7ltr94GgQ451D2k`).
