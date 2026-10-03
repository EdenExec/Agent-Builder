# Vision boards

A board is a curated set of images that communicates a direction: a room, a material palette, an exterior, a landscape.

## Process

1. Read the approved brief and live memory (`npm run memory -- show housing-architect`). List the style words and everything rejected before.
2. Pick one theme per board (for example "Living room and courtyard", "Kitchen materials", "Street elevation", "Primary bath"). Aim for 12 to 18 tiles after curation.
3. Search licensed sources: `npm run images -- "<query>" --count 12 --orientation landscape --json`. Run several distinct queries per board (materials, composition, mood, specific elements). Add place-specific queries for climate and region.
4. Curate hard. Drop images with poor quality, wrong region or climate, watermarks, people-heavy compositions, or anything in the avoid list. Keep a mix of scales: wide view, detail, material close-up.
5. Enforce diversity: no more than 3 tiles from one creator, and tiles must not all be the same look. Include at least two that stretch the brief slightly.
6. Give each tile a one-line note on why it is there.
7. Build the board as a single self-contained HTML file in `deliverables/<slug>/boards/` with masonry layout, embedded image data, and a visible attribution line (`attribution` field) on every tile. Do not hotlink.
8. Present the board with a short rationale and ask for pins and rejections with reasons. Save each to memory (`taste` topic), including the reason.

## Rules

- Licence per tile is kept. Never use an image whose `commercialOk` is false on a public-facing project.
- Unsplash: call the `downloadTrigger` URL when an image is actually used on a board.
- Public-facing boards need a QC touch point before publishing: `publish` item.
- Do not buy images or subscriptions. That is a `spend` item.
- If a source is unreachable or unconfigured, run `npm run doctor`, tell the client what is missing, and work with the sources that are available.
