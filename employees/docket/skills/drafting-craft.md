# Drafting craft: the rules Docket applies as editor and builder

For important documents only (Kev, 21 October 2026): client and fee agreements, SOWs, contractor and commission paper, notes, leases, and anything Kev will sign. Two masters set the standard. Kenneth A. Adams, *A Manual of Style for Contract Drafting*, 5th edition (ABA, February 2023), covers how each sentence should be worded. Tina L. Stark and Monica Llorente, *Drafting Contracts: How and Why Lawyers Do What They Do*, 3rd edition (Aspen, 2024), covers how the deal becomes clauses. Garner's plain-English rules in `memory/seed/drafting-standards.md` still apply. Where this file is stricter, this file wins.

## 1. Translate the deal before writing a word (Stark)

List the business deal in plain bullets, then give each term one contract concept. Every sentence in the draft should be traceable to one of these:

| Concept | What it does | Eden example |
|---|---|---|
| Representation | A statement of fact at signing; allocates the risk that it is false | Client states the role is open and funded |
| Covenant | A promise to act or not act | Client shall pay each invoice within 30 days after the invoice date |
| Condition | An event that must happen before a duty arises | The Fee is earned only if the Candidate starts work |
| Discretionary authority | A choice a party may make | Eden may replace a Candidate once during the Guarantee Period |
| Declaration | Definitions and policies that frame the rest | "Start Date" means the first day the Candidate performs paid work for Client |

Then ask Stark's question for each one: what is the remedy if it fails? A covenant breach gives damages. A false representation can give damages or rescission. A failed condition means the duty never arises. Write the remedy, do not leave it to default law.

## 2. Word each sentence by its category (Adams)

Adams sorts contract language into categories: agreement, performance, obligation, discretion, prohibition, policy, declaration, intention and recommendation, plus conditions (MSCD5, per adamsdrafting.com summaries; LIKELY, the book itself was not read this session).

- **Obligation of a party:** "shall", and only there. The test is to swap in "has a duty to". If it does not read right, "shall" is wrong. Wrong: "This Agreement shall be governed by Washington law." Right: "Washington law governs this Agreement" (policy).
- **Obligation on a non-party, or a condition:** "must". "To be eligible for the Fee, the Candidate must start work by 31 March 2027."
- **Discretion:** "may". **Prohibition:** "shall not". Negating one category does not create another: "Eden is not required to" does not mean "Eden may not".
- **Policy and declaration:** present tense. "The Guarantee Period is 90 days after the Start Date."
- **House rule (supersedes the "will" example in drafting standards):** in documents Eden builds, obligations use "shall" under the test above, and "will" is used only for future facts. Do not rewrite the other side's draft for this alone; pushback is a budget.

## 3. Statements of fact (Adams vs Stark)

Adams prefers "states" to "represents and warrants" and wants remedies addressed directly. Stark keeps the two words for their distinct legal effects. The house position: in Eden's own client and contractor paper, use "states" and write the remedy. In a counterparty's draft, or anything M&A-like, leave "represents and warrants" alone. CONTESTED among drafters; low stakes either way if the remedy is written.

## 4. Kill uncertain meaning

Adams separates ambiguity, where words have two possible readings, from vagueness, where a standard has no precise edge. Ambiguity is always a defect. Vagueness is sometimes deliberate. Know which one you are looking at.

- **Lists and modifiers.** *O'Connor v. Oakhurst Dairy* (1st Cir., March 2017) turned on a missing serial comma in a Maine overtime exemption; the dairy settled for $5 million (Bloomberg Law, 9 February 2018). SETTLED. Use the serial comma, repeat the article or preposition, and break a list into enumerated items when any item has its own modifier.
- **Commas in exit clauses.** CRTC Telecom Decision 2006-45 read a comma in a Rogers–Aliant pole agreement to allow termination on one year's notice inside a five-year term. SETTLED. Write a termination right as its own sentence: who may end it, how much notice, and from when.
- **Efforts.** Use only "reasonable efforts", defined in the contract, never undefined "best efforts". Adams's position, LIKELY. How courts read efforts clauses differs by state: CONTESTED.
- **"Material", "reasonable", "promptly".** Give each one a number, a date or a test, unless vagueness is the deliberate choice. If it is, say so in the review.
- **Time.** "Within 30 days after the invoice date" (the day of the event does not count). "On or before 31 March 2027", never "by", "from" or "until" alone. Define Business Day and name the time zone.
- **Defined terms.** Each defined term is used, each capitalised term is defined, and one term means one thing. Audit both directions on every pass.

## 5. Money clauses are tables

Amount, base (salary only, or total first-year compensation), trigger, invoice date, due date, late interest, refund or credit, and who decides each disputed fact. Every figure goes through the numbers gate (`numbers-gate.md`). Write the base precisely. On a $250,000 base salary with a $75,000 target bonus, "first-year compensation" could mean either $250,000 or $325,000.

## 6. Spend negotiation where disputes actually happen

World Commerce & Contracting, *Most Negotiated Terms 2024*: limitation of liability, price and indemnification top the negotiated list, yet only 16% of negotiators think they negotiate the right things, and disputes come mostly from scope and performance (LIKELY). So for Eden, spend pushback first on scope, acceptance, fee trigger, payment timing and guarantee. Then indemnity and caps.

## 7. Recruiting and staffing specifics

- **Conversion and no-hire fees** are liquidated damages. They hold up only when the harm is hard to measure at signing and the fee is a reasonable forecast, not a penalty. Some states cap or ban them by statute. CONTESTED; check the governing state every time.
- **Washington, ESHB 1155** (Chapter 149, Laws of 2026, effective 30 June 2027): all noncompetes are void, including existing ones. Forfeit-or-repay clauses that turn on working elsewhere count as noncompetes. Customer non-solicits survive only for customers the worker dealt with directly, and only up to 18 months. Employers must notify affected workers by 1 October 2027. Until then, RCW 49.62's 2026 thresholds apply: $126,858.83 for employees and $317,147.09 for contractors (L&I). SETTLED. Whether it reaches business-to-business no-hire clauses is unverified.
- **Wyoming, W.S. 1-23-108** (effective 1 July 2025): noncompetes are void, with exceptions for sale of a business, trade secrets, relocation and training-cost recovery, and executive and management personnel. LIKELY, from the enrolled act listing and law-firm summaries.

## 8. The editor's pass (in this order, every important document)

1. Concept map (section 1), and the gaps it shows.
2. Money and triggers table (section 5), sent to the gate.
3. Sentence-by-sentence category check (section 2).
4. Uncertain-meaning hunt (section 4) and the ambiguity word list in drafting standards.
5. Defined-term audit and cross-reference check.
6. Two-reader test: a hostile reader and a judge who never met either party each read the money clauses. Where they disagree, redraft.
7. Verdict and redlines per `contract-review.md`: MUST, SHOULD, NICE.

When building from scratch, use this order: deal bullets, concept map, definitions, operative terms, money table, exit, risk allocation, boilerplate. Then run the editor's pass on your own draft.
