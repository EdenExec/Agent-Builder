# Budget and raffle (sizing prizes and tickets, and the QC rules)

## The budget in one line

A budget is one table row: food and drink, prizes, venue, print and promotion, contingency, total. The total is a proposal and is labelled "Kev's decision" until he approves it. Every line shows the rule it comes from.

| Line | Sizing rule (starting values, all assumptions until Eden has history) |
|---|---|
| Food and drink | Target guests times a per-head amount; $30 per head including two drink tickets is the starting point. Get two quotes. |
| Prizes | About 20% of the total. Never more than 25%. |
| Venue | Zero if the client or Eden hosts; otherwise the quoted room fee. Ask for the food and beverage minimum in writing. |
| Print and promotion | Name tags, signage, ticket stubs, a QR code, any paid push: about 8% of the total. |
| Contingency | 10% of the other lines. Spent only with a new QC item. |

Also compute and show: cost per attendee and cost per hire at target. If cost per hire is above a quarter of what a hire is worth to the client, say so on the page.

## Sizing prizes

- One grand prize worth about 40% of the prize pool (for a pool of $800, about $300: a premium cooler or similar). Then a few mid prizes (about $100) and several small ones (about $50). More winners at small values keeps the room watching; one big prize is the draw.
- Prizes must be things the audience wants and can carry home (a Yeti cooler, gift cards for fuel, hardware or restaurants). No alcohol as a prize. Nothing that needs a licence or a fitting.
- Prizes draw people; they never decide who gets hired. Say that to the room.

## Sizing tickets

- 1 ticket for checking in. 2 more for each guest who checks in naming the referrer, capped at 10 guests (the cap stops gaming). Staff and network members earn tickets the same way as anyone.
- Each guest counts once, and only if new to the referrer's list and actually present. The referrer is written at check-in, not claimed afterwards.
- Expected ticket count = guests plus twice the referred guests; print 150% of that so the stubs never run out.
- The draw: tickets counted at the set time, drawn from one bowl, winner must be present or the next ticket is drawn. Give the grand prize last. Record each winner's name and prize in the event file.

## QC rules

1. Nothing is bought, reserved or paid by Host. Each vendor or venue quote is one QC spend item: `npm run qc -- submit host spend "<vendor: what it buys>" "<detail: quote date, expiry, what is included, alternatives, which budget line>" --amount N`.
2. Gift cards are spend, not goodwill: one QC item per purchase batch, with the total.
3. Never exceed an approved line. A change is a new QC item with the reason.
4. A deposit, a minimum or a cancellation fee is named in the detail; Kev must see it before approving.
5. A quote not opened this session is marked UNVERIFIED and carries its source.

## Legal edges to flag, not to decide

- A raffle should be free to enter with no purchase required, so it stays a promotional drawing. State rules vary and some treat a prize drawing as regulated gambling; ask the client's counsel to confirm for the state (Florida for the first event). Do not state the law as fact.
- Drink tickets are redeemed through a licensed bartender at the venue. Host never buys or hands out alcohol.
- Signing bonuses and referral bonuses are the client's compensation decision. Host recommends structure and risks; the client's HR or counsel sets wording and amount.
