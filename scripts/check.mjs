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
    const content = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    if (!content.trim()) {
      failed += 1;
      console.error(`empty ${file}`);
      continue;
    }
    if (file.endsWith(".json")) {
      try {
        JSON.parse(content);
      } catch (parseErr) {
        failed += 1;
        console.error(`invalid json ${file}: ${parseErr.message}`);
        continue;
      }
    }
    console.log(`ok ${file}`);
  } catch (err) {
    failed += 1;
    if (err.code === "ENOENT") {
      console.error(`missing ${file}`);
    } else if (err.code === "EACCES") {
      console.error(`permission denied ${file}: ${err.message}`);
    } else {
      console.error(`error reading ${file}: ${err.message}`);
    }
  }
}

if (failed) {
  console.error(`\n${failed} file(s) failed checks`);
  process.exit(1);
}
console.log("graphite incubator check passed");

