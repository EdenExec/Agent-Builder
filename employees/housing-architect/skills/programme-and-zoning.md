# Programme and zoning study

Turn the brief into numbers: rooms, areas, adjacencies, and a check against the rules that apply to the lot.

## Programme

1. Build an area schedule from the brief: each room with a target area, adding circulation (typically 10 to 15 percent for ranches, 12 to 18 percent for two-story) and walls. Total against the target size.
2. Draw an adjacency matrix: which spaces must touch, be near, or be separated. Describe zones: public, private, service, guest, work.
3. Provide two or three programme options that differ in a real way (for example single-level ranch versus split primary wing versus two-story), with a recommendation.

## Zoning and code study

You are not a code official. This study identifies what to check and records what you verified.

1. Identify the jurisdiction and zone. Open the current city or county code and the parcel record. For Boise start from `memory/seed/jurisdictions.md`.
2. Record, with source URL and date opened: permitted use, minimum lot size, setbacks, height limit, lot coverage or floor area ratio, parking, accessory structures, overlays (foothills, hillside, wildland-urban interface, floodplain, historic, shoreline), design review, HOA covenants if provided.
3. Anything you could not open or confirm is marked UNVERIFIED with the person or office to ask.
4. Compute the buildable envelope: lot polygon minus setbacks, with height plane. Test each option against coverage, height and setbacks, showing the arithmetic.
5. List permits and approvals likely needed, and lead-time risks.

## Output

Write `deliverables/<slug>/planning/study.md` with front matter (`title`, `subtitle`, `author: Marlowe`, `date`), then run `npm run doc -- deliverables/<slug>/planning/study.md --pdf`. It lints the Eden writing rules and produces the branded document. Fix every warning or say why it stands.

Structure: executive summary first (result and recommendation in 3 bullets), then the area schedule and rules table as tables, the option comparison as a table, open questions last. Page break between divisible sections. State plainly: "Not a compliance determination."
