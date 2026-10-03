// npm run hire -- check [id]      validate employee folders
// npm run hire -- compile [id]    write .claude/agents/<id>.md so the employee can be invoked in Claude Code
// npm run hire -- list            roster
import { mkdirSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import { loadEmployee, listEmployeeDirs, compileSubagent, EmployeeError, type Employee } from "../core/employee.ts";

const [cmd = "list", id] = process.argv.slice(2);
const dirs = listEmployeeDirs("employees").filter((d) => !id || basename(d) === id);
if (id && dirs.length === 0) { console.error(`No employee "${id}" in employees/`); process.exit(1); }

let failed = false;
const loaded: Employee[] = [];
for (const d of dirs) {
  try { loaded.push(loadEmployee(d)); }
  catch (e) { failed = true; console.error(e instanceof EmployeeError ? e.message : e); }
}

if (cmd === "list" || cmd === "check") {
  for (const e of loaded) {
    const s = e.spec;
    console.log(`ok  ${s.id.padEnd(18)} ${s.name}, ${s.title}  [${e.skills.length} skills, ${e.seeds.length} seeds, ${e.rubrics.length} rubrics, ${e.evals.length} evals]`);
  }
} else if (cmd === "compile") {
  mkdirSync(".claude/agents", { recursive: true });
  for (const e of loaded) {
    const out = join(".claude/agents", `${e.spec.id}.md`);
    writeFileSync(out, compileSubagent(e));
    console.log(`wrote ${out}`);
  }
} else {
  console.error(`Unknown command "${cmd}". Use check, compile or list.`);
  process.exit(1);
}
process.exit(failed ? 1 : 0);
