# Command Center panels

Split from `../eden-office.html` on 30 Oct 2026 (ticket t-202610300300-splt). The html holds the markup and loads these in order:

| File | What it holds |
|---|---|
| `page.css` | All page styles |
| `core.js` | Constants, the game and projects cores (generated: `npm run office -- build-page`), state, helpers, sheets, sync, calendar, data loading, `boot()` |
| `floor.js` | The Floor: board, line, records, banner taps, zones and desks, focus, tools, drawing |
| `pulse.js` | Team pulse: dials and RPs by day, weekly goals, the recruiter sheet |
| `strip.js` | The Needs Kev strip and Clear the stack |
| `family.js` | The family wing's look-ahead card (private; closes under Screen share) |
| `desks.js` | Desk sheets: tickets, chats, projects, needs, autopsies, benches, levers, photo upload |
| `today.js` | The Today view |
| `boot.js` | Load-time wiring in the original order (listeners, switches, timers), then `boot()` |

The scripts are classic scripts sharing one global scope, so a function in one file can call any other once the page has loaded. Anything that runs while the page loads goes in `boot.js`. Publish with the `files` map in `projects/virtual-office/artifact.json`.
