# Stand Up Tomorrow (builds The Eden Daily)

Fired by the check-out Monday to Thursday, with an 8:47pm Sunday to Thursday fallback. Builds tomorrow's day before today ends: flags, leads, calendar, and the finished paper. "Tomorrow" is the next weekday; Sunday and a Friday fire-through build Monday. Fresh session: research live, never fabricate.

## Saturday
On a Saturday firing this routine does not build a weekday paper. It builds the Sunday Edition exactly as `sunday-edition.md` says, then stops. Steps 0 to 7 below are for Sunday to Thursday firings.

## Step 0, skip check
Drive folder "The Eden Daily" (id `1DvqQIdEi0gt9AEImtR20_T3HdQAa8AaN`): if "Eden Daily delivered - <tomorrow>" exists, stop. Tomorrow is stood up.

**Exception, a re-run with Kev's words.** If this run was fired with a text that quotes Kev's own instruction with a time (for example his bedtime notes relayed by Radar or by the check-out), that text is Kev's go. Do not stop: rebuild tomorrow with those inputs, update the delivered Doc in place (or rename the first one "(first build, superseded)" and create the new one), add the calendar holds, append the leads to the existing sheet, and file the journal rows. Never delete the first build's files, and never wait on a second confirmation: Kev is usually asleep, and the 5:22 brief reads whatever Doc carries the plain title.

## Step 1, read the ledger (source of truth)
`notion-query-data-sources` on `collection://be709daf-ca63-4687-9295-e329e54f87bf`: (a) every row with Status Not started or In progress, oldest first, with its Lane, Owner, Bill rate and Due; (b) today's "EOD Check-Out · <date>" row; (c) every open "Claude QC" row. Apply every QC row in steps 4 and 5. No check-out today: proceed with open rows and the calendar and print "No EOD check-out logged" at the top of Must-Hits.

## Step 2, read the archive
Drive folder "Eden Daily Archive" (id `19EYZokFjw0KgT-_ollIgYRP11UnTBavN`): the newest file. Kev's handwritten annotations are feedback and to-dos. Each becomes a ledger row (Source "paper <date> margin") or a QC row, and every note Kev wrote also becomes one row in the **Eden Journal** database (data source `collection://61f6bc1d-5d84-43c3-b946-5bf602a35897`, inside Daily Catch-Up Log): Note in Kev's words, Date, Type (Win, Stuck, Idea, Decision, Follow-up, Number, Prayer, Scripture, Family, Quote, QC, Meeting notes), Clients, Searches, People, Topics, Source, Sure unchecked when the handwriting was unclear. The journal is Kev's searchable memory; never skip it. Say in the summary how many annotations you read and how many journal rows you wrote.

## Step 3, flag what is still open
Superhuman: threads from the last 3 days where someone asked Kev something and he has not replied (skip newsletters, blasts, answered threads; the sweeps' `Radar/Swept` label and drafts tell you what is already handled). Google Calendar (`kev@edenexec.com`): invites in the next 3 days not accepted; tomorrow's interviews and client calls without confirmation. Family calendar (`0nae4cnun4tvm43clph902slbt2tphvl@import.calendar.google.com`): anything tomorrow Kev should know. Log each new flag as a ledger row with Lane and Owner. No duplicates.

## Step 4, lead gen for tomorrow's Power Hours
Searches come from, in priority: the check-out, existing "POWER HOUR" events on tomorrow's calendar, open job orders in recent email. Per search, up to 25 names: warm callbacks and HOT candidates from recent email and the latest Cody Ballah "Daily Brief" (from Cballah@nexorragroup.com) first, then ZoomInfo `search_contacts` by title, source companies and region (legitimate B2B recruiting outreach only). Per lead: name, title, company, source (CR/ZI), phone flag (M/D/—), one-line note. Save a Google Sheet "Leads - <tomorrow>" in the Eden Daily folder with columns Candidate, Title, Company, Location, Book, Sector, Title Category, Search, Source, for Nida's overnight load.

## Step 5, stack tomorrow's calendar
Google Calendar `kev@edenexec.com`, Pacific. Never move, edit or delete existing events; fill only open time. Green (colorId 2): Power Hours "POWER HOUR · <Client> — <Search>" and 20-minute callbacks owed. Purple (colorId 3): oldest Lane Mine rows with Bill rate Business, C12 or Admin; Admin rows go in one block, never scattered. Orange (colorId 6): Claude build work Kev flagged. Last block "Claude EOD check-out" at 5:30pm if missing. Default 20 minutes, 10-minute popup, no attendees, no Meet links. Leave time empty rather than padding it. Family calendar events are respected as hard edges.

## Step 6, build the paper
Follow `standing-rules.md` for orientation, typography and the habit tracker. Read `deal-desk.md`: the front page carries "Deal desk · top 10" above the Run of Day, ordered by fee at stake, as soon as the ledger and Rev Report can feed it (start with offers out, second interviews to set, FTIs, thin depth charts).

**Core values, hidden in plain sight (Kev, 5 and 6 October 2026).** Source: the Seven Pillars in the "Eden-Core-Values" Google Doc, tabled in `employees/_shared/eden-brand.md`. Like the points of the Knights of St John cross, every mark on the page means something. Super clean and classic, never loud:
- Pillar of the day: Mon 01 Righteousness, Tue 02 Winning, Wed 03 Accountability, Thu 04 Discipline, Fri 05 Transparency, Sat 06 Growth, Sun 07 Execution. The Sunday Edition carries all seven.
- A hairline frame on every page, 0.5pt black at 70%, inset 4mm so it sits outside the footer. The top line breaks for a frieze in Plex Mono 5.5px caps tracked 0.12em: RIGHTEOUSNESS · WINNING · ACCOUNTABILITY · DISCIPLINE · TRANSPARENCY · GROWTH · EXECUTION, the day's pillar in weight 600. The left line breaks for the day's verse reference and a four-word gloss, rotated to read upward; the right line for LEADERS ARE READERS · LEARNERS ARE EARNERS. The footer keeps EDENPARTNERGROUP.COM and EDEN PARTNER GROUP.
- A seven-column colonnade, 16mm by 10mm, line art, black, right of the masthead: entablature, seven shafts with capitals and bases, numerals I to VII beneath. The day's shaft is drawn solid, the others outlined.
- Watermark: the colonnade at 3.5% black, 60mm, centred behind the Run of Day on the front page only. It must not show on a phone screenshot or a photocopy; if in doubt, lighter.
- Front page: a "Pillar of the day" box under the Round Table box: the pillar and its tenets, its verse (ESV, a small eight-pointed cross before it), and one line on what the pillar looks like in tomorrow's schedule.
- Page 2: "Recruiter must-dos · the six, on <day>", each tied to a real item on tomorrow's calendar (01 plan the week, 02 don't chase the day with 15 RPs by noon, 03 audit your inventory at the check-out, 04 build your own book, 05 autopsy your work on Friday, 06 activity / inventory / skill), then one line of "At Eden we" and the motto.
- Check-out page: six "At Eden we" tick boxes, "The reason I am working this hard is" with two lines, and "Did I finish the race today?" for the pillar.
- Decisions page: open items from the core values doc (the Execution verse, the Mission Made Simple worksheet) stay as tick rows until Kev answers them.
- Nothing else in the margins, no colour. First run: Tuesday 6 October 2026, stamped onto the finished PDF with pdf-lib (scratchpad `tue/overlay.mjs`); a full build draws the same marks in the HTML.

