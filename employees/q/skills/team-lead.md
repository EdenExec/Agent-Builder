# Running a team job (Kev, 30 Oct 2026: "give Q more team power... divide and conquer and spin up changes as a team")

You have three helpers, defined in `.claude/agents/`: `q-data` (pulls, office-prep, `meta/*`, builders, tests), `q-page` (the Command Center screens and other pages) and `q-qa` (the tester). You are the lead: you split, dispatch, merge, have it tested, publish and report. The helpers never publish, push or touch a live system.

## When to use the team
- A team job is anything that touches both data and screens, or two panels at once, or would take you more than about an hour alone (the Team pulse panel, the Needs Kev rework).
- A small fix (a roster change, a label, one function) stays with you alone: the team costs three or four agents' worth.
- Team jobs run from your own standing session, which can spawn helpers. Radar sends them there with `send_message` and a ticket on your desk.

## The loop
1. **Split.** Write a short brief per helper: the goal in Kev's words, the exact files that slice owns, the data fields (name, type, meaning) the page will read, and what "done" looks like. No two helpers own the same file.
2. **Dispatch in parallel.** One `Agent` call each, in a single message, with `isolation: "worktree"` so each works on its own copy. Pass the commit trailers. `q-data` and `q-page` run together when the page brief already names the fields; otherwise data goes first.
3. **Merge.** Merge each helper's worktree branch into the working branch. Resolve conflicts yourself; regenerate nothing by hand.
4. **Test.** Dispatch `q-qa` on the merged tree with the brief and the artifact URL. A FAIL goes back to the helper that owns that file, with the tester's evidence. Repeat until PASS.
5. **Ship.** Publish the page (Artifact publish, same file path and url, never pass `capabilities`), push with the repo's push line, set the ticket `done` with one line, and tell Radar in five lines: what changed, page version, what Kev should try first, anything unverified.

## Publishing the split page (since 30 Oct 2026)
Markup is `projects/virtual-office/draft/eden-office.html`; styles and panels are `projects/virtual-office/draft/office/` (`page.css`, then `core.js`, `floor.js`, `pulse.js`, `strip.js`, `family.js`, `desks.js`, `today.js`, `boot.js`, loaded in that order, sharing the page's global scope). Publish with `file_path` the html, `url` the Command Center, and `files` set to the map in `projects/virtual-office/artifact.json` (the same as `officeFilesMap()` in `workshop/office/page-game.ts`), every time, so a changed panel actually ships. Never pass `capabilities`. Ownership: one page helper per panel file; `core.js` and `boot.js` are yours (shared). Code that runs at load time (listeners, switches, timers) goes in `boot.js` in order; panel files hold declarations. `npm run office -- build-page` refreshes the game and projects cores inside `core.js`.

## The page split (first team job, done 30 Oct 2026)
The Command Center is one ~330 KB file, so only one page helper can work at a time. Split it into panel files published with the page through the Artifact `files` map (`floor.js`, `today.js`, `desks.js`, `strip.js`, `pulse.js`, `family.js`, plus `core.js` for shared helpers and `page.css`), loaded in a fixed order. Behaviour must not change: `q-qa` compares screenshots before and after at all three widths. After the split, each page helper owns whole panel files and two can run at once.

## Rules that do not change
Your hard rules still hold for the whole team: read-only on live systems except the approved Crelate notes writer; nothing sent, spent or published to anyone but Kev; counts and first names on team surfaces; never print a key; the Sabbath.
