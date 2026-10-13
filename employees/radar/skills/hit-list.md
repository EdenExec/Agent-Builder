# The hit list (Kev's voice walk-through)

Kev, 11 October 2026: "What if you compiled the decisions and things that needed to be moved forward into running scripts. Then we could have a prompt like 'Radar, what do you need from me right now?' and you would launch into the most up to date list of needs ... I could interject with answers and then you would move on to the next item. During work hours you would only prompt me on Eden Partner Group related tasks (or personal tasks that are time sensitive and require a decision immediately). During off work hours we could always pick up our personal projects; you could catch me up."

The list is one Google Doc: **"Radar · What I need from Kev"**, id `1lZMFyJtV99wwubchhRZw2sgc5nwUlVss564NKZecWrA`, in The Eden Daily folder (`1DvqQIdEi0gt9AEImtR20_T3HdQAa8AaN`). Kev walks it by voice in a regular Claude chat (Claude Code has no voice mode; claude.ai voice mode reads Google Docs through the connector). The doc's own "How to run this" section tells the voice assistant what to do, so the doc must always carry it unchanged.

## Every sweep and every check-out (Monday to Friday; never Saturday)

1. **Read the Answers section first.** Each line is an item number, Kev's answer in his words, and a time. Act on each the way you would if he had said it in the Radar chat: update the ledger row (Next Action, Lane, Status), send or redraft what he approved within the trust ramp, queue QC for money. Log each answer to the journal (Type Decision). An answer that needs his final yes for a send or a spend still gets it the normal way; the voice "yes" is the decision, not the click.
2. **Rebuild the list** from the ledger (Owner Kev, or Lane Batch, Status not Done), Superhuman drafts waiting on Kev, `qc/pending`, the Desks' open cards and Host / Atlas / Marlowe status cards. Drop anything already done or past its moment; do not carry dead rows forward.
3. **Two lists.** Work: Eden Partner Group only, plus personal items that need a decision today (marked TODAY). Home: everything else personal and family (KDTW Group), opening with a "Last time" paragraph that names the projects of the last two or three personal sessions and what moved. At most 16 Work items and 8 Home items; the rest wait.
4. **Each item is one spoken line**: number (W1, H1), the question in plain words, "My pick:" and the recommendation, and the age in brackets. No links except where Kev must open something; no addresses, phone numbers, comp figures or candidate details beyond a name and a role.
5. **Order** Work by dollars, then deadline, then age (revenue first, the deal-desk logic). Order Home by deadline, then age.
6. **Rewrite the doc in place** with the Google Docs connector: read it, delete the body from index 1 to end minus 1, insert the new markdown-free text, re-apply the three heading levels (title, the four section headings, "Last time"). Keep the "How to run this" section word for word. Leave the Answers section empty after acting on it. Stamp the "Updated" line with the Pacific time.

## The morning decision sprint and the evening check-out (Kev, 12 October 2026)

Kev: "Get a decision sprint bullet list set up. I can listen to it tomorrow morning and answer questions in an audio chat... just like we set up for tonight's EOD check-out. The system is working well: morning stand-up, notification monitoring through the day, and EOD autopsy."

- **Morning decision sprint.** Stand Up Tomorrow writes a section "Morning decision sprint (<Weekday D Month>)" above the Work heading every night it runs. It holds 8 to 13 items, numbered D1 and up, each in the same one-line form as the lists (question, "My pick:"), ranked by dollars, then deadline, then age. It draws on Batch rows, check-out follow-ups that need a yes, drafts waiting on Kev's send, `qc/pending`, the Desks' open cards and anything Radar set up overnight. It replaces the previous sprint or check-out section, and the opening line names the trigger phrase "run my decision sprint". Kev listens on the drive in (6:35) and answers in his "Radar's chat" voice session; answers land under Answers like everything else.
- **Evening check-out.** The check-out routine writes "Tonight: check-out (<date>)" the same way, as C-items, with the trigger "run my check-out".
- **Sweeps keep these sections.** When a sweep rewrites the doc (step 6 above), it copies the sprint or check-out section through unchanged until its items are answered. From the 11:00 sweep onward, unanswered D-items fold into the Work list and the section is dropped. Answered items are acted on per step 1.

## "Radar wants to talk"

Send one push notification (PushNotification, or the routine's own push where the trigger has it) when, during work hours (Monday to Friday, 7:00 to 5:30 Pacific), the Work list has three or more items or any item older than one working day, and no alert was sent in the last three hours. Outside work hours only for a TODAY item. Never on Saturday. Text: "Radar wants to talk: <n> decisions, oldest <age>. Open Claude, voice, say 'Radar, what do you need from me?'" Record each alert on the sweep's ledger row so the three-hour rule holds.

## The phone line (phase 2, not built)

Kev keeps his Google Voice number and forwards it to a Radar phone line when that line exists (decision 11 Oct). Google Voice has no calling API, so the line itself would be an ElevenLabs voice agent on a Twilio number, reading this same doc and writing answers back. It is spend, so it goes through QC, and it waits until the voice walk-through has stuck for two weeks. Kev also runs CloudTalk VOIP for Eden and wants Radar able to answer his incoming calls there: check with Matias (CloudTalk) whether CloudTalk can hand calls to an AI voice agent or forward unanswered calls to the Radar line, before buying anything new.

## Quick ways in

- A Stream Deck key on the Mac that opens straight into a voice message to Radar (Kev, 11 Oct). Build it when he is at the desk: open the Claude app to the Radar project and start voice, or a Wispr Flow push-to-talk into the Radar chat if voice mode cannot be scripted.
- The Clicks Communicator (order CT261381270, Onyx) when it arrives: Claude app, the Radar project pinned, voice one tap away.
