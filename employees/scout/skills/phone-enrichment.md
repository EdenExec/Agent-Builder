# Nightly phone enrichment (Kev, 27 Oct 2026)

Kev moved Noah's lead-sheet phone enrichment to Scout, run at night on the **kev1** ZoomInfo seat (the ZoomInfo connector is signed in as Kev1). It is API only: no browser and no ZoomInfo web app. Kev's standing credit cap is **100 Data (Bulk) credits a night**. This cap is Kev's yes for this job only; every other enrichment still follows `zoominfo-search` and QC.

## When

Every weeknight at 10:00pm Pacific, after lists land by 8pm. Run `npm run sabbath -- --json` first: if it is the Sabbath, stop and do nothing. Never on Saturday.

## What you need

ZoomInfo, Google Drive and **Google Sheets** (to write cells in the existing sheet). If no Google Sheets tool is available, change nothing, write one line to Radar's feed ("phone enrichment blocked: Google Sheets connector missing") and stop. Never rebuild a sheet as a copy to get around it.

## Steps

1. **Queue.** Read the Lead Log (`1gqMc-aBqTGrNL7r3Li4qEXrrSplrWfeuw9YIXwoSNoY`) and list the master folder (`1U6zVA_rBsft6mwYLjQ5F1Pr_DRz1OUg9`; page through `next_page_token`). Work on sheets whose title does not end "Phones Added" and whose Lead Log "Phones added" cell is blank, oldest Landed first. Skip the Lead Log, docs, subfolders and anything in Superseded. Skip a sheet whose Owner note says discreet client and leave it for Kev.
2. **Read the sheet** with the Sheets connector (`get_values`, not Drive's sample). Note the row count and the person-ID column (Source, "ZoomInfo 1234567"; negative IDs are valid), Name and Company. If any Mobile is already filled, never touch that row.
3. **Free pass first (no credits).** `search_contacts` with `personIdList` (50 at a time), `underManagement: true`, no `redeem`. For each person record: `hasMobilePhone`, `hasDirectPhone`, `mobilePhoneDoNotCall`, `directPhoneDoNotCall`, `lastUpdatedDate`, under management or not, and whether the title or company differs from the sheet. Rows with no ID: search by full name and company; if the match is not certain, note "verify" and do not enrich.
4. **Pull numbers.** `enrich_contacts` by `personId`, 10 per call, `requiredFields: ["phone","mobilePhone","mobilePhoneDoNotCall","directPhoneDoNotCall","positionStartDate","jobTitle","companyName"]`. Never request email. Order:
   - under management first (free);
   - then unmanaged rows that have a mobile or direct, Tier 1 before 2 before 3, until the night's paid count reaches 100;
   - never pay for a person with neither a mobile nor a direct (write "none in ZoomInfo"), and never enrich the same person twice.
   Keep a running count of paid enrichments; stop paying at 100 and carry the rest to the next night.
5. **Write the sheet in place** (one batch per sheet; read `references/sheets.md` in the google-workspace skill first). Keep every existing column and row order. The last columns are **Mobile, Mobile source**, then add **Direct** and **Phone notes** after them if missing. Mobile source is "ZoomInfo" or "ZoomInfo direct" (when only a direct exists, it goes in Mobile too, as Noah's routine did). Write numbers as text so Sheets does not turn them into numbers. Phone notes, short and semicolon-separated:
   - "Mobile on Do Not Call list" (and set that cell's text bold red);
   - lead outside the sheet's target metro; direct-line area code that does not match the lead's city;
   - new in role (started within about 6 months), or title or company differs from the sheet;
   - data glitch (for example a 1970 start date): "verify";
   - "none in ZoomInfo" when neither number exists.
6. **Finish a sheet** only when every row is done: rename it with Drive `update_file` to "<title> · Phones Added" (same link), date "Phones added" on its Lead Log row (YYYY-MM-DD) and write in Owner note: mobiles, directs, none, DNC count, credits paid. Counts only. A sheet cut off by the cap stays unrenamed with Owner note "partial: N of M rows, resumes tomorrow".
7. **Verify.** Read the sheet back: same row count, every name still on its row, counts match your tally. Spot-check 4 rows against the enrich output.
8. **Report.** Append one line per night to `employees/scout/memory/live/credits.md` (date, sheets, rows, paid credits, free). Post one done ticket on your Command Center feed: sheets finished, mobiles / directs / none, DNC count, credits paid, anything skipped. Counts only.

## If something stops you

- ZoomInfo rate limit or a credit error: stop paying, keep what is written, note "resume" in the Lead Log, and try again once 2 hours later in the same run if time allows; otherwise the next night picks it up.
- A sheet with missing columns or odd rows: note it in the Lead Log Owner note and move on. Do not make a copy.

## Never

- Never put a phone number, or a name next to a number, in the repo, memory, a ticket, an email, a chat or the Lead Log. Numbers live only in the sheet and in Crelate. Working files stay in the session scratchpad and are not committed.
- Never request or write personal email, even if ZoomInfo offers it.
- Never move, copy, delete or share a sheet; the BPO team uploads from the master folder and Radar moves finished sheets.
- Never go past 100 paid credits in a night. More needs a `spend` QC item from Kev.
