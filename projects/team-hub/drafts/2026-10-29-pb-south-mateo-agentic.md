---
to: Mateo Encinosa, PB South (MEncinosa@pbsouthconstruction.com), reply on "RE: (External) PB South Call Follow Up"
from: Kev (draft by Casey, 29 Oct 2026; Jenny may polish the tone; Kev sends)
status: draft, not sent
---

Mateo,

This is all killer. Six workflows that actually work is the hard part.

You may already have these running on their own. If not, one idea: set each one up as an agent on a schedule, in one place, with you approving what goes out. That's how we've set up Eden. Each workflow has its own written playbook, routines fire on their own each morning or each week, and anything that sends, files or changes a schedule waits for a yes.

**If it's useful, here's how your six could map over**

| Your workflow | As an agent | When it runs | What waits for you |
|---|---|---|---|
| 1. Daily run | Chief of staff agent: pulls Outlook, calendar, Read AI and Plaud, writes minutes, agendas and the daily brief | Every weekday, 5:30am | Nothing; it's ready when you sit down |
| 2. Document review | Estimating agent: bid leveling by trade, sub proposals against specs and drawings, first-pass submittals | When a bid or submittal lands in a folder | The briefing to your PE or PM |
| 3. Schedule | Scheduler agent: MS Project update, actuals against Procore daily logs, six-week look-aheads | Every night | Any date change before it is written to the schedule |
| 4. Back office | Admin agent: invoice coding, pay app and contract filing, insurance enrollment tracking | Daily | Anything that goes to accounting or a sub |
| 5. SOPs | SOP agent: turns a recorded walkthrough into a written procedure | When you drop a recording in | Final sign-off on the SOP |
| 6. Weekly exec summary | Reporting agent: one summary per job from daily logs, email and meeting recordings | Fridays, 2pm | The send |

**What's made it work for us**

- **One home.** One folder holds every playbook, your house format and a short "rules" file. Each agent reads the same rules, so the output always looks like PB South. Where that folder lives is up to you (options below).
- **Playbooks, not prompts.** Each workflow is a written playbook the agent follows every time. When you fix something once, it stays fixed.
- **A gate on everything outward.** Agents draft; you approve. Nothing is sent, filed or written to the schedule without your yes. A one-page dashboard shows what ran, what's waiting on you and what failed.

**A few more you might like, if you're not already doing them**

- **RFI and submittal logs:** drafted from the drawings and specs, with aging flags.
- **OAC meeting packets:** built the night before from the look-ahead, open RFIs and the last minutes.
- **Pay app check:** sub pay apps checked against the schedule of values and percent complete from the daily logs.

If any of this is new and you want to try it, pick where you'd like it to live, then paste the starter prompt below; it sets up the folder, the rules file and your daily run; the other five follow the same pattern. And if you're already further along than this, I'd love to see how you've done it. Either way, happy to get on a 30-minute call and compare notes.

Kev

---

**Where it can live: your call**

| Option | Good fit if | Runs with your laptop closed? |
|---|---|---|
| A folder on your computer | You want the fastest start, just for you | No: the Claude desktop app runs it while the computer is on |
| Your company OneDrive or SharePoint | PB South lives in Microsoft 365 and you want it shared, backed up and owned by the company | No, same as above (the folder syncs to your computer) |
| Google Drive or iCloud | Your files already live there | No, same as above |
| GitHub (private repo) | You want full version history and runs in the cloud | Yes |
| Cloud only, no files | A simple daily brief that just reads email and calendar | Yes |

You can mix them: playbooks in a company folder, the daily run on your desktop, one cloud task for anything that has to run with the laptop shut. Microsoft 365 needs your work Microsoft account for the Outlook and calendar connector, and your IT admin may need to approve it. Whichever you pick, run the daily brief by hand once or twice before trusting the schedule.

**Starter prompt**

```
You are helping me turn my construction-management workflows into scheduled agents. I am a project manager at a general contractor running two jobs.

0. First ask me where I want this to live: a folder on my computer, my company OneDrive or SharePoint, Google Drive, iCloud, a private GitHub repo, or cloud only. Ask whether it must run with my laptop closed and who else needs to see it. Recommend one option with the reason, then set it up the way I choose.

1. Create RULES.md: my house format for every document (headings, tone, length, how dates, names and dollar figures are written). Ask me 5 questions to fill it in, then write it.

2. Create a playbooks/ folder with one file per workflow:
   daily-run.md, document-review.md, schedule.md, back-office.md, sops.md, weekly-exec-summary.md.
   Each playbook has: purpose; inputs (which systems or folders it reads); steps; output (what file, in what format, where it is saved); what needs my approval before anything is sent, filed or written to a schedule; and how to tell me if a step failed.

3. Start with daily-run.md. It pulls yesterday's and today's Outlook email and calendar, Read AI notes and Plaud recordings (through the connectors I have connected; tell me which are missing). It writes:
   - minutes for every meeting from the day before (attendees, decisions, actions with owner and date),
   - an agenda and talking points for each meeting today,
   - a one-page daily brief: today's meetings, open actions due, anything overdue, and the three things I should do first.
   Save them to a dated folder (outputs/YYYY-MM-DD/). Never send an email or accept an invite.

4. Set daily-run to run every weekday at 5:30am Eastern as a scheduled task, in the way that fits where I chose to keep it (on my computer, the app must stay open and the computer awake; in the cloud it runs on its own). Show me how to run it by hand too.

5. Create OUTBOX.md: anything an agent wants to send, file or change waits here as a draft with one line on why. I approve or reject each item; nothing leaves without my yes.

6. When daily-run has worked for three days, help me build the next playbook in the same way, in this order: weekly-exec-summary, schedule, document-review, back-office, sops.

Rules for you: never send, file, pay or change a live schedule on your own. Never invent a date, a dollar figure or a name; if something is missing, say so in the output. Keep every playbook short enough to read in two minutes.
```
