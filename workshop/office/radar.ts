// npm run radar -- compile      write employees/radar/routines/<id>.md (self-contained routine prompts)
// npm run radar -- deploy       print the trigger payloads (name, cron, model, prompt file) to apply with the routine tools
// npm run radar -- show <id>    print one compiled prompt
import "../lib/env.ts";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { compileAll, deployPlan } from "../core/radar.ts";

const DIR = "employees/radar";
const OUT = join(DIR, "routines");
const [cmd = "deploy", arg] = process.argv.slice(2);

const { file, prompts } = compileAll(DIR);
if (cmd === "compile") {
  mkdirSync(OUT, { recursive: true });
  for (const [id, text] of Object.entries(prompts)) {
    writeFileSync(join(OUT, `${id}.md`), text);
    console.log(`wrote ${join(OUT, `${id}.md`)} (${text.length} chars)`);
  }
} else if (cmd === "deploy") {
  console.log(JSON.stringify(deployPlan(file, OUT, prompts), null, 2));
} else if (cmd === "show") {
  if (!arg || !prompts[arg]) { console.error(`routine "${arg}" not found; known: ${Object.keys(prompts).join(", ")}`); process.exit(1); }
  console.log(readFileSync(join(OUT, `${arg}.md`), "utf8"));
} else {
  console.error(`Unknown command "${cmd}". Use compile, deploy or show <id>.`);
  process.exit(1);
}
