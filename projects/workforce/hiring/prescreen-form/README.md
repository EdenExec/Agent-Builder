# Recruiter pre-screen as a Google Form

Source questions: `../recruiter-prescreen.md`. Built 2 Nov 2026 by Jenny for Kev and Nick. Nothing is sent or shared by building it.

## Set it up (about 5 minutes, from kev@edenexec.com)

1. **Build it.** Open https://script.google.com, click New project, paste `build-form.gs`, and click Save. Choose `buildPrescreenForm`, click Run and approve the permissions. The execution log prints three links: edit, send and the responses Sheet.
2. **Brand it.** In the Form, click the palette icon (Customize theme):
    - Header: upload `header.png`.
    - Colour: custom `#151515` (Eden ink).
    - Background: the lightest grey option.
    - Font: Montserrat if it's offered, otherwise Basic.
3. **Section 5.** Nick replaces every `[Nick ...]` in the Section 5 description with the real structure for this role.
4. **Send.** Click Send, then the link icon, tick "Shorten URL" and paste it into the email after the first call. Same Form for every candidate in a role.

## What the candidate sees

- Intro page: why we ask, 60 to 90 minutes, 3 business days, their name and LinkedIn. Their email is collected automatically.
- Eight pages, one per section, with a progress bar. Every question is required except "Anything else".
- On submit: "Thank you. We read every answer." They can edit their answers afterwards.

## Notes

- **Progress is saved only if the candidate is signed in to Google.** The intro tells them to draft in a document first if they aren't.
- **Responses** land in the Sheet "Eden · Recruiter pre-screen responses", one row per candidate. Nick and Kev read them against the rubric in `../recruiter-prescreen.md` (internal, never in the Form).
- **Docket's rules hold:** no questions about age, family, health, religion or pay history; the same Form for every candidate in a role. The candidate's preferences in Section 5 are expectations, not pay history.
- **The Marketing add-on** is a separate work sample emailed on its own, not part of this Form.
