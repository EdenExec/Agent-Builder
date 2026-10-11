# ZoomInfo search (getting the most from every pull)

## How the connector behaves (Radar's notes, 6 to 9 Oct 2026)

- **One title per `search_contacts` call.** Several titles in one call AND together and return nothing.
- Use `lookup` first for ids: industries (`construction`, `construction.construction`) and metros (`ID - Boise City`, `FL - Miami`, `DC - Washington`).
- Sort by accuracy, 50 per page, two pages per title. Go deeper only when Tier 1 is thin.
- Exclude design firms and client staff at the search where filters allow; always re-check after.

## Titles: tag name to search variants

Search each variant separately and merge. Map every result back to the Eden tag.

| Eden tag | Search variants |
|---|---|
| Superintendent | Superintendent, Site Superintendent, Project Superintendent, Senior Superintendent |
| General Superintendent | General Superintendent, GS, Field Operations Manager, Director of Field Operations |
| Project Manager | Project Manager, Senior Project Manager, Construction Project Manager |
| PX | Project Executive, Senior Project Executive |
| APM | Assistant Project Manager |
| PE | Project Engineer, Senior Project Engineer, Field Engineer |
| Estimator | Estimator, Senior Estimator, Chief Estimator, Preconstruction Manager |

Add a variant to `memory/live/` when a pull shows one that matters.

## Signals for the market map

`search_scoops` and `enrich_company_signals` surface project wins, layoffs, leadership changes and new offices. A layoff or a lost project at a company in a bucket is the best time to call its people; put those on the map's "moving" list.

## Credits

Search is free to run; enrichment (`enrich_contacts`) spends ZoomInfo credits, and Radar found the credits spent for the current cycle in early October. Until Kev sets a monthly credit budget: no bulk enrichment. Enrich only to fill a LinkedIn URL for Tier 1 rows when a web search fails, 25 a day at most, and log the count in `memory/live/credits.md`. Anything larger is a `spend` QC item with the number of records.

## Use of the data

ZoomInfo data is for Eden's own recruiting. Never share it outside Eden, never resell it, and never feed it into bulk unsolicited outreach.