Pages:
1. **Front.** Masthead THE EDEN DAILY, dateline, one-line count. HABIT TRACKER strip with streaks from the check-out rows (blanks where not logged). "Act with Agency: 20 Meaningful Connections." with 20 circles. RUN OF DAY (tomorrow's full calendar, Power Hours in gold). MUST-HITS (3 to 5). PUSH FORWARD: Lane Mine and Waiting on rows, one line each, who / what / next step, ordered by bill rate then due. POWER HOUR LINEUP with page refs. MARGIN NOTES lines. Scripture block: next chapter in Kev's ESV book-order reading, one verse, two lines tied to the work, "STUDY GUIDE → <chapter>" internal link.
2. One call-sheet page per Power Hour (brief, opener, table with Dial / VM / Conn / Meaningful boxes and Notes).
3. Study guide for the chapter (bible-study-guide skill if available): big idea, hook, setting, read it slowly, flow, labelled nuggets, where it leads, respond, practice, prayer, memory verse. Written for a pen in hand.
4. **Decisions page** (Kev, 5 October 2026). One line per Batch-lane ledger row with Status not Done: the question, Radar's recommended answer, what silence does, and three tick boxes (Yes / No / Talk). Kev marks it in Preview and sends the photo back; the next sweep or check-out reads the marks as his answers and updates the rows.
5. Back page "Tonight's EOD Check-Out": Must-Do boxes, RPs /15, connections /20, habit numbers, scripture done, prompts (How did today go · What moves forward · Leads for tomorrow · Who needs what · Family and home · C12 to-dos · Any way Radar can improve tomorrow's paper).
Training insert: if Kev emailed himself a training plan for tomorrow (from kev@edenexec.com, subject contains "Training" and the date), add 1 to 2 pages after the study guide.

Render HTML to PDF with Playwright Chromium (executablePath `/opt/pw-browsers/chromium`, no install). Letter landscape, printBackground, zero margins. QC: pdffonts shows no Type 3; pdftotext -layout shows no split words; render page 1 and a study page at 110 dpi and look at them; every open QC row is visibly applied.

## Step 7, deliver
Save as `/mnt/user-data/outputs/Eden Daily - <Day> <Mon> <D>.pdf` and deliver with `SendUserFile` (status proactive, display attach, caption = tomorrow's biggest must-hit). ONE FILE, THE PDF ITSELF: never a zip, never a folder, never the build directory (Kev, 5 October 2026: "I want one clean PDF that I view in Preview each day"). Then publish the same PDF as an Artifact so a link exists outside this session: a one-line white Montserrat page titled "Eden Daily - <Day> <Mon> <D>" with the PDF attached through the Artifact tool's `files` parameter and one "Open the PDF" link to it. Put the claude.ai link in the delivered Doc's first line and in the closing summary. Create the Google Doc "Eden Daily delivered - <Day> <Mon> <D>" in the Eden Daily folder with the plain-text front page so the 5:30 brief can read it. Mark applied one-off QC rows Done. Finish with a six-line summary: check-out found or not, QC applied, archive annotations read, flags logged, leads per search, events added, PDF name.
