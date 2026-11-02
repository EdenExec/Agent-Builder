# After you copy your Crelate API key: getting Claude and Crelate talking

Kev, 30 Oct 2026. For every Eden recruiter. About 15 minutes, once. You need your Eden Claude login (your edenexec.com email). Never use a personal Claude account for Eden work.

## Step 1. Open Claude Code on the web
Go to **claude.ai/code** and sign in with your Eden account. Start a new session on the **Eden Recruiter Kit** repository (EdenExec/recruiter-kit). If you can't see it, ask Kev or Nick to add you.

The kit already holds three things, so you don't build them yourself:
- `CLAUDE.md`: the Eden standards (nothing goes out without your yes, no spending, Crelate is read-only).
- `.claude/agents/recruiting-assistant.md`: your recruiting assistant (screens, submittal packets, Crelate lookups).
- The submittal packet templates (cover page, Must Dos scorecard).

**Other homes.** The kit on GitHub is the default (Kev's pick, 30 Oct). It's the only home where Claude keeps working with your laptop closed. If you'd rather keep your assistant in a folder on your computer, or in the Eden Google Shared Drive with the Claude desktop app, ask Kev or Nick. It uses the same files in a different home.

## Step 2. Put your key in the environment, not in the chat
1. In the session's title bar, open the **cloud environment** menu, then **Edit**.
2. Under **Network secrets** (an older app calls it **API credentials**; if neither shows, use **Environment variables**), add one entry:
   - Name: `CRELATE_API_KEY`
   - Value: the key you copied from Crelate
3. **Never paste the key into the chat**, an email or a doc. If you ever do by mistake, turn API access off and on again in Crelate to get a new key.

## Step 3. Let the environment reach Crelate
Same Edit screen, **Network access**:
- If it's set to **Limited**, add `app.crelate.com` under **Allowed domains**.
- Leave **Allow package managers** ticked.
- Save.

## Step 4. Start a fresh session and test it
A new session picks up the key. Type:

> Use the recruiting assistant. Read-only: is "<a candidate you know>" in Crelate? Who owns them and when were they last touched?

If you get the record back, you're connected.

| What you see | What to do |
|---|---|
| Blocked or 403 | Step 3 isn't saved yet. |
| Key missing | Step 2 isn't saved yet, or you're still in the old session. Start a new one. |

## Step 5. Use it
Say what you'd say to an assistant sitting next to you:
- "I just screened <name> for <job order>. Build the Eden submittal packet: cover page with the Must Dos scorecard, his resume and project list untouched, then references and my notes." It pulls the candidate from Crelate, asks you for anything missing (Must Dos, resume, your screening notes), builds the packet and hands it back. **You review it, Kev reviews every packet, and you send it.** Claude never sends.
- "What did I log this week: calls, submittals, first interviews?"
- "Check this lead list against Crelate and mark who's already in."

## The rules that keep us safe
- **Your own key only.** Never share it, and never use someone else's.
- **Crelate stays read-only for Claude.** Stage moves, notes and tags are yours to do in Crelate.
- **Nothing leaves without your yes:** no emails, texts, uploads to client portals, posts or spending (ZoomInfo credits included).
- **Desired pay only on a cover page.** Never current pay unless Kev says so for that candidate.
- **No made-up facts.** If it isn't in the resume or your notes, it says "confirm with candidate".
- **Eden data stays in your Eden Claude.** Never in a personal account or another AI tool. Don't send thumbs-up/down feedback on chats with candidate or client details.

Stuck? Tell Claude: "I'm stuck on step <n>, here's what I see." It can walk you through it. Or ask Kev or Nick.
