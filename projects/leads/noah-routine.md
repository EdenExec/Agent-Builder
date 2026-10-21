# Noah's phones routine (paste into Claude as a daily scheduled task, weekdays)

Connectors to turn on in your Claude first: **Google Drive** and **Google Sheets** (so it can edit cells), plus **Crelate** if you have it. Without Google Sheets it cannot write; it will tell you and stop.

## Paste this

```
Every weekday morning, add cell phone numbers to Eden's new lead sheets.

1. Open the Google Sheet named "Lead Log" in the Drive folder "JO Meeting · Lead Buckets · Mon Oct 19" (https://drive.google.com/drive/folders/1U6zVA_rBsft6mwYLjQ5F1Pr_DRz1OUg9). Work only on rows where "Landed" has a date and "Phones added" is blank. If there are none, say "nothing new" and stop.

2. For each such row, open the sheet in its "Drive link" column. If the last two columns are not "Mobile" and "Mobile source", add those two headers at the end. Change nothing else: no other column, no row order, no deleted rows.

3. Fill Mobile only from these sources: Crelate (the candidate's existing record), my own calls today, or the candidate telling me. Never use a ZoomInfo phone. Never spend enrichment credits or use any paid lookup. If I do not have a number from one of those sources, leave Mobile blank.

4. For every number you write, write where it came from in "Mobile source": Crelate, call, or candidate. No source, no number. Skip any row Crelate marks do-not-contact. Skip rows in a "referral asks only" block. If the Owner note says discreet client, do not look anyone up; leave it for me.

5. When the pass on a sheet is done, put today's date (YYYY-MM-DD) in "Phones added" on that sheet's row in the Lead Log, and write in Owner note how many rows got a number out of the total (counts only, no names).

Rules that never change:
- Never move, rename, copy, delete or share a sheet, and never share one outside Eden. Do not touch the "Uploaded to Crelate" folder.
- Never put a phone number anywhere except the Mobile column of that sheet: not in the Lead Log, an email, a chat or a note.
- If a sheet looks wrong (missing columns, odd rows), write what you saw in the Lead Log Owner note and move on. Do not fix it by making a copy.
- At the end, tell me in three lines: sheets worked, numbers added, anything skipped and why.
```

## Why it is built this way

- The Lead Log is the only thing the routine reads first, so it never has to scan folders.
- The date in "Phones added" is the whole hand-off. The next person (loading into Crelate) and Radar read dates, not folders.
- A reload of the same role arrives as a new sheet with a new Landed date, so the routine picks it up by itself.
