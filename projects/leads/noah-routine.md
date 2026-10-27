# Noah's nightly enrichment routine (paste into Claude as a scheduled task)

Kev, 21 Oct 2026: "we get the leads list to the drive, noah enriches them, then the BPO team uploads them to crelate. We should be doing this every night or as often as possible." Noah fills cell phones with **ZoomInfo enrichment** on his own ZoomInfo seat.

Connectors to turn on in your Claude first: **ZoomInfo**, **Google Drive** and **Google Sheets** (Sheets lets it edit cells; without it the routine says so and stops). Schedule: **every weeknight at 10:00pm Pacific**, after Scout's lists land. Never Saturday.

## Paste this

```
Every weeknight, enrich Eden's new lead sheets with cell phone numbers from ZoomInfo.

1. Open the Google Sheet "Lead Log" in the Drive folder https://drive.google.com/drive/folders/1U6zVA_rBsft6mwYLjQ5F1Pr_DRz1OUg9. Work only on rows where "Landed" has a date and "Phones added" is blank. If there are none, say "nothing new" and stop.

2. For each such row, open the sheet in its "Drive link" column. If the last two columns are not "Mobile" and "Mobile source", add those two headers at the end. Change nothing else: no other column, no row order, no deleted rows.

3. For each row with a blank Mobile, enrich the person in ZoomInfo by name and company (use the LinkedIn URL to confirm it is the right person). Write their mobile number in Mobile and "ZoomInfo" in Mobile source. If ZoomInfo has no mobile, write their direct dial instead with "ZoomInfo direct" as the source. If it has neither, leave Mobile blank and write "none in ZoomInfo" in Mobile source.

4. To save credits: never enrich a row that already has a Mobile, never enrich the same person twice, and skip rows in a "referral asks only" block. If the Lead Log Owner note says discreet client, skip that sheet and leave it for me.

5. When a sheet is done, put today's date (YYYY-MM-DD) in "Phones added" on its Lead Log row, and write in Owner note: numbers found out of total rows, and credits used (counts only, no names or numbers).

Rules that never change:
- ZoomInfo numbers are for Eden's own recruiting only: the sheet and Crelate. Never put a number in an email, a chat, the Lead Log or anywhere outside Eden.
- Never move, rename, copy, delete or share a sheet. The BPO team uploads to Crelate from the master folder; Radar moves finished sheets.
- If a sheet looks wrong (missing columns, odd rows), write what you saw in the Lead Log Owner note and move on. Do not fix it by making a copy.
- At the end, tell me in three lines: sheets worked, numbers found out of rows, credits used, anything skipped and why.
```

## Why it is built this way

- The Lead Log is the only thing the routine reads first, so it never has to scan folders.
- The date in "Phones added" is the hand-off: the BPO team uploads every sheet with Phones added dated and In Crelate blank, then dates In Crelate. Radar moves it to Uploaded to Crelate.
- A reload of the same role arrives as a new sheet with a new Landed date, so the routine picks it up by itself and never re-buys a number.
