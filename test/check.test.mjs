import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkScript = resolve(root, "scripts/check.mjs");

const REQUIRED_FILES = [
  "README.md",
  "spec/graphite.protocol.md",
  "spec/adoption_gate.md",
  "spec/non_adoption_boundary.md",
  "ontology/graphite.yaml",
  "protocol/envelope.schema.json",
  "docs/github_repo_plan.md",
];

describe("scripts/check.mjs", () => {
  it("should list all required files in the script source", async () => {
    const src = await readFile(checkScript, "utf8");
    for (const file of REQUIRED_FILES) {
      assert.ok(src.includes(file), `script should reference ${file}`);
    }
  });

  it("should exit 0 when all required files are present", async () => {
    const { stdout } = await exec("node", [checkScript], { cwd: root });
    assert.ok(stdout.includes("graphite incubator check passed"));
    for (const file of REQUIRED_FILES) {
      assert.ok(stdout.includes(`ok ${file}`), `should report ok for ${file}`);
    }
  });

  it("should not report any missing files in a valid repo", async () => {
    const { stdout } = await exec("node", [checkScript], { cwd: root });
    assert.ok(!stdout.includes("missing"), "no files should be missing");
  });

  it("should verify each required file is readable", async () => {
    for (const file of REQUIRED_FILES) {
      const content = await readFile(resolve(root, file), "utf8");
      assert.ok(content.length > 0, `${file} should not be empty`);
    }
  });

  it("should use ES module syntax", async () => {
    const src = await readFile(checkScript, "utf8");
    assert.ok(src.includes("import"), "should use ES module imports");
    assert.ok(
      src.includes("import.meta.url"),
      "should reference import.meta.url for path resolution"
    );
  });
});
