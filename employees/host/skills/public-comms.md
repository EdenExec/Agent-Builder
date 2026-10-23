# Public comms (LinkedIn and Eden posts for Kev and Radar)

Jenny writes Eden's public voice: LinkedIn posts for Kev, posts on the Eden Partner Group page, event announcements and anything Radar would otherwise have to write for the public. Publishing is always a QC item. "Post this now" is a request to queue it now, never approval to post.

## Where and how often (Kev, 22 Oct 2026)

- **Kev's personal LinkedIn only.** No drafts for the Eden company page until he says otherwise.
- **One or two posts a week**, as drafts for his yes.
- **No exclamation marks**, ever, under his name or Eden's.

## What a post is for

Every post does one of three jobs, and says which in the QC detail:

| Job | Example | Ends with |
|---|---|---|
| Fill a seat | A live search, the job fair | One clear ask: apply, RSVP, refer someone |
| Show the craft | A lesson from a search, a client win Kev may name, a team milestone | A line people want to answer |
| Show the culture | The Seven Pillars at work, a recruiter's milestone, an event thank-you | Thanks to named people who agreed to be named |

## Rules

1. **Kev's voice under his name**, Eden's voice on the page (`skills/comms-voice.md`). Under 150 words for most posts. First line carries the point; LinkedIn cuts after two lines.
2. **Nothing private.** No candidate named without their written yes, no client named without Kev's yes for that post, no comp, fee or rate figures, no phone numbers, no photos of people who did not consent.
3. **No cross-client tells.** A post never reveals who Eden is searching for if the search is confidential, and never pairs two clients.
4. **Hashtags:** three at most, at the end, plain words (#construction #hiring). None in an email. No emoji.
5. **Faith and values:** the Seven Pillars may be named; Scripture in a business post only where Kev has used it himself.
6. **Claims are true.** Numbers in a post (seats filled, years, headcount) come from a source Jenny names in the QC detail; anything financial goes through the numbers gate with Tally first.

## QC: every publish is an item

```
npm run qc -- submit host publish "<platform and account>: <first line of the post>" "<the exact post text, the image or link if any, the account it posts from (Kev's LinkedIn or the Eden Partner Group page), the proposed time, the job it does, and the source for every number or name>"
```

- If the ask was "now", the QC item says so in the summary ("requested today") and Jenny tells Radar to carry it to Kev at once. She still does not post.
- Approval is for that exact text, at that time, from that account. A change is a new item.
- After Kev posts it, Jenny records the link in `comms/posts.md` (date, account, link, job, QC id) and drafts replies to comments as new drafts, never live replies.

## Calendar

A light plan, one table in `comms/plan.md`: the next four weeks of posts, one or two a week, each with the job, the draft status and the QC id. Event pushes come from the event plan's Galvanizing step and live here too.
