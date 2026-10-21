---
title: Eden Office, research on virtual offices and ops control surfaces
org: epg
author: Scout
date: 2026-10-21
---

# What to do (5 lines)

1. Build a quiet, mostly grey floor where colour appears only when something needs Kev. Calm by default, loud by exception.
2. Cap it at 9 desks plus 7 benches on one screen, one light per desk, with shape and text beside colour (not colour alone).
3. Escalate in three steps: glow, then blink, then a pinned banner. Blink stops once Kev has seen it, and repeats get grouped.
4. Model tickets as delegation, not assignment: Kev stays accountable, the agent is a delegate, QC still gates send/spend/publish.
5. Make the levers (WIP, status from everyone, hand a ticket) one click from anywhere, and put a daily "what needs me" strip above the floor.

Confidence key: **H** = primary or multiple agreeing sources; **M** = one decent source or vendor-reported; **L** = single secondary source or inference. Most search results were vendor blogs; the web tool returned summaries, so many items carry no publication date. Dates shown are those the sources gave.

# 1. Virtual office products

| Finding | Source and date | Conf. |
|---|---|---|
| Nothing found says Gather, Kumospace, Sococo or Teamflow has shut down; all are still listed in 2026 comparisons. | [SoWork, Best Sococo/Kumospace/Gather alternatives](https://www.sowork.com/blog/best-sococo-alternatives-remote-team-presence-awareness), 2026 | M (competitor-written) |
| Gather launched 2.0 in Sept 2025, ended its free tier (now about $12 to $15 per user per month), and drew audio complaints after the relaunch. | [SoWork, Gather alternatives](https://www.sowork.com/blog/best-gather-town-alternatives-remote-teams), 2025 | M/L |
| Pixel-art avatars are "fun at 8 people, awkward at 25" and awkward when clients visit. No independent evidence of novelty-fatigue was found; the stated drivers are price, audio and aesthetics. | [Katmai, Gather alternatives](https://katmaitech.com/alternatives/gather-alternatives), 2026 | L |
| Teamflow shows little visible development since a 2023 acquisition (stalled, not confirmed dead). | [SoWork, Best virtual office software 2026](https://www.sowork.com/blog/best-virtual-office-software-in-2026-top-15-platforms-for-remote-teams), 2026 | L |
| Roam is alive and growing: about $3.9M ARR in July 2026, 51 staff, per-seat price nearly doubled since 2024, and it has widened from a map into presence plus meetings, chat and AI notes. | [Sacra on Roam](https://sacra.com/c/roam/), Jul 2026 (estimates) | M |
| Remotion became Multi and was acquired by OpenAI; shut down 24 Jul 2024. Pragli reportedly rebranded to Pesto and was discontinued (one directory only). Tandem: no news either way. | [Verdict](https://www.verdict.co.uk/openai-acquires-multi/), Jun 2024 (H for Multi); [Toolradar, Pragli](https://toolradar.com/alternatives/pragli) (L) | H / L |

What this means for us (inference, M): what survives is the presence layer (who is here, who is free, who is in a call), not the avatar world. The vendors that grew (Roam) moved toward status plus tools. Eden Office is the same idea in better clothes: a room of statuses, not a game.

# 2. Control surfaces and calm technology

| Finding | Source and date | Conf. |
|---|---|---|
| Weiser and Brown (Xerox PARC): good technology lives in the periphery and moves between periphery and centre. It should inform without demanding attention. | [Calm technology (Wikipedia)](https://en.wikipedia.org/wiki/Calm_technology); original "Designing Calm Technology", 1995 | H |
| Amber Case's refinement (2015): technology can communicate without speaking; use more than one sense for ambient awareness. | [Case, principles of calm technology](https://caseorganic.com/post/principles-of-calm-technology/), 2015 | M |
| The Ambient Orb (Ambient Devices, 2002) showed one data stream as one colour; the most popular use was a stock index (green up, red down, amber flat). About 20,000 sold in early coverage. One light, one meaning, glanceable. | [InformationWeek](https://www.informationweek.com/it-leadership/what-s-next-the-web-lava-lamp-) and [CFO.com](https://www.cfo.com/news/a-cubist-heeds-the-call-of-the-orb/676713/), c. 2002 to 2004 | M |
| Process-control "high-performance HMI": grey screens in normal state, colour only for abnormal conditions, so a real alarm stands out. ABB claims operators detect abnormal situations 5x more often before the alarm fires; that is vendor-reported. | [ABB](https://new.abb.com/power-generation/in-control/01-2016/the-key-to-operator-effectiveness), 2016; [Automation World](https://www.automationworld.com/products/control/blog/13315512/improve-operator-performance-with-high-performance-hmi) | H (principle) / L (the 5x) |
| Alarm management (ISA-18.2): alarms must trigger action; deadbands and on/off delays cut alarm load 45 to 90% in one cited study; the system needs ongoing review, not one-off setup. | [exida](https://www.exida.com/Resources/Whitepapers/alarm-management-and-isa-18-a-journey-not-a-destination); [ProcessOnline](https://www.processonline.com.au/content/software-it/article/improving-alarm-management-with-isa-18-2-part-1-37009763) | M/H |
| PagerDuty's noise levers: dedupe by key, group related alerts into one incident, suppress non-urgent alerts off-hours, pause "flappy" alerts until a threshold. | [PagerDuty, Alert fatigue](https://pagerduty.com/resources/digital-operations/learn/alert-fatigue/) | M |
| Blink: a subtle 20% brightness dip at 2 Hz had little or no attention value; full on/off blink works better; blink is best as a redundant cue beside colour. Red can fail for some colour-deficient viewers. | [FAA OAM technical reports](https://www.faa.gov/sites/faa.gov/files/data_research/research/med_humanfacs/oamtechreports/AM99-08.pdf) (air traffic control displays) | M |
| A lecture-deck figure of 3 to 10 flashes per second (about 4 best) for attention, steady above about 30. | [KSU lecture notes](https://faculty.ksu.edu.sa/sites/default/files/5%20-%20Chapter%205%20-%20Dynamic%20Visual%20Displays%20-%20Part%202%20-%20Qualitative%20Displays%20%28AMS%20May30_24%29.pdf) | L |

Not found: usable primary material on Linear's own inbox design, Bloomberg, or trading floors (searches returned nothing relevant). I will not claim anything about them. Gap, not a finding.

# 3. Agent-ops dashboards (2025 to 2026)

| Finding | Source and date | Conf. |
|---|---|---|
| Linear delegates to agents rather than assigning: the human stays primary assignee, the agent is a contributor "on their behalf", because "an agent cannot be held accountable". Insights can be sliced by delegate. | [Linear, AI Agents](https://linear.app/docs/agents-in-linear), [Agent Interaction SDK post](https://linear.app/blog/our-approach-to-building-the-agent-interaction-sdk), 2025 to 2026 (Developer Preview) | H |
| Multi-agent dashboards converge on status, current task and output, plus a review layer and audit trail. Cost per agent is commonly missing. | [Autonomous, multi-agent dashboard tools](https://www.autonomous.ai/en-CA/ourblog/multi-agent-dashboard), 2026 (vendor) | M |
| Some agent boards use a heartbeat (agents check in about every 15 minutes), so "stale" is visible. | same source | M |
| Approval UIs: show the exact action (the email body, the amount), not the agent's summary; avoid one modal for everything, which breeds review fatigue; tier approvals by risk; pauses must be durable. | [Agent UX checklist](https://www.agenticwire.news/article/agent-ux-design-patterns); [HITL tool-approval patterns](https://www.kunalganglani.com/blog/tool-approval-patterns-ai-agents); [LangChain HITL docs](https://docs.langchain.com/oss/python/langchain/frontend/human-in-the-loop), 2026 | M |

# 4. What a staffing owner watches daily

| Finding | Source and date | Conf. |
|---|---|---|
| Core set: submittal-to-interview ratio (one source cites 3:1 to 5:1), interview-to-placement, time to fill (segment by role and client), gross profit per recruiter, contractors on assignment, 90-day retention. | [RecruitBPM](https://recruitbpm.com/blog/recruitment-analytics-dashboard), 2026; [Bullhorn](https://www.bullhorn.com/small-agency-software/analytics-reporting/); [Crelate KPI reports](https://help.crelate.com/en/articles/4120310-kpi-reports) | M (vendor blogs; benchmarks vary) |
| Pair activity with output: 60 calls and 2 submittals is worse than 30 calls and 8. | RecruitBPM, 2026 | M |
| Daily view works best as a short priority list: the three or four actions with the most placement impact; flag submittals with no client feedback and overdue follow-ups; track client response time per client (over 5 days is a conversation). | RecruitBPM, 2026 | M |

For Eden (retained executive search, fewer and larger deals than contract staffing) I would watch: open searches by stage, submittals awaiting client feedback with days waiting, interviews this week, offers out, and cash in and out. Contractors-on-assignment does not apply. (Inference, M.)

# Do / Don't rules for Eden Office

1. **Do** keep the baseline grey and cream; colour appears only on a light. Normal should look boring.
2. **Do** keep one light per desk with a small count of the rest, as the brief says. **Don't** add a second light or a gauge to a desk.
3. **Do** pair every colour with a second cue: a shape (ring, dot, bar), a word on hover and a position. **Don't** rely on red against green; Kev's team may include colour-blind users, and the FAA data shows red can fail.
4. **Do** use a full-amplitude blink, about 1 to 2 flashes per second, for red and blue. A faint pulse is weak. Treat the 3 to 10 Hz figure as unverified. **Don't** blink faster than about 3 per second.
5. **Do** stop the blink when Kev opens the item (seen mark), and also after a time cap (say 30 minutes) falling back to a steady light. Blink must expire or it becomes wallpaper.
6. **Do** escalate in three steps: steady, blink, then a pinned top banner for red only. **Don't** let more than one banner show; group the rest ("3 more").
7. **Do** dedupe and group: ten failed items from one agent equal one light with a count. Never one blink per event.
8. **Do** cap the visible floor at about 9 desks and 7 benches, and put the rest behind a click. **Don't** put numbers on the floor except counts on lights.
9. **Do** show "last heard" on each desk, with a stale marker if an agent has been silent past its expected rhythm (heartbeat idea). A green glow on a dead agent is the worst lie.
10. **Do** write tickets as delegation: Kev stays owner, the agent is delegate, and the ticket page shows the exact action before approval. **Don't** let a ticket imply QC approval.
11. **Do** tier asks by risk, and batch routine confirmations into one daily "decisions" lever. **Don't** use one modal per item.
12. **Do** place a "needs Kev" strip above the floor, ranked, max three items, each one click from done. The floor is for orientation, the strip is for action.
13. **Do** show the source and date on every figure, as the brief requires, and flag figures older than their refresh cadence.
14. **Don't** use avatars, wandering sprites, sound, or confetti. Gather-style charm reads as novelty and clients and owners tire of it.
15. **Do** keep the Screen-share switch visible and test it first. It matters more than any visual feature.

# Three ideas we did not think of

1. **Quiet-hours floor.** After 6pm and on weekends, only red and amber can light; green work lights dim to a faint ring. Mirrors off-hours suppression in PagerDuty and keeps the Orb idea alive in the evening.
2. **Silence is a signal.** Alongside lights, show a "time since last output" ring that slowly fills. A desk that should have reported by 9am and has not is amber without anyone having to write an alert rule.
3. **Delegate insights as a weekly line.** Count tickets handed, tickets closed, and Kev-minutes saved per desk (as Linear slices by delegate). It tells him which agents earn their desk, and feeds the Sunday lab review with no extra work.

# Gaps

No usable results on Bloomberg Terminal, trading floors, NASA/utility control rooms beyond the HMI material, Linear's inbox, or independent evidence on virtual-office abandonment. I did not open full pages for most sources; claims rest on search excerpts.
