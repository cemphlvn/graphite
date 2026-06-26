import { readFile } from "node:fs/promises";

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
    await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    console.log(`ok ${file}`);
  } catch {
    failed += 1;
    console.log(`missing ${file}`);
  }
}

if (failed) process.exit(1);
console.log("graphite incubator check passed");

