# Phone pass (filling cell numbers from ZoomInfo on Noah's seat)

## What to work

The note Kev or Scout left you names your sheets. Otherwise: sheets in the master folder whose title does not end "Phones Added", whose Lead Log "Phones added" is blank and that nobody has claimed (tandem.md). Oldest Landed first. Skip any sheet whose Owner note says discreet client.

## Steps

1. Claim the sheet in the Lead Log Owner note.
2. Read the sheet with Google Sheets (get values). Note Name, Company, Tier, Source (ZoomInfo id) and the four phone columns by header.
3. Only rows with a blank Mobile. A filled Mobile (source "Crelate" or "ZoomInfo") is never touched.
4. Free check first: ZoomInfo search_contacts with the person ids (50 at a time), underManagement true, no redeem. Note hasMobilePhone / hasDirectPhone, Do Not Call flags, under management.
5. Enrich (enrich_contacts, 10 per call, by personId; fields: phone, mobilePhone, mobilePhoneDoNotCall, directPhoneDoNotCall, positionStartDate, jobTitle, companyName, withinCalifornia). Never request email. Order: records already under management (free) first; then people who have a mobile or direct, Tier 1 before Tier 2 before Tier 3. Never pay for someone with neither number. Never enrich the same person twice.
6. Write in place, numbers as text:
   - mobile found → Mobile = number, Mobile source = "ZoomInfo"
   - only a direct → Mobile = direct, Direct = direct, Mobile source = "ZoomInfo direct"
   - neither → Mobile blank, Mobile source = "none in ZoomInfo"
   - Direct = the direct line whenever there is one
   - Phone notes, short, semicolon-separated: "Mobile on Do Not Call list"; "CA" (California consent rules) or "EU"; "new in role" (started within ~6 months); "title/company differs"; "outside metro"; "verify" for glitches (e.g. a 1970 start date).
   Write only the cells you change; leave every other cell alone.
7. Verify: read back; same row count; every name on its row; counts match.
8. Finish: when every blank row is handled, rename the sheet "<title> · Phones Added", date "Phones added" on its Lead Log row, Owner note: "mobiles M / rows R, directs D, none X, DNC Y, credits P · Noah's agent". Counts only. Partial: "partial: N of M rows · Noah's agent", no rename.

## Credits

Noah's seat, Noah's budget: Kev sets the nightly or weekly cap for Noah's seat (ask him if you don't know it; until then stop at 100 paid credits a run). Free (under management) enrichments don't count. On a rate-limit or credit error, stop and note "resume" in the Lead Log; never retry in a loop.

## ZoomInfo seat safety

Use only the ZoomInfo connector signed in as Noah. One operator per seat at a time: don't run two of your own sessions on the same seat at once. No browser automation, no scraping, small batches. Respect Do Not Call: flag it, never dial or text a DNC number.
