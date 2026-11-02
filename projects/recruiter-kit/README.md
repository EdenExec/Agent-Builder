# Eden Recruiter Kit

Your Claude Code workspace at Eden Partner Group. Open this folder in Claude Code and it reads `CLAUDE.md`, the Eden standards, before every task.

- `CLAUDE.md`: the Eden standards. Nothing leaves without your yes.
- `.claude/agents/recruiting-assistant.md`: your recruiting assistant. Ask Claude to use it for sourcing notes, screens, submittals and follow-ups.
- `docs/crelate-in-claude.md` and `docs/after-the-api-key.md`: connecting Crelate.
- `submittal-packet/`: the submittal templates (cover page, Must Do scorecard, Must Dos intake, the team prompt) and the Eden letterhead.
- `npm run submittal -- <packet.json> [--draft]`: builds a submittal PDF (needs Node 22.18 or newer, Chromium, and `pdfunite`; without them, the assistant builds the PDF its own way). Keep filled packets in Drive, never in this repo.

No client lists, candidates or keys live here. Your Crelate key goes in your own settings, never in a file.
