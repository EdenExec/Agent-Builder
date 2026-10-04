# Agent-Builder

A workshop for hiring AI employees. Employee one is a housing architect, interior designer and master planner that you brainstorm with, send away, and get vision boards, planning studies and 3D massing back from.

Design overview and build plan: `docs/overview.html` (also published as an artifact: https://claude.ai/artifact/Tat89bfBNgfj4Vgo6u6P8N).

## Status

| Phase | State |
|---|---|
| 0 · Scaffold: image connectors, doctor, test harness | done (12 tests passing) |
| 1 · Hire: agent config, memory, brainstorm, QC gate | done (32 tests passing) |
| 2 · Vision boards | done (50 tests passing). Best with Unsplash and Pexels keys |
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
npm run hire -- check                            # validate every employee folder
npm run hire -- compile                          # regenerate .claude/agents/*.md after editing an employee
npm run brief -- projects/<slug>/brief.yaml      # completeness check + review copy of a design brief
npm run doc -- file.md [--pdf]                    # lint a document against the Eden rules and produce the branded HTML/PDF
npm run status                                   # projects, approvals waiting, boards
npm run desk -- card|from-qc|apply               # post and process one-tap asks (Marlowe uses these)
npm run qc                                       # what is waiting for your approval
npm run qc -- approve <id> | reject <id> [note]  # you decide; agents are blocked from running these
npm run board -- make --slug x --title T --queries "a|b|c"   # build a vision board (see header of workshop/office/board.ts)
npm run board -- feedback <board.json> <file>    # record pins and rejections from a board
npm run memory -- show housing-architect         # what Marlowe has learned about your taste
npm test                                         # all tests, no network
npm run typecheck
```

## Layout

```
workshop/
  lib/http.ts          proxy-aware fetch, error classification
  sources/             openverse, wikimedia, unsplash, pexels behind one ImageSource interface
  office/doctor.ts     connection health
  office/images.ts     search CLI
  boards/              curate, embed, render and feedback for vision boards
  office/board.ts      board CLI
  core/                employee loader and compiler, QC gate, memory, design brief
  office/              hire, qc, memory, brief CLIs
qc/                    approval queue: pending, approved, rejected (one JSON file each)
projects/<slug>/       brief.yaml, decisions.md for each project
.claude/agents/        generated subagents; invoke by name in Claude Code
employees/             one folder per employee: agent.yaml, persona.md, skills/, memory/seed/, rubrics/, evals/
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

## Working with Marlowe (housing architect)

Easiest: open a Claude Code session on this repo (claude.ai/code or the phone app) and type `/marlowe` followed by what you want, for example `/marlowe brainstorm a single-level ranch outside Eagle`. That gives a normal back-and-forth conversation. For one-shot jobs you can also say "Use the housing-architect agent to build a kitchen board for project X". Marlowe's files, memory and `qc/` are committed to the repo, so commit and push at the end of a session or they vanish with the container. Marlowe interviews you, keeps a brief in `projects/<slug>/brief.yaml`, and queues it for your approval before any work starts. Then: vision boards (`deliverables/boards/<slug>/board.html`, one self-contained file you open on any device), then a programme and zoning study. 3D massing is phase 4.

**Guardrails.** Spending money and sending any message to another person always need your approval, and this cannot be switched off in `agent.yaml` (the loader rejects it). Approvals live in `qc/`. Project permissions in `.claude/settings.json` stop agents from running `qc approve` or editing `qc/`. Run `npm run qc` to see what is waiting.

**Honest limits.** Marlowe is not an architect of record or a code official. Zoning and cost figures are either cited from a source opened that session or marked UNVERIFIED. The probation cases in `employees/housing-architect/evals/` are scored by reading a transcript against the checklist; there is no automated model run yet.

See `docs/roster.md` for the employees planned next.

### Vision boards

Marlowe builds a board with `npm run board -- make`. Open `board.html`, pin or reject each image with a short reason, tap **Send feedback to Marlowe**, copy the text and paste it into the chat. Marlowe records it with `board feedback`, and rejected images never come back on later boards. Boards embed the image bytes, keep creator and licence on every tile, and public-facing boards only use commercially cleared images. Without Unsplash and Pexels keys only Openverse and Wikimedia are used, and results for interiors and architecture are noticeably weaker.

### The Desk (how Marlowe asks you for things)

`workshop/desk/desk.html` is published as a private page, **Marlowe's Desk**: https://claude.ai/artifact/2eHGZMaWKJox5hFGHYWLPo. Every decision, approval and review arrives as a card with Marlowe's recommendation highlighted, so the usual answer is one tap. Each card says what happens if you stay silent, so work never stalls on you. A note box lets you tell Marlowe anything. Board pages published for review have a **Send to Marlowe** button, so feedback needs no copy-paste. In a live conversation Marlowe asks with tappable questions instead. The rules Marlowe follows are in `employees/housing-architect/skills/ask-the-client.md`.

Limits: Marlowe reads answers when a session is active, at the start of each session and when you say "check the desk". Nothing wakes a closed session. Approving spending or messages from the Desk is recorded but never applied on its own; Marlowe confirms those once in conversation. Boards and Desk cards live in the page databases, not in git.

### Eden brand standard

Everything every employee produces follows Eden Partner Group's visual identity (`docs/brand/eden-visual-identity.pdf`, summarised in `employees/_shared/eden-brand.md` and compiled into each employee's instructions; the loader refuses an employee if the file is missing). In practice: Montserrat only, cream or white with black lettering, bold headers, no more than 3 bullets per section, result first, data in tables, cover page and contents for larger documents. Tokens and the document renderer are in `workshop/brand/`. Documents go through `npm run doc`, which lints these rules and embeds Montserrat so PDFs always render in it. Board pages embed Montserrat too; the Desk page loads it from Google Fonts. Montserrat is licensed under the SIL Open Font License.
