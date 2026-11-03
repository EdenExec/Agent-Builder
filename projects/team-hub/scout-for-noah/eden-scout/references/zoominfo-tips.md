# ZoomInfo connector: what works

- Search is free; enrich costs credits (records already under management are free for a year).
- Use lookup first for exact metro and industry values (e.g. "CA - San Francisco", "FL - Miami").
- One title per search_contacts call works best; several exact titles in jobTitleList also work. Title match is fuzzy: check results.
- search_contacts returns NO city, state or LinkedIn URL. City/State/Time Zone come from the metro you searched or the company office; flag "office location; confirm" in Note.
- One firm is often split across several company records (e.g. "Skanska" vs "Skanska USA Building"; Howard S. Wright sits under Balfour Beatty). For firm sweeps, search every record variant, and also try metroRegion + title without a company filter.
- Some firms' local staff are simply missing (Skanska, Sundt, Balfour Beatty had almost no Bay Area people). Then use public web search for LinkedIn profiles (site:linkedin.com/in "Firm" "Title" "Metro"), record the exact profile URL, Source "LinkedIn (public web search)". Never guess a URL.
- Output is large (~25k tokens per 50 rows): work in batches and write to the sheet as you go.
