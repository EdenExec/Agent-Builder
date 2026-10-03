// npm run memory -- add <employee> <topic> "<fact>"
// npm run memory -- show <employee> [topic]
import { join } from "node:path";
import { existsSync } from "node:fs";
import { remember, recall } from "../core/memory.ts";

const [cmd, employee, topic, ...fact] = process.argv.slice(2);
try {
  if (!cmd || !employee) throw new Error('Usage: memory add <employee> <topic> "<fact>" | memory show <employee> [topic]');
  const dir = join("employees", employee);
  if (!existsSync(join(dir, "agent.yaml"))) throw new Error(`No employee "${employee}"`);
  if (cmd === "add") {
    if (!topic) throw new Error("Topic required");
    console.log(`saved to ${remember(dir, topic, fact.join(" "))}`);
  } else if (cmd === "show") {
    const m = recall(dir, topic);
    const keys = Object.keys(m);
    console.log(keys.length ? keys.map((k) => `## ${k}\n${m[k]}`).join("\n") : "No live memory yet.");
  } else throw new Error(`Unknown command "${cmd}"`);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
