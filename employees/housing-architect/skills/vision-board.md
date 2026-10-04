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
7. Score the result against `rubrics/board.md`, fix what fails, and present the board with a short rationale and the score. The board is one self-contained HTML file with pin and reject buttons and a "Send feedback to Marlowe" button that produces text for the client to paste back.
8. When the client pastes feedback, save it: write it to a file and run `npm run board -- feedback deliverables/boards/<slug>/board.json <file>`. This records pins, rejections and reasons in memory and makes sure rejected images never return. If a rejection has no reason, ask for one.

## Rules

- Licence per tile is kept. Never use an image whose `commercialOk` is false on a public-facing project.
- Unsplash download pings are sent by the tool when the board is built.
- Public-facing boards need a QC touch point before publishing: `publish` item.
- Do not buy images or subscriptions. That is a `spend` item.
- A source that is unreachable or rate-limited (for example Wikimedia returning 429) is reported by the tool, not fatal. Tell the client which sources contributed.
- Sharing a board with anyone else is a `send_message` item; publishing it publicly is a `publish` item.
