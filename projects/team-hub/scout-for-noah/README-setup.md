# Set up your own Scout (for Noah)

Kev's Scout is an AI lead researcher. This package gives your Claude the same playbook, so your agent builds lists and fills phones exactly the way Kev's does, and the two never collide.

## 1. Install the skill (5 minutes)

1. In Claude (claude.ai or the desktop app), open **Settings → Capabilities** and make sure **Skills** (and code execution) are on.
2. Under Skills, **Upload skill** and choose `eden-scout.zip` (this folder, zipped). It installs as "eden-scout".
3. Start a new chat and say: "Use eden-scout. Read the Lead Log and the Noah note, then tell me what's mine today."

Prefer Claude Code? Copy the `eden-scout` folder into `~/.claude/skills/` and it loads the same way.

## 2. Connect your tools (Settings → Connectors), all on YOUR logins

| Connector | Why |
|---|---|
| ZoomInfo | Search and phone enrichment, on **your** ZoomInfo seat (never Kev's) |
| Google Drive | Find and create sheets in the master leads folder |
| Google Sheets | Read and write cells on the lead sheets (required for the phone pass) |
| Gmail or Superhuman (optional) | Draft only; you send |

Ask Kev to share with you (Editor): the master leads folder `https://drive.google.com/drive/folders/1U6zVA_rBsft6mwYLjQ5F1Pr_DRz1OUg9` (includes the Lead Log), and the Eden Command Center so you can file asks on Scout's desk.

Crelate: your agent does not need it. Kev's Scout checks Crelate and puts Crelate IDs and mobiles on the sheets; the BPO team loads Crelate.

## 3. Your first run

- "Use eden-scout. Phone pass on the sheets assigned to me in the Noah note. Tier 1 first. Stop at <cap> paid credits."
- "Use eden-scout. Build a lead list: <client>, <role>, <metro>, <must-haves>. Ref EL-5NN."

## 4. Things to agree with Kev once

- Your ZoomInfo credit cap per night or week (the skill stops at 100 until you set one).
- Which lists are yours by default (the Noah notes in the folder say so each time).

## What keeps the two agents from colliding

Claim the sheet on the Lead Log before working it, never work a claimed sheet, separate ZoomInfo seats, separate reference numbers (Scout EL-001 to 499, you EL-500+), same columns (phones in E to H), find columns by header name. Details in `references/tandem.md`.
