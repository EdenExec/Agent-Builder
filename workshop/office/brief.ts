// npm run brief -- <path/to/brief.yaml>    check completeness and print the review copy
import { readFileSync } from "node:fs";
import { parseBrief, missingFields, renderBrief } from "../core/brief.ts";

const path = process.argv[2];
if (!path) { console.error("Usage: npm run brief -- projects/<name>/brief.yaml"); process.exit(1); }
try {
  const b = parseBrief(readFileSync(path, "utf8"));
  console.log(renderBrief(b));
  const m = missingFields(b);
  process.exit(m.length ? 2 : 0);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
