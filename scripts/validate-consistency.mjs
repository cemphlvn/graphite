import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { rootDir } from "../lib/paths.mjs";
import { loadMeta } from "../lib/meta.mjs";

const meta = await loadMeta();
let failed = 0;

function fail(msg) {
  failed += 1;
  console.log(`DRIFT ${msg}`);
}

function ok(msg) {
  console.log(`ok    ${msg}`);
}

// 1. package.json status must reflect ontology status
const pkg = JSON.parse(await readFile(join(rootDir, "package.json"), "utf8"));
const pkgHasStatus = pkg.version.includes("incubating");
const ontologyIncubating = meta.status.includes("incubating");

if (pkgHasStatus === ontologyIncubating) {
  ok("package.json version aligns with ontology status");
} else {
  fail("package.json version does not reflect ontology status");
}

// 2. README boundary rules must cover ontology boundary rules
const readme = await readFile(join(rootDir, "README.md"), "utf8");
const readmeLower = readme.toLowerCase();

for (const rule of meta.non_adoption_boundary) {
  const keywords = rule.replace(/before 1\.0/g, "").trim().split(/\s+/).filter(w => w.length > 3);
  const found = keywords.every(kw => readmeLower.includes(kw.toLowerCase()));
  if (found) {
    ok(`README covers boundary rule: "${rule}"`);
  } else {
    fail(`README may be missing boundary rule: "${rule}"`);
  }
}

// 3. spec/non_adoption_boundary.md must cover ontology boundary rules
const boundarySpec = await readFile(join(rootDir, "spec", "non_adoption_boundary.md"), "utf8");
const boundaryLower = boundarySpec.toLowerCase();

for (const rule of meta.non_adoption_boundary) {
  const keywords = rule.replace(/before 1\.0/g, "").trim().split(/\s+/).filter(w => w.length > 3);
  const found = keywords.every(kw => boundaryLower.includes(kw.toLowerCase()));
  if (found) {
    ok(`boundary spec covers rule: "${rule}"`);
  } else {
    fail(`boundary spec may be missing rule: "${rule}"`);
  }
}

// 4. adoption gate spec must reference the signed decision from ontology
const gateSpec = await readFile(join(rootDir, "spec", "adoption_gate.md"), "utf8");

if (gateSpec.includes(meta.adoption.requires_signed_decision)) {
  ok("adoption gate references correct signed decision");
} else {
  fail(`adoption gate missing signed decision: ${meta.adoption.requires_signed_decision}`);
}

// 5. protocol spec must reference the same protocol prefix as the schema
const schema = JSON.parse(await readFile(join(rootDir, "protocol", "envelope.schema.json"), "utf8"));
const protocolSpec = await readFile(join(rootDir, "spec", "graphite.protocol.md"), "utf8");
const schemaPrefix = schema.properties.protocol.pattern.match(/\^([^/]+)/)?.[1] || "";

if (protocolSpec.includes(`${schemaPrefix}/`)) {
  ok("protocol spec uses same prefix as envelope schema");
} else {
  fail(`protocol spec does not reference prefix "${schemaPrefix}" from schema`);
}

if (failed) {
  console.log(`\n${failed} consistency issue(s) found`);
  process.exit(1);
}
console.log("\nall consistency checks passed");
