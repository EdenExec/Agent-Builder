# Crelate tagging standard

Seeded 11 October 2026 from the 14 July 2026 team meeting, the written tagging SOP and the Eden App blueprint. Where the meeting changed the written SOP, the meeting wins, because it is newer. Points the team left open are marked "open".

## Bottom line

1. **Tags are Eden's data model inside Crelate.** The Crelate API does not support custom picklist fields, so every bucket level (time zone, market, book, sector, company type, title) is stored as a tag, and the app reads records by tag [App §2.4; App §5.1].
2. **On 14 July the rule became: broad, few, and one spelling each.** Pick one canonical name per concept and merge the variants into it. Put niche detail in project specialty tags or the pinned note, not in the top-level tags [Tag mtg @00:59; @04:48; @12:04].
3. **The trigger was an AI tagging job.** Claude was tagging candidate profiles by job bucket in Crelate. It cannot create tags while it works, so it stopped on 38 subcontractors because no "sub" tag existed. A fixed tag list lets the AI do all the tagging [Tag mtg @02:01; @02:34].
4. **Search behaviour drives the design.** Nick says Crelate's tag search ANDs tags, so each extra tag narrows the result. Kevin thinks OR is possible. This was not settled [Tag mtg @04:48-06:38].
5. **Location is now three separate tags: city, state, time zone.** Airport codes were rejected for now [Tag mtg @13:31; @16:00].

## Sources

| Key | Source |
|---|---|
| Tag mtg @mm:ss | Plaud "07-14 Weekly Meeting: Standardizing CRM Tagging System & Candidate Gerritsen Update" (`of_e6cd00d07396f3b409e8c69fa23f3c59`), 14 Jul 2026, 25 min. Speakers: Kevin (Kev), Nick, Speaker 1, Speaker 4, Speaker 5. Tagging runs 00:05-19:35. From 20:00 on, the talk is unrelated chat and a candidate offer update; that part is not used here. |
| Plaud summary | Plaud's auto summary note for the same recording (AI-written; used only to confirm the decisions) |
| Tag SOP §n | "EPG - Playbook - Crelate Tagging SOPs" (Google Doc `10piWHfIzD1q-cVVYNiu396BCJwQDY8cGTORT31vKqjQ`, Dec 2025; the .docx copy `1LdUtRQsD6aVuzlsn8dsmddJxzLpIqyaG`, May 2026, has the same text). This is "the tagging guide" Kevin refers to at @09:18. |
| App §n | Google Doc "Eden App" (`1Uw-iPrwY3CxRmSHl8MK7V_J4GI6Q0iDc8rCQFxIusc0`) |
| Brief | `projects/eden-crm/brief.md`, 11 Oct 2026 |

## 1. Why tags, and why standardise

