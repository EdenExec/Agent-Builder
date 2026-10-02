# Agent-Builder

A workshop for hiring AI employees. Employee one is a housing architect, interior designer and master planner that you brainstorm with, send away, and get vision boards, planning studies and 3D massing back from.

Design overview and build plan: see `docs/` and the published wireframe.

## Status

| Phase | State |
|---|---|
| 0 · Scaffold: image connectors, doctor, test harness | in progress |
| 1 · Hire: agent config, memory, brainstorm | not started |
| 2 · Vision boards | not started |
| 3 · Planning | not started |
| 4 · 3D massing and renders | not started |
| 5 · Browser office | not started |

## Your three-minute setup

Everything below is a one-time edit in the cloud environment's settings (title bar → cloud environment menu → **Edit**). Nothing needs to be pasted into chat.

1. **Anthropic key.** Under *API credentials* add `ANTHROPIC_API_KEY`. The key's organisation needs Managed Agents beta access; `npm run doctor` tells you if it does not.
2. **Network access.** Add these hosts to the allowed domains (or pick a broader access level):
   `api.openverse.org`, `commons.wikimedia.org`, `api.unsplash.com`, `api.pexels.com`, `upload.wikimedia.org`, `images.unsplash.com`, `images.pexels.com`, `live.staticflickr.com`.
   The first four are the search APIs; the rest serve the image files boards embed.
3. **Optional image keys** (free, better interiors):
   - Unsplash: <https://unsplash.com/oauth/applications> → *New Application* → copy **Access Key** → add as `UNSPLASH_ACCESS_KEY`.
   - Pexels: <https://www.pexels.com/api/> → *Get Started* → key is shown immediately → add as `PEXELS_API_KEY`.

A new session picks the settings up. Then:

```sh
npm install
npm run doctor
```

Doctor prints one line per connection with the exact fix for anything failing.

## Commands

```sh
npm run doctor                                   # what is wired up, what is missing, how to fix it
npm run images -- "warm minimal kitchen"         # search every configured source
npm run images -- "oak kitchen" --providers openverse,pexels --count 6 --orientation landscape --json
npm test                                         # connector tests with recorded responses (no network)
npm run typecheck
```

## Layout

```
workshop/
  lib/http.ts          proxy-aware fetch, error classification
  sources/             openverse, wikimedia, unsplash, pexels behind one ImageSource interface
  office/doctor.ts     connection health
  office/images.ts     search CLI
employees/             (phase 1) one folder per employee: agent.yaml, skills/, memory/seed/, rubrics/, evals/
docs/                  design notes
```

## Image sources and licensing

| Source | Key | Licence | Notes |
|---|---|---|---|
| Openverse | none | Creative Commons, commercial filter applied | Aggregates Flickr, Wikimedia, museums |
| Wikimedia Commons | none | CC / public domain, varies per file | NC, ND and non-free files are dropped |
| Unsplash | free | Unsplash License | Attribute "Photo by X on Unsplash"; request `downloadTrigger` on use |
| Pexels | free | Pexels License | Credit photographer and Pexels |

Every candidate carries title, creator, licence, source page and a ready-to-print attribution line. Boards embed the image bytes so they do not rot.
