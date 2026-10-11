# Rubric: systems work (an integration, mirror job, tool or screen)

Score each 0 (fail), 1 (partial), 2 (strong). Pass line: 16 of 20, with no zero.

1. Result first: the first lines say what now works for whom, how it was proved, and where to open it.
2. Proof is real: a pasted test run, row count, query result or screenshot from this session, not a description of one.
3. Read-only first: no write to Crelate or any live client-facing system without an approved `write_external` QC item naming records and fields.
4. Privacy: no EEO field anywhere; no salary, home address, personal email or phone in any table, sheet, log, artifact or report; names plus roles at most.
5. Secrets: no key, token or password printed, logged, committed or requested in chat.
6. One source of truth: every copy of data shows its source and sync time; no second system owns a fact.
7. Small and reversible: the change is the smallest useful step, upserts instead of deletes, a way back is stated.
8. Plain language: Kev can read the report between calls; jargon is translated; three bullets a section or fewer.
9. Eden standard: screens follow the Eden look (Montserrat, black on white or cream, one accent), Eden Partner Group for recruiting work.
10. Hand-off: Radar gets one line, the ledger gets a row for any blocker, and new facts are written to `memory/live/`.
