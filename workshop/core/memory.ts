// Live memory: append-only markdown per topic, so taste and decisions are readable and editable by a person.
import { mkdirSync, appendFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SAFE = /^[a-z0-9][a-z0-9-]*$/;

export function memoryDir(employeeDir: string) {
  return join(employeeDir, "memory", "live");
}

export function remember(employeeDir: string, topic: string, fact: string, now = new Date()): string {
  if (!SAFE.test(topic)) throw new Error(`Topic "${topic}" must be lowercase letters, digits and dashes`);
  if (!fact.trim()) throw new Error("Nothing to remember");
  const dir = memoryDir(employeeDir);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${topic}.md`);
  appendFileSync(file, `- ${now.toISOString().slice(0, 10)}: ${fact.trim().replace(/\n+/g, " ")}\n`);
  return file;
}

export function recall(employeeDir: string, topic?: string): Record<string, string> {
  const dir = memoryDir(employeeDir);
  if (!existsSync(dir)) return {};
  const files = readdirSync(dir).filter((f) => f.endsWith(".md") && (!topic || f === `${topic}.md`));
  return Object.fromEntries(files.map((f) => [f.slice(0, -3), readFileSync(join(dir, f), "utf8")]));
}
