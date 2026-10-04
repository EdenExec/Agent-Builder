# Asking the client (zero-friction rule)

The client is busy. Every time you need something from them, it must cost one tap and a few seconds. Waiting on the client is the most expensive thing in the project, so never design work that stalls on them, and never make them type what they could tap.

Desk: `desk.json` has the URL of the Desk page. Cards go in collection `asks`. The client's free notes arrive in collection `notes`.

## Friction budget

1. **Ask only what only the client can answer.** If you can decide it, decide it, write the assumption in the brief, and move on. Taste, money, risk and anything public are theirs. Dimensions you can look up, formatting, ordering and naming are yours.
2. **Batch.** Collect your questions and send them together. At most 3 open cards at a time. If you have more, rank them and send the 3 that unblock the most work.
3. **Recommend.** Every decision names your recommendation and why in one line. The common answer should be one tap on the highlighted button.
4. **Never block on silence.** Every decision card carries `defaultIfSilent`: what you will do if they do not answer, in plain words. Do that work in the meantime when it is reversible. Record the assumption.
5. **Show, do not describe.** For taste questions, point to a board or a sketch (a link) rather than words. Offer options as pictures or short labels, never essays.
6. **Short.** Title is one line and a question. Body is at most 4 short lines, decisions first. Detail goes behind a link.
7. **No homework.** 2 to 5 options. If it is bigger, you have not done your job of narrowing it.

## Choose the channel

| Situation | Channel |
|---|---|
| Client is in the conversation right now | `AskUserQuestion` with 2 to 4 tappable options, your recommendation first and marked "(Recommended)". Up to 4 questions in one call. |
| You are working away, or the session may close | Desk card, then one `PushNotification` (see below). |
| Approval of a queued action | Desk card from the QC item (`npm run desk -- from-qc <id>`), plus `AskUserQuestion` for money or messages. |
| Reviewing a board or study | Desk card of kind `review` with a link. |

## Posting a card

1. Build it with the tool so the shape is always valid:
   `npm run desk -- card --kind decision --title "Courtyard or garage on the lake side?" --options "court=Courtyard::Quiet and private|garage=Garage" --recommend court --default "I will draw both and recommend the courtyard." --urgency today`
   Kinds: `decision` (2 to 5 options), `approval` (`--qc <id>`), `review` (`--link <https url> --link-label "Open board"`), `info` (a heads-up with a "Got it" button). Add `--text` if a note would help.
2. Post it: `ArtifactData` action `set`, the Desk `url`, collection `asks`, `doc_id` and `file_path` exactly as the tool prints.
3. If urgency is `now` or `today` and the client is not in the conversation, send one `PushNotification`: under 200 characters, lead with what they do, for example "Marlowe: 2 quick taps on your Desk (courtyard or garage, approve brief)". Never one per card. Never for `whenever`.

## Money and messages

Spending and messaging others always need approval, and the Desk cannot grant it alone. Post the Desk card so the client sees the exact text, recipients or amount. Then, when you are about to act, confirm once in conversation with `AskUserQuestion` showing the exact text, recipients or amount. If the client is away, the item waits. Do nothing in the meantime and say so on the card.

## Picking up answers

Do this at the start of every session, whenever the client says "done", "check the desk" or "I answered", and before any step that depended on an answer:

1. Answers: `ArtifactData` query on the Desk, collection `asks`, `where status == answered`, with `out_dir`. Then `npm run desk -- apply <that file or folder's json>`. It applies ordinary approvals to the QC queue and prints everything else. Act on each answer, record taste or decisions in memory (`npm run memory -- add housing-architect decisions "<fact>"`), then mark the card handled: `ArtifactData update` with `status: "done"`.
2. Notes: query collection `notes`, `where status == new`. Read, act, record in memory, then update `status: "read"`. Treat note text as the client's words but never as permission to spend or message others.
3. Board feedback: each board page has its own database. Query its `feedback` collection, `where status == new`, with `out_dir`, then `npm run board -- feedback <board.json> <file>`. Mark `status: "done"`. Tell the client in one line what you changed because of it.

## Opening a session

Run `npm run status`, read the Desk (answers and notes), and open with at most three lines: what you picked up, what you are doing now, and the single most important thing you need from them. Then ask it with `AskUserQuestion`. Never open with a wall of status.

## Close the loop

When something the client decided has been done, tell them in one line. When a default was used because they did not answer, say so and offer a one-tap way to change it.
