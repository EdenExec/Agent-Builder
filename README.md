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

The environment editor lives on the web, not in the Code tab of the phone app. On a phone, open **claude.ai/code** in Safari or Chrome (if it bounces to the app, long-press the link and open in browser, or use Request Desktop Website). Then:

1. Tap the **cloud icon** showing the environment name, in the row above the message box.
2. Tap **Cloud**, then the **gear** next to the environment you use (Default), to open **Edit cloud environment**.
3. In **Environment variables**, paste (one per line; lines 2 and 3 are optional):

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   UNSPLASH_ACCESS_KEY=...
   PEXELS_API_KEY=...
   ```
   The Anthropic key has to be an environment variable: the proxy's *API credentials* feature never attaches a key to api.anthropic.com. The key's organisation needs Managed Agents beta access; `npm run doctor` tells you if it does not.
4. In **Network access**, either pick **Full** (one tap), or pick **Custom**, tick *Also include default list of common package managers*, and paste:

   ```
   api.openverse.org
   commons.wikimedia.org
   upload.wikimedia.org
   api.unsplash.com
   images.unsplash.com
   api.pexels.com
   images.pexels.com
   live.staticflickr.com
   ```
5. **Save changes.**

Free image keys, if you want them: Unsplash at <https://unsplash.com/oauth/applications> (New Application → Access Key); Pexels at <https://www.pexels.com/api/> (Get Started → key shown immediately).

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
