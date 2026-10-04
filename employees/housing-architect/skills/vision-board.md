# Vision boards

A board is a curated set of images that communicates a direction: a room, a material palette, an exterior, a landscape.

## Process

1. Read the approved brief and live memory (`npm run memory -- show housing-architect`). List the style words and everything rejected before.
2. Pick one theme per board (for example "Living room and courtyard", "Kitchen materials", "Street elevation", "Primary bath"). Aim for 12 to 18 tiles.
3. Write 3 to 5 distinct queries for the theme: materials, composition, mood, specific elements, and at least one place-specific query for the climate and region (for example "high desert courtyard house", "foothills ranch porch").
4. Build the board in one command:
   `npm run board -- make --slug <slug> --title "<title>" --theme "<theme>" --queries "q1|q2|q3|q4" --audience family|public --avoid "<words from the avoid list>" --project "<project>" --orientation landscape --target 16`
   It searches every configured source, drops duplicates, series of near-identical shots, small images, previously rejected images and (for public boards) licences not cleared for commercial use, caps each creator at 3, mixes the queries, downloads the images into the file, and pings Unsplash for used photos.
5. Read the summary it prints. If fewer than 10 tiles survive, change the queries or run `npm run doctor` and tell the client which image sources are unconfigured (Unsplash and Pexels keys give far better interiors and architecture than Openverse alone).
6. Curate by hand: open `deliverables/boards/<slug>/board.json`, delete tiles that are the wrong region, climate, quality or mood, and write a one-line `note` on each remaining tile saying why it belongs. Include at least two tiles that stretch the brief slightly. Then run `npm run board -- build deliverables/boards/<slug>/board.json`.
7. Score the result against `rubrics/board.md` and fix what fails.
8. Deliver it with no copy-paste: publish `deliverables/boards/<slug>/board.page.html` with the Artifact tool (`capabilities: {"db": {}}`, a short `description`, icon `moodboard`; republish the same path to update). Post a `review` card on the Desk linking to it (`npm run desk -- card --kind review --link <url> --link-label "Open board" --title "<theme> board is ready"`), and notify once if the client is away. The board has Pin, Reject and a "Send to Marlowe" button that stores the feedback for you.
9. Pick up feedback as described in `ask-the-client.md` (query the board page's `feedback` collection, then `npm run board -- feedback`). If a rejection has no reason, do not chase it with a question. Infer the likely reason from the image, record it as an inference, and offer it as a one-tap check on the next board.

## Rules

- Board pages and Desk cards are already in the Eden format (Montserrat, cream and black, muted). Keep your notes short and result-first: why the tile matters, not what it shows.

- Licence per tile is kept. Never use an image whose `commercialOk` is false on a public-facing project.
- Unsplash download pings are sent by the tool when the board is built.
- Public-facing boards need a QC touch point before publishing: `publish` item.
- Do not buy images or subscriptions. That is a `spend` item.
- A source that is unreachable or rate-limited (for example Wikimedia returning 429) is reported by the tool, not fatal. Tell the client which sources contributed.
- Sharing a board with anyone else is a `send_message` item; publishing it publicly is a `publish` item.
