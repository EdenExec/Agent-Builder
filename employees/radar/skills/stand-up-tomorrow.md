# Stand Up Tomorrow (builds The Eden Daily)

Fired by the check-out Monday to Thursday, with an 8:47pm Sunday to Thursday fallback. Builds tomorrow's day before today ends: flags, leads, calendar, and the finished paper. "Tomorrow" is the next weekday; Sunday and a Friday fire-through build Monday. Fresh session: research live, never fabricate.

## Step 0, skip check
Drive folder "The Eden Daily" (id `1DvqQIdEi0gt9AEImtR20_T3HdQAa8AaN`): if "Eden Daily delivered - <tomorrow>" exists, stop. Tomorrow is stood up.

## Step 1, read the ledger (source of truth)
`notion-query-data-sources` on `collection://be709daf-ca63-4687-9295-e329e54f87bf`: (a) every row with Status Not started or In progress, oldest first, with its Lane, Owner, Bill rate and Due; (b) today's "EOD Check-Out · <date>" row; (c) every open "Claude QC" row. Apply every QC row in steps 4 and 5. No check-out today: proceed with open rows and the calendar and print "No EOD check-out logged" at the top of Must-Hits.

## Step 2, read the archive
Drive folder "Eden Daily Archive" (id `19EYZokFjw0KgT-_ollIgYRP11UnTBavN`): the newest file. Kev's handwritten annotations are feedback and to-dos. Each becomes a ledger row (Source "paper <date> margin") or a QC row. Say in the summary how many you read.

## Step 3, flag what is still open
Superhuman: threads from the last 3 days where someone asked Kev something and he has not replied (skip newsletters, blasts, answered threads; the sweeps' `Radar/Swept` label and drafts tell you what is already handled). Google Calendar (`kev@edenexec.com`): invites in the next 3 days not accepted; tomorrow's interviews and client calls without confirmation. Family calendar (`0nae4cnun4tvm43clph902slbt2tphvl@import.calendar.google.com`): anything tomorrow Kev should know. Log each new flag as a ledger row with Lane and Owner. No duplicates.

## Step 4, lead gen for tomorrow's Power Hours
Searches come from, in priority: the check-out, existing "POWER HOUR" events on tomorrow's calendar, open job orders in recent email. Per search, up to 25 names: warm callbacks and HOT candidates from recent email and the latest Cody Ballah "Daily Brief" (from Cballah@nexorragroup.com) first, then ZoomInfo `search_contacts` by title, source companies and region (legitimate B2B recruiting outreach only). Per lead: name, title, company, source (CR/ZI), phone flag (M/D/—), one-line note. Save a Google Sheet "Leads - <tomorrow>" in the Eden Daily folder with columns Candidate, Title, Company, Location, Book, Sector, Title Category, Search, Source, for Nida's overnight load.

## Step 5, stack tomorrow's calendar
Google Calendar `kev@edenexec.com`, Pacific. Never move, edit or delete existing events; fill only open time. Green (colorId 2): Power Hours "POWER HOUR · <Client> — <Search>" and 20-minute callbacks owed. Purple (colorId 3): oldest Lane Mine rows with Bill rate Business, C12 or Admin; Admin rows go in one block, never scattered. Orange (colorId 6): Claude build work Kev flagged. Last block "Claude EOD check-out" at 5:30pm if missing. Default 20 minutes, 10-minute popup, no attendees, no Meet links. Leave time empty rather than padding it. Family calendar events are respected as hard edges.

## Step 6, build the paper
Follow `standing-rules.md` for orientation, typography and the habit tracker. Pages:
1. **Front.** Masthead THE EDEN DAILY, dateline, one-line count. HABIT TRACKER strip with streaks from the check-out rows (blanks where not logged). "Act with Agency: 20 Meaningful Connections." with 20 circles. RUN OF DAY (tomorrow's full calendar, Power Hours in gold). MUST-HITS (3 to 5). PUSH FORWARD: Lane Mine and Waiting on rows, one line each, who / what / next step, ordered by bill rate then due. POWER HOUR LINEUP with page refs. MARGIN NOTES lines. Scripture block: next chapter in Kev's ESV book-order reading, one verse, two lines tied to the work, "STUDY GUIDE → <chapter>" internal link.
2. One call-sheet page per Power Hour (brief, opener, table with Dial / VM / Conn / Meaningful boxes and Notes).
3. Study guide for the chapter (bible-study-guide skill if available): big idea, hook, setting, read it slowly, flow, labelled nuggets, where it leads, respond, practice, prayer, memory verse. Written for a pen in hand.
4. Back page "Tonight's EOD Check-Out": Must-Do boxes, RPs /15, connections /20, habit numbers, scripture done, prompts (How did today go · What moves forward · Leads for tomorrow · Who needs what · Family and home · C12 to-dos · Any way Radar can improve tomorrow's paper).
Training insert: if Kev emailed himself a training plan for tomorrow (from kev@edenexec.com, subject contains "Training" and the date), add 1 to 2 pages after the study guide.

Render HTML to PDF with Playwright Chromium (executablePath `/opt/pw-browsers/chromium`, no install). Letter landscape, printBackground, zero margins. QC: pdffonts shows no Type 3; pdftotext -layout shows no split words; render page 1 and a study page at 110 dpi and look at them; every open QC row is visibly applied.

## Step 7, deliver
Save as `/mnt/user-data/outputs/Eden Daily - <Day> <Mon> <D>.pdf` and deliver with `SendUserFile` (status proactive, display attach, caption = tomorrow's biggest must-hit). Create the Google Doc "Eden Daily delivered - <Day> <Mon> <D>" in the Eden Daily folder with the plain-text front page so the 5:30 brief can read it. Mark applied one-off QC rows Done. Finish with a six-line summary: check-out found or not, QC applied, archive annotations read, flags logged, leads per search, events added, PDF name.
