# Where an agent setup lives: give options, let them choose (Kev, 29 Oct 2026)

Kev: "We should give him the option: on your computer, on GitHub, in the Drive, for cloud access... don't pigeonhole him into one method. As we help others set this up, we should give options: do you want to use GitHub? Google Drive? MS 365? iCloud? Local storage? What is best for the use case, and set it up from there. Cast a wide net and allow them to choose their own adventure."

**The rule.** Whenever any Eden employee or agent helps someone set up Claude workflows (a client, a candidate, a recruiter, Kev), we offer the menu below. Ask the five questions, recommend one option with the reason, and set it up the way they choose. Never assume GitHub, and never assume one tool.

## Five questions first

1. Where do your files already live? (Microsoft 365 / OneDrive, Google Drive, iCloud, your computer, GitHub)
2. Does it need to run while your laptop is closed?
3. Who else needs to see or edit the playbooks and outputs?
4. Who should own the work if you leave? (You, your company, a client)
5. How comfortable are you with technical setup? (None, some, developer)

## The menu

| Home | Best for | Runs with laptop closed? | Version history | Who owns it | Setup |
|---|---|---|---|---|---|
| **A folder on your computer** | One person, fastest start, no accounts to link | No: the Claude desktop app must be open and the computer awake for scheduled tasks | Only if you add backups | You (the computer's owner) | Claude desktop app, Code tab or a Cowork project, pick the folder, set scheduled tasks; turn on "Keep computer awake" |
| **Microsoft 365 (OneDrive or SharePoint folder)** | Companies on Outlook and Teams | No, same as above (the folder syncs to the computer) | Yes, per file, in OneDrive/SharePoint | The company, if it is a SharePoint or company OneDrive folder | Sync the folder to the computer, point the desktop app at it; connect the Microsoft 365 connector for mail and calendar (needs a work Microsoft account; IT may approve) |
| **Google Drive (My Drive or a Shared Drive)** | Teams on Google Workspace; Eden | No, same as above (Drive for desktop syncs it) | Yes, per file | The company, if it is a Shared Drive | Install Google Drive for desktop, point the desktop app at the synced folder; Google Drive connector for reading and writing from anywhere |
| **iCloud Drive** | Individuals on Mac and iPhone | No, same as above | Limited | You | Point the desktop app at an iCloud Drive folder |
| **GitHub (private repo)** | Developers, or anyone who wants full history and cloud runs | **Yes:** Claude Code on the web and cloud scheduled tasks run from a repo | Full, every change | Whoever owns the repo (put it under the company's organisation) | Create a private repo, connect GitHub to Claude, schedule routines in the cloud |
| **Cloud, no files** | A simple recurring brief that only reads email, calendar and connectors | **Yes**: a cloud scheduled task with no repository | Outputs only | The Claude account owner | Create a scheduled task on claude.ai with no repo; connectors do the reading |

**Mixing is fine.** Common pattern: playbooks in the company's Drive or SharePoint folder (owned, shared, versioned), scheduled locally on the desktop app, plus one cloud scheduled task for anything that must run with the laptop shut.

## Not yet verified (say so when you offer it)

- Whether a OneDrive, Google Drive or iCloud synced folder behaves well while a scheduled run is writing files. Sync can clash with files being written. Test with one daily run before relying on it.
- Which connectors exist for a given app (for example Read AI). Check the Connectors page in Claude before promising one.
- The Microsoft 365 connector's plan availability: sources disagree (all plans vs Team and Enterprise). It needs a work Microsoft account, not a personal one.

Sources (checked 29 Oct 2026): Claude Code docs on desktop scheduled tasks, scheduled tasks, routines and Claude Code on the web; Claude Cowork docs on projects; the Microsoft 365 connector help article.
