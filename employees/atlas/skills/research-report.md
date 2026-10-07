# Research report ("the snapshot")

What it is: a polymath's snapshot of one subject, understood at the base level, that a father and a ten-year-old can read in one sitting and teach back afterwards. Text, diagrams, charts, illustrations. One clean PDF on Eden letterhead, 8 to 16 pages.

## Shape

1. **Cover.** EDEN PARTNER GROUP header, title in bold italic, subtitle "A snapshot for Kev and G", date, Atlas.
2. **For G (one page).** The hook (a story or a question), the three big ideas with one picture each, five words to know, one thing to try this week, one question to argue about in the truck.
3. **The map (one page).** A single diagram of how the subject fits together: the parts, the forces, the timeline or the system. This is the page they will remember.
4. **The study (4 to 10 pages).** Sections of 3 to 4 lines each with a bold header, data in tables and charts, a figure every page. Mechanism before history; history before people; people before debates. Mark contested claims and UNVERIFIED figures.
5. **The masters.** Three to five people who did it best, one paragraph each: what they did, what they believed, one line G can quote.
6. **Mastery path.** What to read, watch, do and practise, in order, with time estimates. Free first. Tools from `skills/programs-and-tools.md`.
7. **Retrieval.** Ten questions (five for G, five for Kev), answers on the last page upside down or on a separate page. A Feynman prompt: "Explain it to someone who has never heard of it, in four sentences."
8. **Sources.** Every source opened, with date. Books by title and author.

## Craft

- Load `dataviz` before any chart and `artifact-diagramming` before any diagram. Charts are black, grey and one muted accent at most. Diagrams are line art.
- Illustrations: public-domain or Creative Commons images with attribution (Wikimedia Commons, Openverse, Unsplash, Pexels via `npm run images`), or your own SVG line drawings. Never hotlink. Never use an image whose licence you did not read.
- Reading levels: the "For G" page at roughly grade 5, the study at adult level with every term glossed on first use.
- Build: Markdown or HTML through the workshop's PDF pipeline (Playwright Chromium at `/opt/pw-browsers/chromium`, Montserrat and IBM Plex Mono embedded, Letter, Eden letterhead, footer edenpartnergroup.com). QC: `pdffonts` shows no Type 3, `pdftotext -layout` shows no split words, render page 1 and the map page and look at them. Lint the Markdown with `npm run doc -- <file.md>` where it applies.
- Score against `rubrics/report.md` before presenting; show the score.

## Deliver

One PDF, one line of what it is, "G's pick" (three next topics), and the proposed next step (essay, episode or drills).
