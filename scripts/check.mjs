import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { rootDir } from "../lib/paths.mjs";
import { loadMeta } from "../lib/meta.mjs";
import { validateEnvelope, createEnvelope } from "../lib/envelope.mjs";
import { checkBoundary } from "../lib/boundary.mjs";

const required = [
  "README.md",
  "spec/graphite.protocol.md",
  "spec/adoption_gate.md",
  "spec/non_adoption_boundary.md",
  "ontology/graphite.yaml",
  "protocol/envelope.schema.json",
  "docs/github_repo_plan.md"
];

let failed = 0;

for (const file of required) {
  try {
    await readFile(join(rootDir, file), "utf8");
    console.log(`ok ${file}`);
  } catch {
    failed += 1;
    console.log(`missing ${file}`);
  }
}

const meta = await loadMeta();
if (meta.name && meta.status) {
  console.log(`ok meta: ${meta.name} [${meta.status}]`);
} else {
  failed += 1;
  console.log("fail meta: missing name or status in ontology");
}

const boundary = await checkBoundary();
if (boundary.enforced && boundary.rules && boundary.rules.length > 0) {
  console.log(`ok boundary: ${boundary.rules.length} rules enforced`);
} else if (!boundary.enforced) {
  console.log(`ok boundary: adoption active`);
} else {
  failed += 1;
  console.log("fail boundary: no rules defined");
}

const sample = await createEnvelope({ kind: "check.probe", payload: { probe: true } });
const result = await validateEnvelope(sample);
if (result.valid) {
  console.log("ok envelope: sample validates");
} else {
  failed += 1;
  console.log(`fail envelope: ${result.errors.join(", ")}`);
}

if (failed) process.exit(1);
console.log("graphite incubator check passed");