| Reason | Source |
|---|---|
| The Crelate API does not support custom picklist fields. Tags are fully supported, so picklist values map to tags and "the application can handle the translation between UI and Crelate's tag schema" | [App §5.1 table] |
| Each bucket level ("Pacific" time zone, "Spokane" market, "Mechanical" company type) is a unique tag, and the bucket pages pull records by tag | [App §2.4] |
| Duplicates force multi-clicking. Kevin: "If I am looking for a field ops manager... they might be field operations manager or they might be FOM... There is like four different things it could be." Nick: "I want to click on one thing." | [Tag mtg @10:00-10:24] |
| Example of the mess: "electrical, electrical firm, electrical contractor, electrical misspelled contactor" | [Tag mtg @02:50] |
| Location mess: "We have like twenty six tags for just Miami." | [Tag mtg @14:10] |
| AI tagging needs a closed list: "Claude can do all the tagging, but it can't create tags while it's working. So we just need to have like a set format." | [Tag mtg @02:34] |
| Most users pick from the existing list: "everybody except for me and you has to put in their own tags... they have to click from what box" (Nick to Kevin) | [Tag mtg @09:03] |
| The SOP's purpose line: "ensure our data is clean, searchable, and valuable" | [Tag SOP, intro] |
| Kev wants the tagging system kept in the new CRM ("book, sector, company type, referrals and more") | [Brief #8] |

## 2. The standard, category by category

### 2.1 Book of business (top level)

| Rule | Source |
|---|---|
| Every candidate gets one primary book | [Tag SOP §1] |
| Values: **Construction, Oil and Gas, Development**. The list grows with new verticals (e.g. Healthcare, Technology) | [Tag SOP §1] |
| Unchanged on 14 Jul: "So instruction book stays" (the transcription most likely means "construction book stays"; not confirmed) | [Tag mtg @00:05] |
| Why the top is broad: "so that as we get into different books, then we can just divide books by one thing which is construction, finance or health... and you'll never have crossover" (Kevin) | [Tag mtg @07:53] |
| The App doc also names Oil & Gas, healthcare and finance books, each with its own market lists | [App, Page Examples] |

### 2.2 Sector (market the company serves)

| Item | Detail | Source |
|---|---|---|
| 14 Jul list (Nick) | **Mixed Use** (two words, capital U), **Multifamily** (one word), **Commercial**, **Mission Critical**, **Industrial** (not "Light Industrial"), **Civil**, **Environmental** (proposed, "Yeah"), **Public Works** ("all that civic stuff"), **Education** | [Tag mtg @00:05; @00:59] |
| Discussed, outcome unclear | Life Sciences, Institutional | [Tag mtg @00:59; Plaud summary] |
| Removed or folded in | Casinos ("take that out"). Cold Storage goes under Industrial | [Tag mtg @07:06; @07:14] |
| Rule | Keep sectors broad. Niche detail goes in the person's project specialty: "when you go to filter tags, like the broader the better. And then down below, you can assess the lead based off of like the specific tag" | [Tag mtg @00:59] |
| Open | Kevin: "I think sector. We might need to go a little bit wider than what you guys are thinking" and "sector is gonna get wider and wider" (e.g. higher education). No final list was read back | [Tag mtg @04:38; @06:45] |
| Older SOP list (superseded where it conflicts) | Commercial, High Tech, Engineering, Owner Builder Development, Public Works, Energy (O&G), Infrastructure (O&G) | [Tag SOP §2] |
| App examples | Insurance, Oil and Gas | [App §2.4] |

### 2.3 Company type

| Item | Detail | Source |
|---|---|---|
| Rule | One plain word per trade. No "contractor", "firm" or "sub" suffix variants: "I would just do electrical mechanical." "If you want to put contractor, that's fine, but we got to get like one for everything." | [Tag mtg @01:56; @03:16] |
| GC | Just **GC**: "we should stop putting in the type of GC". Industrial work is tagged in project scope, not as an "industrial GC" | [Tag mtg @00:59; @03:45] |
| 14 Jul list (Nick) | **GC, Mechanical, Electrical, Drywall, Concrete, Civil, Owner Builder (OBD, "owner builder developer"), CM, Owner's Rep, Architect's firm** | [Tag mtg @00:59; @03:16; @04:06] |
| Folding | Wastewater goes under Civil ("that can just be a civil contractor") | [Tag mtg @04:06] |
| Existing tags seen | architect, Interiors, drywall, heavy civil, "mechanical sub", "electrical sub", "electrical contractor" | [Tag mtg @02:01; @02:33; @03:45] |
| Open | A generic **Sub** tag. Its absence started the meeting (38 profiles), but no explicit decision to create one is recorded | [Tag mtg @02:01] |
| Older SOP (superseded) | "Be specific about the type of firm", e.g. Commercial GC, Tech-Focused GC, Electrical Firm, Drywall Firm. Multiple company-type tags allowed when experience spans types | [Tag SOP §3] |
| App bucket mockup tree | GCs: commercial, high-tech, public, civil, water. Subs: structural, MEP, Electrical, Interiors. Developers: mixed-use, office, emerging. Consultants: Owners Reps, CMs, Designers | [App mockup: Buckets] |

### 2.4 Title / role

| Item | Detail | Source |
|---|---|---|
| Rule | Low specificity: "we don't need 'traveling superintendent'... We don't need 'senior superintendent.'" | [Tag mtg @08:14] |
| 14 Jul list | **Superintendent, General Superintendent, Project Manager, PX, APM, PE, Estimator**. Plain "Estimator", not "concrete estimator" | [Tag mtg @08:14] |
| Broad role categories | At least one broad category on every person, e.g. **Project Management** and **Field Operations**. Kevin: "So then it's just book, sector, company, division and its field ops or project management ops." | [Tag mtg @11:43; @11:59; @12:41] |
| Multiple tags allowed | "You can tag as multiple things... but you have to have one of the ones that's going to be in the broad category" | [Tag mtg @11:43] |
| Style | Kevin: "I would go as shorthand as possible" and "move as fast as you possibly can" | [Tag mtg @08:57; @11:01] |
| Seniority | Kevin would split PM and Senior PM "but we don't have to". Nick: "one team's senior PM is not another team's senior PM", and price places people in the market. The Plaud summary records seniority as profile and note detail, not a tag | [Tag mtg @11:14-11:22; Plaud summary] |
| Preferences go in notes | A candidate's specific "go now" role belongs in a note, findable from the MPC tickler, not in tags | [Tag mtg @12:04-12:21] |
| Open | Field ops naming (FOM, Field Ops Manager, Field Operations Manager, General Superintendent) was talked through but no single name was recorded. Acronym vs full name and capitalisation (Speaker 1: "do we always opt for acronyms?") were not formally settled | [Tag mtg @08:41; @10:35-10:52] |
| Older SOP (superseded on style) | "Use the full title, e.g., Senior Project Manager. DON'T use abbreviations, e.g., Senior PM, SR.PM, or SPM." Periodic merges | [Tag SOP §4] |
| App bucket titles | Field Operations, Project Management, Engineering, Sales | [App §2.4] |

### 2.5 Contact method / verification

| Item | Detail | Source |
|---|---|---|
| 14 Jul | Three tags only: **phone**, **email**, and one for broken contact details. Nick: "phone verified we have like ten of them, just put phone... Those are the only two ways we communicate". Kevin: "Phone, email, or broken... broke, fixed or whatever, I don't care what it is... There should only be three in there." | [Tag mtg @12:48-12:57] |
| Exact spelling of the broken tag | Not stated | |
| Older SOP | "Verified Phone", only if you personally spoke with the candidate and confirmed the number is live. Workaround: search for anyone with an RP, MP or similar activity | [Tag SOP §5] |

### 2.6 Grade (internal)

| Item | Detail | Source |
|---|---|---|
| Who uses it | Internal only: "grade is for us. The guys don't use grades" | [Tag mtg @12:57] |
| Why | "You should be able to sort MPCs by A plus and be like, why aren't we running marketing campaigns on this?" | [Tag mtg @12:57] |
| Scale | Only "A plus" is mentioned. The full scale is not stated | |

### 2.7 Location and time zone

| Item | Detail | Source |
|---|---|---|
| 14 Jul rule | **Three separate tags: city, state, time zone.** "You got to tag three different times." | [Tag mtg @13:31] |
| Time zone values | Proposed: **PST, MST, CST, EST**. "We don't need a thousand different tags for every city that's in that time zone." Lets you search a whole time zone, or a whole state such as Florida, without picking dozens of cities | [Tag mtg @13:57-14:21] |
| City | The nearest metro area with an airport. E.g. a candidate in Okeechobee gets Orlando, optionally plus Okeechobee | [Tag mtg @14:40] |
| Which location | "Time zone location should be where they live or where they would live" | [Tag mtg @18:06] |
| Rejected for now | Airport codes (Kevin likes them; others don't know the codes): "table airports, cool idea when you are running an education book, but not right now" | [Tag mtg @13:20; @14:55-16:00] |
| Rejected | Combined comma tags: "We also can't do the comma uh time zone because it gets all messed up" | [Tag mtg @13:31] |
| Older SOP (superseded) | At least one location tag and one time zone tag. "City, ST" for the US, "City, Country" abroad. Examples Phoenix, AZ, DFW, ATX, Portland, OR. Time zones Pacific, Mountain, Central. Merge redundant tags (PDX into Portland, OR) | [Tag SOP §6] |
| Build idea | A widget where you type a city and it fills in the nearest airport or metro. Kevin: "That'd be a widget we need to build and add in the future." | [Tag mtg @16:21-16:34] |
| App bucket labels | Pacific, Mountain, Central, Eastern | [App §2.4] |

### 2.8 Desired location, relo, traveler (general tags)

| Item | Detail | Source |
|---|---|---|
| Desired location | If a candidate wants to move (e.g. to New York), add the New York location tags **and** "relo" | [Tag mtg @17:19] |
| relo, traveler | Go in general tags. Spelling seen: "relo"; "traveler" / "travelers" (not settled) | [Tag mtg @17:37-17:47; @18:06] |
| Travelers | Do not tag every market they would work in: "just put 'travelers'" | [Tag mtg @17:56-18:06] |
| Older SOP | "Traveling", "Relo", "PNW" sit under Candidate Info soft skills | [Tag SOP §7] |

### 2.9 Candidate info / project specialty

| Item | Detail | Source |
|---|---|---|
| Use | The home for niche detail kept out of the broad tags ("personal project specialty") | [Tag mtg @00:59; @06:52] |
| SOP examples | Hard skills / projects: Data Centers, Giga Factories, Firehouses, Pre-con, Estimating. Soft: Project Leadership, Traveling, Relo, PNW, "Nice guy" | [Tag SOP §7] |
| General "fun" tags | Tags like "best in the biz" do nothing for search: "we don't search general tags" | [Tag mtg @05:15-05:19] |

### 2.10 Salary

| Item | Detail | Source |
|---|---|---|
| Rule | Tag the base salary **range**, using the magnifying glass to pick a preset range | [Tag mtg @18:20; Tag SOP §8] |
| Boundary | If the salary sits exactly on a boundary, tag both ranges | [Tag mtg @18:24] |
| Exact figure | Goes in the pinned note (Kevin, Speaker 1). Nick would also allow a separate exact tag "but make sure you put the range too" | [Tag mtg @18:24-18:41] |
| Base vs all-in | Base, not all-in, unless there is a guaranteed extra the candidate will not move on, and even then a note | [Tag mtg @18:46] |
| Pinned note | Nick made a template for a consolidated pinned note: "a hot reference of all the most important information" | [Tag mtg @18:46] |
| Purpose (SOP) | Sort the database by potential fee value | [Tag SOP §8] |
| Engineer rule | Salary is compensation data. The Brief says salary "never reaches the paper, the hit list or any shared sheet". Treat salary-range tags the same way in the mirror and every shared output | [Brief, Crelate API facts] |

### 2.11 Referral and other tags

| Tag | Status | Source |
|---|---|---|
| Referral | Kev lists "referrals" in the tagging system he wants kept. Neither the meeting nor the SOP defines a referral tag, its values or its use: **not stated** | [Brief #8] |
| Market (geo) | A bucket level in the App doc (e.g. Spokane, Boise, Phoenix). The 14 Jul city tag likely serves it, but that is not stated | [App §2.4] |
| Anything else | Not stated | |

## 3. How tags are applied

| Practice | Source |
|---|---|
| Broad first, specific last: "if you can be like kind of broad on the first five tags and then be like more specialized on the bottom four, that probably gets our best result" | [Tag mtg @04:48] |
| Speaker 1's view: direction does not matter so long as some tags are very broad and some very specific | [Tag mtg @07:29] |
| Apply to every candidate: book, sector, company type, title plus broad role, contact, city, state, time zone, salary range. Add desired-location and relo, traveler, specialty and grade when they apply. This order follows the SOP sections plus the 14 Jul additions | [Tag SOP §1-8; Tag mtg] |
| Tags find people. Notes describe them: "the tags are how we find these people when we're searching the CRM, and then the notes can be like 'What does this guy care about?'" | [Tag mtg @12:04] |
| Kevin's own method before the standard: look at what exists, find the commonality, "pick one and I just roll with it" | [Tag mtg @02:50] |
| AI tagging: Claude tags candidates by job bucket and can only use existing tags | [Tag mtg @02:01-02:34] |

## 4. Search behaviour (open)

| Claim | Who | Source |
|---|---|---|
| Multi-tag search is AND: "If you put mission critical and commercial and multifamily, it's not going to put people from all three. It's going to put people that only have all three." | Nick | [Tag mtg @05:38] |
| "You can't get it to the OR search." | Speaker 1 | [Tag mtg @06:01] |
| "If you add tags and you go tags or tags..." and "I think you can still do an OR." | Kevin | [Tag mtg @06:06; @06:35] |
| "I don't know how the Crelate tag search works, so it might not make any difference." | Speaker 1 | [Tag mtg @07:29] |

Engineer action: test AND/OR tag filtering against the Crelate v3 API and settle this. In the mirror, the tag browser can do either [Brief #8; Brief, Phase 2].

## 5. Clean-up and ownership

| Item | Detail | Source |
|---|---|---|
| Who cleans up | "We're just trying to tell Noah what the names are, so he can clean it up." | [Tag mtg @10:32] |
| Tagging guide | Kevin: "What we should do is then fix this document. It was the tagging guide... we'll make a poster of it... It's a scorecard thing." He assigned it as "your rock to carry"; who he was speaking to is not identified in the transcript | [Tag mtg @09:18] |
| Merges | The SOP already plans periodic merges (titles; PDX into Portland, OR) | [Tag SOP §4; §6] |
| Gaps | The Plaud summary notes no owner or timeline was set for updating the guide and cleaning the data | [Plaud summary, AI Suggestions] |
| Status today | Whether the guide was updated after 14 Jul: not stated. Both SOP copies predate the meeting (last modified 30 Dec 2025 and 12 May 2026) | [Drive metadata] |

## 6. What this means for the build

These implications are drawn from the sources above. They are not decisions Kev has made.

| Need | Basis |
|---|---|
| Keep a canonical tag vocabulary table: category, canonical name, aliases (e.g. "electrical firm", "electrical contractor", "contactor" all map to Electrical). Use it to report drift and to drive the tag browser | [Tag mtg @02:50; Brief #8] |
| Classify each Crelate tag into a category (book, sector, company type, title, broad role, contact, grade, city, state, time zone, relo/traveler, specialty, salary range, general). The bucket pages and Scout's lead tooling depend on it | [App §2.4; Tag SOP] |
| Flag records that are missing a required category, e.g. no time zone or no book | [Tag SOP §1; §6] |
| City-to-metro, state and time zone helper (Kevin's "widget") | [Tag mtg @16:34] |
| Treat salary-range tags as compensation: never in shared outputs. Never mirror EEO fields | [Brief, Crelate API facts] |
| Do not create tags through the API without Kev's approved list: the whole point is a closed vocabulary | [Tag mtg @02:34] |

## 7. Open questions for Kev or Nick

1. What is the final sector list? Are Environmental, Life Sciences and Institutional in, and how wide does Kevin want it?
2. Is there a generic **Sub** tag, and do "mechanical sub" and "electrical sub" merge into Mechanical and Electrical?
3. What is the one canonical field-ops title? Acronyms or full names, and which capitalisation?
4. What is the exact spelling of the time zone tags (PST/MST/CST/EST, or Pacific/Mountain/Central/Eastern as the App and SOP use)?
5. What is the broken-contact tag called, and what is the grade scale?
6. What is a referral tag, and what are its values?
7. Was the tagging guide updated after 14 Jul? Where is the current version?
