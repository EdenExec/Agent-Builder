# Submittal packet workflow

Kev, 24 Oct 2026: every candidate going to a client gets a new submittal packet, rolled out to the whole team. Tickets `t-202610241413-sbmp`. Built with Radar's gating rules: nothing is sent to a client without Kev's yes.

**Result:** one packet per candidate per JO, in four parts, saved in Drive (never the repo or the Hub), reviewed by Kev before it goes out.

## The packet, in order

| # | Part | Template | Source |
|---|---|---|---|
| 1 | Eden cover page | `cover-page-template.md` | Hannah's Hoffman framework, plus Kev's added fields |
| 2 | Pre-screen scorecard | `scorecard-template.md` | The client's 7 to 10 Must Dos |
| 3 | Original resume | none | The candidate's own file, own format, untouched |
| 4 | References and screening notes | section below | Reference list, call notes, transcripts |

Why: clients ask for better candidate quality and match, and more references.

## Build it in one command (Casey, 25 Oct 2026)

`npm run submittal -- <packet.json>` builds the whole packet as one PDF in Eden's look: cover page (overview in Hannah's order, then the Must Do scorecard), the original resume untouched (a Word file is converted to PDF page for page), then references and screening notes. Copy `packet-template.json`, fill it and keep the filled copy with the packet in Drive, never in the repo.

- The Google Boolean link is built for you: name variations (formal name, nicknames, middle initial, former surname, reversed) in the current state plus every past state.
- It refuses to build a send copy until the checklist below passes; `--draft` makes a working copy marked DRAFT.
- Output lands in `deliverables/submittals/` (not committed). Kev reviews; the recruiter files it in Drive.

## Steps (per JO and per candidate)

| Step | Who | What |
|---|---|---|
| 0. Must Dos exist for the JO | Lead recruiter | Every JO from now on has a Must Do list (`must-dos-intake-template.md`). Taken from the client on the intake call; if the client has none, we draft them and send to the client for approval. No scorecard until the Must Dos are approved |
| 1. Screen | Recruiter | Screening call. Notes and transcript saved. Candidate confirms pay, availability and consent to references |
| 2. Build | Recruiter | Fill cover page, score each Must Do, attach resume, add references and notes. Folder: Drive, `Submittals / <Client> / <JO> / <Candidate>`. Baker shows as "Client · discreet" in any shared name |
| 3. Check | Recruiter | Run the checklist below |
| 4. Review | Kev | Kev reads the packet and says yes. Jenny owns the voice of any cover email |
| 5. Send | Kev | Kev sends. No agent sends a packet |
| 6. Log | Recruiter | Submittal activity in Crelate (this is also where submittal counts for the Mon/Wed/Fri JO report come from); depth chart status to Submitted with a dated note |

## Rules that do not bend

- **Pay goes on the cover page, always marked current or desired.** This replaces the 8 Oct "no comp history on a submittal" line for the packet's pay field only (Kev, 24 Oct 2026).
- **Where packets live:** Drive, one folder per client. Never the repo, never the Team Hub, never a ticket. Pay, references and transcripts are on them. The Hub keeps names, role and status only.
- **References:** each carries "Please do not contact without the candidate's clear consent." No reference without the candidate's yes.
- **Background first pass:** the Google search link is a first-pass check, not a conclusion. It never goes beyond public search; no enrichment tool, no ZoomInfo.
- Moss candidates and discreet clients follow their usual rules.

## Part 4: references and screening notes

| Item | Rule |
|---|---|
| References | Name, relationship, company, role. Contact details go in only with the candidate's consent. Header line on the page: "Please do not contact without the candidate's clear consent." |
| Screening call notes | Only what is relevant to the client's Must Dos; the full transcript attached behind it |
| Transcripts | Attach from the call tool; strip anything off topic or personal before sending |

## Checklist before it goes to Kev

| Check |
|---|
| Must Dos are the approved list for this JO |
| Every Must Do has a score and one line of evidence |
| Pay marked current or desired |
| Boolean link opens and has name variations and locations |
| Resume is the original, unedited |
| Consent for references recorded |
| Concerns field filled honestly (write "none known" only if true) |
| Client name matches the JO; no other client's name in the packet |

## Open for Kev

| # | Ask |
|---|---|
| 1 | Hannah's actual Hoffman page: the field order here comes from your description. Drop the file in Drive and I will match the layout |
| 2 | Scorecard scale: 3-point (Meets, Partial, Gap) is the default here. Keep or change |
| 3 | The packet PDF is built in Eden's look (Montserrat, EDEN PARTNER GROUP header and footer) rather than filled into the Word letterhead, because it has to merge with the original resume. Keep, or build the cover page on the letterhead .docx instead |
