---
title: IP Assignment for Agent Playbooks, Prompts and Outputs
org: epg
author: Docket (contracts and risk analyst; not a licensed attorney)
date: 29 October 2026
ticket: t-202610291950-kdrv
status: analysis and draft for Kev; nothing sent, signed or filed
gate: none needed yet (the clause carries no fee, rate or total; bracketed day counts are Kev's to set and go to Tally if a dollar figure is added)
---

# Verdict: FIX FIRST. No IP assignment exists in any agreement I could read. NEEDS COUNSEL before roll-out.

## Result first

1. **The clause is missing.** No signed recruiter or contractor agreement is in the repo. The two drafts that are here (the intern offer letters of 23 Oct and the comms intern memo of 27 Oct) point to a separate confidentiality agreement and have no IP assignment. **The Drive copies are not checked:** no Drive tool was available to me this session. Radar or Kev to pull them (list below).
2. **Without paper, contractors own what they build.** A 1099 recruiter, the Eden Brain contractor or the creative agency owns the copyright in what they write until they sign an assignment (17 USC 201(b), 204(a)). Eden holds at most an implied, non-exclusive licence. Moving files to an Eden Shared Drive does not change who owns them.
3. **Agent outputs need a second lock.** Purely AI-generated output may have no copyright at all (*Thaler*, cert. denied 2 Mar 2026). So the clause makes outputs Eden's **confidential property by contract**, not only by copyright, and requires work to live in Eden accounts.

## What I checked

| Document | Where | IP assignment? |
|---|---|---|
| Sales Intern offer letter and Commission Plan (draft) | `projects/workforce/boise-internships/docket-1099-and-offer-letters-2026-10-23.md` | No. s.9 refers to a separate Confidentiality and Non-Solicitation Agreement, not yet drafted |
| Ops / Client Success / Marketing Intern offer letter (draft) | same file | No. s.8 refers to a Confidentiality Agreement, not yet drafted |
| Comms Intern legal memo | `projects/comms/intern-legal-and-pay.md` s.4 | Recommends one (work made for hire plus assignment); no wording drafted |
| Eden Staffing agreement (client paper) | `projects/eden-staffing/legal/01-staffing-services-agreement.md` | Not relevant: client-facing |
| 1099 recruiter agreements, W-9s | Drive (per legal map: "status unknown") | **Unverified: not read** |
| Eden Brain (AI platform) contractor agreement | Drive, if any | **Unverified: not read. Highest exposure** |
| Finance contractor, creative agency, split partner | Drive, if any | **Unverified: not read** |
| Founder assignment from Kev to the entity | none found | Missing |

**Ask for Radar:** pull from Drive every signed contractor, recruiter, employee and agency agreement and the Gusto offer letters, and drop them in one folder for me. I will mark each one in this table.

## The law that decides it

| Point | Rule | Grade |
|---|---|---|
| Employees | Work an employee makes within the scope of the job is a work made for hire, owned by the employer (17 USC 101(1), 201(b)). Who is an "employee" uses the common-law agency test (*CCNV v. Reid*, 490 U.S. 730, 1989) | SETTLED |
| Contractors | Contractor work is for hire only if it falls in one of nine listed categories **and** both sign a writing saying so (17 USC 101(2)). Playbooks, prompts, code and recruiting templates mostly fall outside the nine. A signed assignment is the only reliable route (17 USC 204(a)) | SETTLED |
| No paper | The commissioning party gets an implied, non-exclusive licence at most; the creator keeps ownership and can licence the same work to a competitor (*Effects Associates v. Cohen*, 908 F.2d 555, 9th Cir. 1990; covers WA, OR, ID) | SETTLED |
| "Hereby assigns" | "Agree to assign" is a promise; "hereby assign" transfers future rights on creation. The difference decided *Stanford v. Roche*, 563 U.S. 776 (2011) (patents; the drafting rule carries over) | SETTLED |
| AI outputs | Copyright needs a human author (*Thaler v. Perlmutter*, D.C. Cir. 18 Mar 2025; cert. denied 2 Mar 2026, No. 25-449). Copyright Office, *Copyright and AI, Part 2* (29 Jan 2025): prompts alone do not make the user the author of the output; human selection, arrangement and edits can be protected | SETTLED (rule); case-by-case in application |
| Human-written playbooks | A playbook or rules file a person writes is an ordinary literary work, so it is copyrightable and assignable. The AI-written parts may not be | LIKELY |
| Claude account terms | Consumer terms (eff. 8 Oct 2025): Anthropic assigns "all of our right, title, and interest, if any, in Outputs" **to the user**. Commercial terms (eff. 17 Jun 2025): the **customer** owns Outputs. So on a personal account the recruiter holds the rights; on an Eden plan, Eden does. Our clause catches both | SETTLED (text read 29 Oct 2026) |
| Washington employees | An invention-assignment clause cannot reach inventions made entirely on the employee's own time, without employer equipment or trade secrets, unless they relate to the employer's business or result from the employee's work for it. Written notice of that limit is required when the agreement is made (RCW 49.44.140(1), (3)) | SETTLED |
| California (if any worker sits there) | A signed work-made-for-hire clause makes the contractor an **employee** for comp and unemployment (Cal. Lab. Code 3351.5(c)). Labor Code 2870 sets a notice similar to Washington's | SETTLED (3351.5(c), read 29 Oct); LIKELY (2870, not re-read) |
| Idaho, Oregon | No invention-assignment limit statute found | UNSURE (not verified) |
| Trade-secret notice | Any agreement governing confidential information with an employee, contractor or consultant must give the whistleblower immunity notice, or Eden loses exemplary damages and fees against that person (18 USC 1833(b)(3), (4)) | SETTLED |
| Existing workers signing now | Washington required fresh consideration for a non-compete signed mid-employment (*Labriola v. Pollard Group*, 152 Wn.2d 828, 2004). Whether that reaches a stand-alone IP assignment is open | UNSURE: give real consideration anyway |

## Top three issues, ranked

| # | Issue | What it costs if it goes wrong |
|---|---|---|
| 1 | **Eden Brain contractor** has no assignment I can see | The contractor could own the platform code and agent framework, licence it to a competitor, or block a sale or investor diligence. Highest dollar exposure |
| 2 | **1099 recruiters** build playbooks and outputs with no assignment, often in personal Claude and Google accounts | A departing recruiter keeps the desk's playbooks, sourcing lists and prompts lawfully and runs them for a rival. Eden can't stop it on copyright alone |
| 3 | **No founder assignment** from Kev to the entity, and the owner entity is unnamed | The agents Kev built may belong to Kev personally, or to the wrong entity (the GitHub org is `edenexec`; recruiting paper says Eden Partner Group). This is the first thing an investor's lawyer asks for |

**Inversion (what would kill this):** the paper is perfect but the files live in personal accounts, so nobody can retrieve them. Hence s.6 of the clause (Eden Systems only) and Casey's Shared Drive. Paper and storage are both needed.

<!-- pagebreak -->

## The draft clause

Built to drop into any recruiter, contractor or employee agreement as a section, or to sign alone as an **IP Assignment and Confidentiality Agreement** (the faster route for people already working). Brackets are choices for Kev or counsel. The language follows Adams's categories: "shall" for obligations, "hereby assigns" for the transfer, defined terms capitalised and used one way.

> **[X]. Work Product and Intellectual Property**
>
> **[X].1 Definitions.** In this section:
>
> (a) **"Eden"** means [Eden Partner Group LLC, a Wyoming limited liability company]. **"Eden Affiliate"** means any entity that controls, is controlled by or is under common control with Eden, including [Eden Executive Search Inc.].
>
> (b) **"Engagement Period"** means the period that starts on the first day the Worker performed any services for Eden or an Eden Affiliate, whether before or after the date of this agreement, and ends on the last day the Worker performs services for Eden.
>
> (c) **"AI Tool"** means any artificial-intelligence model, assistant, agent or platform, including Claude, ChatGPT and Gemini, whether used through an Eden account or a personal account.
>
> (d) **"Output"** means any text, code, data, image, audio or other material that an AI Tool generates from an input given by or for the Worker.
>
> (e) **"Agent Materials"** means any prompt, system prompt, playbook, rules file (including any RULES.md or CLAUDE.md file), skill, instruction set, memory file, project knowledge, template, workflow, evaluation set or scheduled-task configuration that directs an AI Tool, and every Output.
>
> (f) **"Work Product"** means all material the Worker creates during the Engagement Period, alone or with others and with or without an AI Tool, that (i) results from services for Eden or an Eden Affiliate, (ii) uses Eden's equipment, accounts, data or Confidential Information, or (iii) relates to the business of Eden or an Eden Affiliate in recruiting, executive search or staffing. Work Product includes Agent Materials, documents, scripts, sourcing lists, candidate and client records, data compilations, software, code, automations, and every draft and version of each.
>
> (g) **"Intellectual Property Rights"** means copyrights, trade-secret rights, patent rights, database rights, moral rights, rights in confidential information and every similar right anywhere in the world, with all registrations, applications, renewals and claims for past infringement.
>
> (h) **"Eden Systems"** means Eden's Google Workspace and Shared Drives, Eden-provided AI Tool accounts, Eden's CRM and Eden's code repositories.
>
> **[X].2 Ownership.** As between Eden and the Worker, Eden owns all Work Product and all Intellectual Property Rights in it from the moment of creation.
>
> **[X].3 Work made for hire.** *[Employee version only; delete for contractors.]* Work Product that qualifies is a work made for hire for Eden under 17 U.S.C. 101.
>
> **[X].4 Assignment.** The Worker hereby assigns to Eden all of the Worker's right, title and interest in and to the Work Product and all Intellectual Property Rights in it, including Work Product created before the date of this agreement and any rights in Outputs that an AI Tool provider assigned to the Worker. To the extent any right cannot be assigned, the Worker hereby grants Eden an exclusive, perpetual, irrevocable, worldwide, royalty-free licence of that right, with the right to sublicense, and shall not assert it against Eden, an Eden Affiliate or their licensees.
>
> **[X].5 Material without copyright.** Eden's ownership of Work Product does not depend on whether copyright or another Intellectual Property Right protects it. Any Work Product that no such right protects is Eden's Confidential Information and Eden's property as between the parties, and the Worker shall not use, copy or disclose it except to perform services for Eden.
>
> **[X].6 Eden Systems.** The Worker shall create and keep Work Product, including Agent Materials, only in Eden Systems. If Eden approves in writing the use of a personal account, the Worker shall (a) copy all Agent Materials from that account into Eden Systems at least [weekly], (b) enter no candidate personal data into that account unless the approval names it, and (c) on the last day of the Engagement Period, deliver all Work Product to Eden and permanently delete every copy outside Eden Systems, and confirm the deletion in writing within [5] business days.
>
> **[X].7 Pre-existing Materials.** Schedule A lists all material the Worker created before the Engagement Period that the Worker may use for Eden ("**Pre-existing Materials**"). The Worker keeps ownership of them. If the Worker uses any Pre-existing Material in Work Product, the Worker hereby grants Eden a non-exclusive, perpetual, irrevocable, worldwide, royalty-free, transferable licence to use, copy, modify and sublicense it as part of that Work Product. If Schedule A is blank, the Worker represents that there is none.
>
> **[X].8 General skills.** Nothing in this section assigns or restricts the Worker's general skills, knowledge and experience, including general know-how in using AI Tools, so long as the Worker uses no Work Product or Confidential Information.
>
> **[X].9 Moral rights.** To the extent permitted by law, the Worker waives, and shall not assert, any moral right or right of attribution in Work Product.
>
> **[X].10 Further steps.** During and after the Engagement Period, the Worker shall sign any document Eden reasonably requests to record or perfect Eden's rights, at Eden's expense. If the Worker does not sign within [10] business days of a written request, the Worker appoints Eden as the Worker's attorney-in-fact, coupled with an interest, solely to sign that document.
>
> **[X].11 Notices.** *[Washington employees]* Exhibit 1 is the notice required by RCW 49.44.140(3); this section does not apply to an invention described in RCW 49.44.140(1). *[California employees: add the Labor Code 2870 notice.]* *[All workers]* Exhibit 2 is the immunity notice under 18 U.S.C. 1833(b).
>
> **[X].12 Survival.** This section survives the end of the Engagement Period and of this agreement.

**Exhibit 1 (Washington notice).** *This agreement does not require you to assign any invention for which no equipment, supplies, facilities or trade-secret information of Eden was used and which was developed entirely on your own time, unless (a) the invention relates (i) directly to Eden's business, or (ii) to Eden's actual or demonstrably anticipated research or development, or (b) the invention results from any work you performed for Eden.*

**Exhibit 2 (trade-secret immunity).** *Under 18 U.S.C. 1833(b), you are not liable under any federal or state trade-secret law for disclosing a trade secret (a) in confidence to a government official or a lawyer solely to report or investigate a suspected violation of law, or (b) in a complaint or other filing in a lawsuit, if the filing is made under seal. If you sue for retaliation for reporting a suspected violation of law, you may disclose the trade secret to your lawyer and use it in the proceeding if you file it under seal and do not disclose it except by court order.*

<!-- pagebreak -->

## Drafting notes

| Choice | Why |
|---|---|
| Contractor version drops [X].3 | Work made for hire rarely fits contractor work, and in California it turns the contractor into an employee for comp and unemployment (Lab. Code 3351.5(c)). The assignment in [X].4 does the job alone |
| Engagement Period reaches back to day one | Captures playbooks already written. "Hereby assigns" transfers past and future work |
| [X].5 and [X].6 | Covers AI output that copyright may not protect, and keeps the files reachable. Storage and paper together |
| [X].8 general skills | Keeps the clause from reading as a non-compete. Washington voids those from 30 June 2027 (ESHB 1155); this clause restricts no work for others |
| One owner entity | Pick one (my default: Eden Partner Group LLC, the recruiting operator) and licence the affiliates, rather than splitting ownership. Joel confirms against the books (R-008) |

## How to roll it out

1. **New hires and new contractors:** the clause goes in every agreement and offer letter from today, including the intern offer letters (replace "Confidentiality Agreement" with "IP Assignment and Confidentiality Agreement").
2. **People already working:** sign the stand-alone version. Pair it with real consideration: for the 1099 team, sign it **with the new commission plan** (that plan is fresh consideration they want); for W-2 staff, with the next raise or a one-time payment Kev sets (a spend, so QC).
3. **First three signatures, in order:** the Eden Brain contractor, Kev's founder assignment to the entity, then the pilot recruiter for the Shared Drive.

## OUTSIDE COUNSEL (IP and employment, one review)

1. Does the stand-alone assignment, signed now by existing 1099 recruiters and W-2 staff, need separate consideration in Washington and Idaho, and is a commission plan or one-time payment enough?
2. Does the Eden Brain contractor's existing paper (once found) already transfer the platform code, and if not, what fixes the past work: a nunc pro tunc assignment or a purchase?
3. Is [X].5 (contractual ownership of output that copyright does not protect) enforceable against a departing recruiter in Washington, Idaho and Oregon, alongside trade-secret law?

## Decisions for Kev

| # | Decision | My pick |
|---|---|---|
| 1 | Which entity owns Eden's IP | Eden Partner Group LLC; affiliates licensed. Joel confirms |
| 2 | Signing order | Eden Brain contractor, Kev's founder assignment, pilot recruiter, then everyone with the commission plan |
| 3 | Counsel review before first signature | Yes: one IP and employment review of the clause and the stand-alone form |

## Score (rubric `legal-work.md`)

Verdict first 2, top three 2, redlines 1 (new clause, no existing wording to redline), ambiguity 2, sources graded 2, numbers gate 1 (no figures to gate; bracketed day counts open), counsel flagged 2, nothing sent 2, plain language 2, hand-off 2 (register R-023 and memory updated). **18 of 20.**

## Sources (read 29 October 2026 unless noted)

- 17 USC 101, work made for hire: https://www.law.cornell.edu/uscode/text/17/101
- 18 USC 1833(b): https://www.law.cornell.edu/uscode/text/18/1833
- RCW 49.44.140: https://app.leg.wa.gov/RCW/default.aspx?cite=49.44.140
- Cal. Lab. Code 3351.5: https://california.public.law/codes/labor_code_section_3351.5
- Anthropic Consumer Terms (eff. 8 Oct 2025): https://www.anthropic.com/legal/consumer-terms
- Anthropic Commercial Terms (eff. 17 Jun 2025): https://www.anthropic.com/legal/commercial-terms
- *Thaler v. Perlmutter*, No. 25-449, cert. denied 2 Mar 2026: https://www.scotusblog.com/cases/case-files/thaler-v-perlmutter
- Copyright Office, *Copyright and AI, Part 2* (29 Jan 2025): https://copyright.gov/newsnet/2025/1060.html (prompt findings from law-firm summaries; report text not re-read)
- *CCNV v. Reid*, 490 U.S. 730 (1989); *Stanford v. Roche*, 563 U.S. 776 (2011); *Effects Associates v. Cohen*, 908 F.2d 555 (9th Cir. 1990); *Labriola v. Pollard Group*, 152 Wn.2d 828 (2004): from Docket's library, not re-read this session
