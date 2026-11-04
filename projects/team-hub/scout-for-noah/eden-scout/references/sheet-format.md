# Sheet format (every lead sheet, every time)

## Columns, in this order (phones first, Kev 3 Nov 2026)

Ref, #, Tier, Name, Mobile, Mobile source, Direct, Phone notes, Title, Company, Company type, Trade, City, State, Time Zone, LinkedIn, In Crelate (owner, last activity), Fit note, Source, Note, Suggested owner, Owner

- Phones sit in columns E to H so recruiters see them immediately. Always find a column by its header name, never by position (older sheets have Mobile at the end). Never add a second "Mobile" column.
- **Ref**: every list has a reference number on every row and at the start of its Drive title. Kev's Scout uses EL-001 to EL-499. **Noah's agent uses EL-500 upward** (next unused number; check the Lead Log). Title format: `EL-NNN · YYYY-MM-DD · Client · Role · Area · N leads`.
- **Tier**: 1 = the seat, at a company type the client hires from, in the metro. 2 = adjacent title or company type, or relocation distance. 3 = long shots.
- **Name, Title, Company** as the source gives them.
- **City, State, Time Zone**: three separate columns, every row. State two letters; Time Zone PST, MST, CST or EST. Where a person lives when known; otherwise the office city with "office location; confirm" in Note. Never one combined location column (the Crelate upload maps each separately).
- **LinkedIn never blank**: the exact profile URL when known; otherwise `https://www.linkedin.com/search/results/people/?keywords=<First Last Company>` URL-encoded.
- **In Crelate**: "Pending" unless you checked. If someone with Crelate access checked: "Yes · <Crelate id> · owner <name> · last <date>" or "No · new record".
- **Fit note**: one line on why this person fits and what to confirm on the call.
- **Source**: "ZoomInfo <personId>" (negative ids are valid) or "LinkedIn (public web search)".
- **Note**: flags (client rules, location to confirm).
- **Mobile / Mobile source / Direct / Phone notes**: see phone-pass.md. A Mobile with source "Crelate" came from Eden's CRM; never overwrite it.

## Titles: Eden tag → search variants (search each variant separately)

| Eden tag | Variants |
|---|---|
| Superintendent | Superintendent, Site Superintendent, Project Superintendent, Senior Superintendent |
| General Superintendent | General Superintendent, Field Operations Manager, Director of Field Operations |
| Project Manager | Project Manager, Senior Project Manager, Construction Project Manager |
| PX | Project Executive, Senior Project Executive |
| APM | Assistant Project Manager |
| PE | Project Engineer, Senior Project Engineer, Field Engineer |
| Estimator | Estimator, Senior Estimator, Chief Estimator, Preconstruction Manager |

## Quality bar

At least 25 Tier 1 names for a common title in a large metro, or a note saying why the market is thinner. Fewer than 10% wrong person or wrong company when a recruiter checks.

## Landing a sheet

Create it as a Google Sheet in the master leads folder (`https://drive.google.com/drive/folders/1U6zVA_rBsft6mwYLjQ5F1Pr_DRz1OUg9`). Large files: create with the first ~50 rows, then append the rest in 50-60 row chunks with Google Sheets append, and read back row count and the # column. Then add a row to the Lead Log: title, link, rows, landed date, Owner note (bucket name "Client - Role - City Leads").
