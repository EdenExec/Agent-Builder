---
to: Mateo Encinosa, PB South (MEncinosa@pbsouthconstruction.com), reply on "RE: (External) PB South Call Follow Up"
from: Kev (draft by Casey, 29 Oct 2026; Jenny may polish the tone; Kev sends)
status: draft, not sent
---

Mateo,

This is all killer. You've already built the hard part: six workflows that work. The next step is to stop running them by hand and let them run as agents on a schedule, in one place, with you approving what goes out.

That's how we run Eden now. Each workflow becomes a small "employee" with its own written playbook. Routines fire on their own each morning or each week. Anything that sends, files or changes a schedule waits for your yes.

**How your six map over**

| Your workflow | As an agent | When it runs | What waits for you |
|---|---|---|---|
| 1. Daily run | Chief of staff agent: pulls Outlook, calendar, Read AI and Plaud, writes minutes, agendas and the daily brief | Every weekday, 5:30am | Nothing; it's ready when you sit down |
| 2. Document review | Estimating agent: bid leveling by trade, sub proposals against specs and drawings, first-pass submittals | When a bid or submittal lands in a folder | The briefing to your PE or PM |
| 3. Schedule | Scheduler agent: MS Project update, actuals against Procore daily logs, six-week look-aheads | Every night | Any date change before it is written to the schedule |
| 4. Back office | Admin agent: invoice coding, pay app and contract filing, insurance enrollment tracking | Daily | Anything that goes to accounting or a sub |
| 5. SOPs | SOP agent: turns a recorded walkthrough into a written procedure | When you drop a recording in | Final sign-off on the SOP |
| 6. Weekly exec summary | Reporting agent: one summary per job from daily logs, email and meeting recordings | Fridays, 2pm | The send |

**Three things that make it work**

- **One home.** One project folder (a private Git repo) holds every playbook, your house format and a short "rules" file. Each agent reads the same rules, so the output always looks like PB South.
- **Playbooks, not prompts.** Each workflow is a written playbook the agent follows every time. When you fix something once, it stays fixed.
- **A gate on everything outward.** Agents draft; you approve. Nothing is sent, filed or written to the schedule without your yes. A one-page dashboard shows what ran, what's waiting on you and what failed.

**Where I'd add next**

- **RFI and submittal logs:** drafted from the drawings and specs, with aging flags.
- **OAC meeting packets:** built the night before from the look-ahead, open RFIs and the last minutes.
- **Pay app check:** sub pay apps checked against the schedule of values and percent complete from the daily logs.

Below is a starter prompt to paste into Claude Code. It sets up the folder, the rules file and the first playbook (your daily run) as a scheduled agent. Once that one works, the other five follow the same pattern. Happy to get on a 30-minute call and walk through how we set ours up.

Kev

---

**Starter prompt (paste into Claude Code, in a new empty project folder)**

```
You are helping me turn my construction-management workflows into scheduled agents. I am a project manager at a general contractor running two jobs. Set up this project folder as my operations system.

1. Create RULES.md: my house format for every document (headings, tone, length, how dates, names and dollar figures are written). Ask me 5 questions to fill it in, then write it.

2. Create a playbooks/ folder with one file per workflow:
   daily-run.md, document-review.md, schedule.md, back-office.md, sops.md, weekly-exec-summary.md.
   Each playbook has: purpose; inputs (which systems or folders it reads); steps; output (what file, in what format, where it is saved); what needs my approval before anything is sent, filed or written to a schedule; and how to tell me if a step failed.

3. Start with daily-run.md. It pulls yesterday's and today's Outlook email and calendar, Read AI notes and Plaud recordings (through the connectors I have connected; tell me which are missing). It writes:
   - minutes for every meeting from the day before (attendees, decisions, actions with owner and date),
   - an agenda and talking points for each meeting today,
   - a one-page daily brief: today's meetings, open actions due, anything overdue, and the three things I should do first.
   Save them to a dated folder (outputs/YYYY-MM-DD/). Never send an email or accept an invite.

4. Set daily-run to run every weekday at 5:30am Eastern as a scheduled task. Show me how to run it by hand too.

5. Create OUTBOX.md: anything an agent wants to send, file or change waits here as a draft with one line on why. I approve or reject each item; nothing leaves without my yes.

6. When daily-run has worked for three days, help me build the next playbook in the same way, in this order: weekly-exec-summary, schedule, document-review, back-office, sops.

Rules for you: never send, file, pay or change a live schedule on your own. Never invent a date, a dollar figure or a name; if something is missing, say so in the output. Keep every playbook short enough to read in two minutes.
```
