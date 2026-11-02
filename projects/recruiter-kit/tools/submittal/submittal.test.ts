import { test } from "node:test";
import assert from "node:assert/strict";
import { backHtml, checkPacket, CONSENT, coverHtml, googleLink, googleQuery, nameVariants, scoreLine, stateName, type Packet } from "./packet.ts";

const sample = (): Packet => ({
  candidate: { first: "Mike", last: "Example", middle: "James", title: "Project Manager", years: 12 },
  role_submitted: "Project Manager, Example City",
  pay: { basis: "desired", base: "$100K", bonus: "5%", vehicle: "$500/mo" },
  current_location: "Columbus, OH",
  past_states: ["IN", "Kentucky"],
  highlights: ["Hospital work", "Self-perform crews"],
  start_availability: "ASAP",
  actively_interviewing: "Not yet",
  concerns: "None known",
  must_dos: Array.from({ length: 7 }, (_, i) => ({ item: `Must do ${i + 1}`, rating: i === 6 ? "partial" : "meets", evidence: "From the screen" })),
  resume: "resume.pdf",
  references: [{ name: "Ref One", relationship: "Former PX" }],
  references_consent: true,
});

test("state names are spelled out from codes, cities and names", () => {
  assert.equal(stateName("TX"), "Texas");
  assert.equal(stateName("Columbus, OH"), "Ohio");
  assert.equal(stateName("louisiana"), "Louisiana");
  assert.equal(stateName("Bay Area"), "Bay Area");
  assert.equal(stateName("Springfield, IL (moving toward Peoria)"), "Illinois");
});

test("name variations cover formal, nickname, middle initial and reversed", () => {
  const v = nameVariants({ first: "Mike", last: "Example", middle: "James" });
  assert.ok(v.includes("Mike Example") && v.includes("Michael Example") && v.includes("Mike J Example") && v.includes("Example, Mike"));
  assert.ok(v.length <= 6);
});

test("the Boolean searches names in the current state and every past state (Kev, 24 Oct)", () => {
  const q = googleQuery(sample());
  assert.match(q, /\("Mike Example" OR .*"Michael Example"/);
  assert.match(q, /\("Ohio" OR "Indiana" OR "Kentucky"\)$/);
  assert.ok(googleLink(sample()).startsWith("https://www.google.com/search?q=(%22Mike"));
});

test("the cover page marks pay current or desired and carries the scorecard", () => {
  const html = coverHtml(sample());
  assert.match(html, /<span class="tag">Desired<\/span>Base \$100K/);
  assert.match(html, /Pre-screen scorecard/);
  assert.equal(scoreLine(sample().must_dos!), "6 of 7 met · 1 partial");
  assert.equal(scoreLine([{ item: "a", rating: "meets" }, { item: "b", rating: "confirm" }]), "1 of 2 met · 1 to confirm");
  const t = coverHtml({ ...sample(), candidate: { ...sample().candidate, years: "2 years with this firm" }, pay: { basis: "desired", base: "$80K", pto: "3 weeks" } });
  assert.match(t, /2 years with this firm</);
  assert.match(t, /PTO: 3 weeks/);
});

test("references carry the consent line", () => {
  assert.ok(backHtml(sample()).includes(CONSENT));
});

test("the checklist passes a full packet and stops a thin one", () => {
  assert.deepEqual(checkPacket(sample()), []);
  const thin = { ...sample(), pay: { basis: "maybe" as never }, must_dos: [], concerns: "", references_consent: false };
  const miss = checkPacket(thin);
  assert.ok(miss.some((m) => m.startsWith("Pay marked")) && miss.some((m) => m.startsWith("Must Dos")) && miss.some((m) => m.startsWith("Concerns")) && miss.some((m) => m.includes("consent")));
});
