import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildAsk, validateAsk, askFromQc, parseAnswered, applyAnswers, newAskId, type Ask } from "./desk.ts";
import * as qc from "./qc.ts";

const now = new Date("2026-10-04T15:30:00Z");
const decision = () => ({
  employee: "housing-architect", kind: "decision" as const, title: "Courtyard or garage on the lake side?",
  options: [{ id: "court", label: "Courtyard" }, { id: "garage", label: "Garage" }], recommended: "court", defaultIfSilent: "I will draw both and recommend the courtyard.",
});

describe("desk asks", () => {
  test("builds with defaults and a stable readable id", () => {
    const a = buildAsk(decision(), now);
    assert.equal(a.id, "20261004-1530-courtyard-or-garage-on-the-lake-side");
    assert.equal(a.status, "open");
    assert.equal(a.urgency, "today");
    assert.equal(newAskId("!!!", now), "20261004-1530-ask");
  });
  test("approval and review get their standard buttons, info gets one", () => {
    const ap = buildAsk({ employee: "e", kind: "approval", title: "Approve brief", qcId: "x" }, now);
    assert.deepEqual(ap.options!.map((o) => o.id), ["approve", "reject"]);
    const rv = buildAsk({ employee: "e", kind: "review", title: "Board ready", link: { label: "Open", url: "https://claude.ai/x" } }, now);
    assert.deepEqual(rv.options!.map((o) => o.id), ["good", "changes"]);
    assert.deepEqual(buildAsk({ employee: "e", kind: "info", title: "FYI" }, now).options!.map((o) => o.id), ["ok"]);
  });
  test("rejects homework, missing context and unsafe links", () => {
    const many = { ...decision(), options: Array.from({ length: 6 }, (_, i) => ({ id: `o${i}`, label: `O${i}` })), recommended: undefined };
    assert.throws(() => buildAsk(many, now), /2 to 5 options/);
    assert.throws(() => buildAsk({ ...decision(), defaultIfSilent: undefined }, now), /defaultIfSilent/);
    assert.throws(() => buildAsk({ ...decision(), recommended: "nope" }, now), /recommended/);
    assert.throws(() => buildAsk({ employee: "e", kind: "approval", title: "x" }, now), /qcId/);
    assert.throws(() => buildAsk({ employee: "e", kind: "review", title: "x" }, now), /link/);
    assert.throws(() => buildAsk({ employee: "e", kind: "review", title: "x", link: { label: "l", url: "javascript:alert(1)" } }, now), /https/);
    assert.throws(() => buildAsk({ ...decision(), title: "x".repeat(91) }, now), /90 characters/);
    assert.throws(() => buildAsk({ ...decision(), options: [{ id: "a", label: "A" }, { id: "a", label: "B" }], recommended: undefined }, now), /unique/);
  });
  test("an approval card carries the exact amount, recipients and text from the QC item", () => {
    const root = mkdtempSync(join(tmpdir(), "desk-"));
    const item = qc.submit(root, { employee: "housing-architect", kind: "send_message", summary: "Email surveyor", detail: "Hi Pat, can you quote a boundary survey?", recipients: ["pat@example.com"] });
    const a = askFromQc(item, now);
    assert.equal(a.qcId, item.id);
    assert.match(a.body!, /To: pat@example\.com/);
    assert.match(a.body!, /boundary survey/);
    assert.equal(a.urgency, "today");
    const s = qc.submit(root, { employee: "e", kind: "spend", summary: "Image pack", detail: "d", amountUsd: 49 });
    assert.match(askFromQc(s, now).body!, /Amount: \$49/);
  });
  test("parseAnswered finds answered asks in docs, lists and wrappers, ignoring open ones", () => {
    const base = buildAsk(decision(), now);
    const answered: Ask = { ...base, status: "answered", answer: { choice: "court", at: now.toISOString() } };
    const open = buildAsk({ ...decision(), title: "Other" }, now);
    assert.equal(parseAnswered(JSON.stringify(answered)).length, 1);
    assert.equal(parseAnswered(JSON.stringify({ data: answered })).length, 1);
    assert.equal(parseAnswered(JSON.stringify({ documents: [{ data: answered }, { data: open }] })).length, 1);
    assert.equal(parseAnswered(JSON.stringify([answered, open])).length, 1);
    assert.equal(parseAnswered("{}").length, 0);
    assert.deepEqual(validateAsk(answered), []);
  });
});

describe("applyAnswers", () => {
  const answer = (a: Ask, choice: string, text?: string): Ask => ({ ...a, status: "answered", answer: { choice, text, at: now.toISOString() } });
  test("applies ordinary approvals, holds money and messages for chat confirmation, reports stale and plain answers", () => {
    const root = mkdtempSync(join(tmpdir(), "desk-"));
    const brief = qc.submit(root, { employee: "e", kind: "start_work", summary: "Approve brief", detail: "d" });
    const mail = qc.submit(root, { employee: "e", kind: "send_message", summary: "Email", detail: "d", recipients: ["a@b.co"] });
    const buy = qc.submit(root, { employee: "e", kind: "spend", summary: "Buy", detail: "d", amountUsd: 5 });
    const stale = qc.submit(root, { employee: "e", kind: "delete", summary: "Delete", detail: "d" });
    qc.decide(root, stale.id, "rejected");
    const asks = [brief, mail, buy, stale].map((i) => answer(askFromQc(i, now), "approve", "go"));
    const dec = answer(buildAsk(decision(), now), "court", "south side too");
    const open = buildAsk({ ...decision(), title: "Unanswered" }, now);
    const r = applyAnswers([...asks, dec, open], root, qc);
    assert.deepEqual(r.decided.map((d) => d.qcId), [brief.id]);
    assert.equal(qc.isApproved(root, brief.id), true);
    assert.deepEqual(r.needsChatConfirm.map((d) => d.kind).sort(), ["send_message", "spend"]);
    assert.equal(qc.isApproved(root, mail.id), false);
    assert.equal(qc.isApproved(root, buy.id), false);
    assert.equal(r.stale.length, 1);
    assert.equal(r.answers.length, 1);
    assert.equal(r.answers[0]!.label, "Courtyard");
    assert.equal(r.answers[0]!.text, "south side too");
  });
  test("a reject is applied and an unknown choice is ignored", () => {
    const root = mkdtempSync(join(tmpdir(), "desk-"));
    const i = qc.submit(root, { employee: "e", kind: "publish", summary: "Publish board", detail: "d" });
    const r = applyAnswers([answer(askFromQc(i, now), "maybe")], root, qc);
    assert.equal(r.decided.length, 0);
    const r2 = applyAnswers([answer(askFromQc(i, now), "reject")], root, qc);
    assert.equal(r2.decided[0]!.decision, "rejected");
  });
});
