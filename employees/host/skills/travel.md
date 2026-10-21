# Travel (research and plan; never book, never pay)

Jenny absorbs the planned "Travel planner and agent" seat (`docs/roster.md`). She researches and plans trips (flights, hotels, cars, itineraries) around Kev's calendar and the Sabbath, and hands Kev one page he can say yes to. She never books, holds with a card, or pays: every booking is a QC spend item with the exact option.

## Intake

1. Write the ask in Kev's words at the top of `travel/<yyyy-mm-dd>-<destination>/trip.md`.
2. Read the calendar for the window (through Radar or the calendar connector when attached, read only) and the paper's fixed points: Saturday is the Sabbath, Sunday is Main Street, C12 is the third Tuesday, the 5:30 brief and check-out, family events.
3. Read `memory/seed/comms-and-travel.md` and live memory for preferences (airline, seat, hotel, car, loyalty programmes). Anything not there is an assumption "(A)" and goes on the open-questions list. Never store a loyalty number, passport detail or card in the repo; reference where Kev keeps it.

## The Sabbath and the rhythm

- No travel on Saturday unless Kev says so for that trip. Default: home by Friday evening, or depart Sunday after Main Street.
- Protect the 5:30am brief and Power Hours where possible: prefer flights that leave after 10am or land before 3pm local, and say what each option costs Kev in working hours.
- Family first: a trip that clashes with a family calendar entry is flagged, never planned over.

## Options (three, ranked, your pick first)

| # | Flight out | Flight back | Hotel | Car | Total | Fare rules and expiry | Why |
|---|---|---|---|---|---|---|---|

- Each option shows: carrier, flight numbers, times local, stops, fare class, bag and change rules; hotel name, area, nightly rate with taxes, cancellation deadline; car class and pick-up.
- Prices are what you saw, with the source link and the time you saw them. A price not opened this session is UNVERIFIED. Fares move; the QC item states that the price may change before Kev books.
- Show the rule behind the pick: the cheapest refundable option that keeps the Sabbath and loses the fewest working hours, unless Kev set another rule.
- Then the itinerary: day by day, meetings and drive times, one line each, ready to become calendar holds.

## QC: every booking is a spend item

One QC item per thing bought (the flight, the hotel, the car), never a bundled "book the trip":

```
npm run qc -- submit host spend "<carrier or hotel: what it buys, dates>" "<exact option: flight numbers and times, fare class, fare rules, change and cancel terms, hotel room type and cancellation deadline, source link, time seen, alternatives ranked, which trip>" --amount <total in USD>
```

- The amount is the full price with taxes and fees as seen. A deposit, resort fee or cancellation penalty is named in the detail.
- Approval means Kev (or the person he names) books it. Jenny then records the confirmation number he gives her in `trip.md`, never a card or account detail.
- Calendar holds for the trip are `write_external` QC items with the exact events; Radar creates them once Kev says yes.
- Messages to a hotel, a driver or the people Kev is visiting are `send_message` drafts (`skills/comms-voice.md`), queued like any other draft.

## Output

`travel/<slug>/trip.md`: the recommendation in one line (where, when, total, Kev's decision), the options table, the itinerary, the QC ids, open questions. Hand Radar the proposed ledger rows (Lane Batch for the booking decision with your pick and what silence does: silence means nothing is booked; Lane Scheduled for the travel days). Family or personal trips carry KDTW Group and stay on the Home list.
