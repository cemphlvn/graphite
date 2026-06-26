import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parse } from "yaml";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ontologyPath = resolve(root, "ontology/graphite.yaml");

async function loadOntology() {
  const raw = await readFile(ontologyPath, "utf8");
  return parse(raw);
}

describe("ontology/graphite.yaml", () => {
  it("should be valid YAML", async () => {
    const raw = await readFile(ontologyPath, "utf8");
    assert.doesNotThrow(() => parse(raw));
  });

  it("should have name set to graphite", async () => {
    const doc = await loadOntology();
    assert.equal(doc.name, "graphite");
  });

  it("should have status set to incubating_pre_1_0", async () => {
    const doc = await loadOntology();
    assert.equal(doc.status, "incubating_pre_1_0");
  });

  it("should have a non-empty definition string", async () => {
    const doc = await loadOntology();
    assert.equal(typeof doc.definition, "string");
    assert.ok(doc.definition.length > 0, "definition should not be empty");
  });

  describe("adoption section", () => {
    it("should not be foundation-wide", async () => {
      const doc = await loadOntology();
      assert.equal(doc.adoption.foundation_wide, false);
    });

    it("should require version >=1.0.0", async () => {
      const doc = await loadOntology();
      assert.equal(doc.adoption.requires_version, ">=1.0.0");
    });

    it("should require signed decision adopt-graphite-1-0", async () => {
      const doc = await loadOntology();
      assert.equal(
        doc.adoption.requires_signed_decision,
        "adopt-graphite-1-0"
      );
    });

    it("should require external developer support", async () => {
      const doc = await loadOntology();
      assert.equal(doc.adoption.requires_external_developer_support, true);
    });
  });

  describe("properties section", () => {
    const EXPECTED_PROPERTIES = [
      "safe",
      "local",
      "secure",
      "learning",
      "graphable",
    ];

    it("should define all expected properties", async () => {
      const doc = await loadOntology();
      for (const prop of EXPECTED_PROPERTIES) {
        assert.ok(doc.properties[prop], `should define property: ${prop}`);
      }
    });

    it("should have a meaning string for each property", async () => {
      const doc = await loadOntology();
      for (const prop of EXPECTED_PROPERTIES) {
        const entry = doc.properties[prop];
        assert.equal(
          typeof entry.meaning,
          "string",
          `${prop}.meaning should be a string`
        );
        assert.ok(
          entry.meaning.length > 0,
          `${prop}.meaning should not be empty`
        );
      }
    });

    it("should have a status for each property", async () => {
      const doc = await loadOntology();
      for (const prop of EXPECTED_PROPERTIES) {
        const entry = doc.properties[prop];
        assert.equal(
          typeof entry.status,
          "string",
          `${prop}.status should be a string`
        );
      }
    });

    it("should have all properties in candidate status", async () => {
      const doc = await loadOntology();
      for (const prop of EXPECTED_PROPERTIES) {
        assert.equal(
          doc.properties[prop].status,
          "candidate",
          `${prop} should be in candidate status`
        );
      }
    });
  });

  describe("non_adoption_boundary section", () => {
    it("should be a non-empty array", async () => {
      const doc = await loadOntology();
      assert.ok(Array.isArray(doc.non_adoption_boundary));
      assert.ok(doc.non_adoption_boundary.length > 0);
    });

    it("should contain boundary about public foundation language", async () => {
      const doc = await loadOntology();
      const match = doc.non_adoption_boundary.some((b) =>
        b.includes("public foundation language")
      );
      assert.ok(match, "should mention public foundation language boundary");
    });

    it("should contain boundary about stable api", async () => {
      const doc = await loadOntology();
      const match = doc.non_adoption_boundary.some((b) =>
        b.includes("stable api")
      );
      assert.ok(match, "should mention stable api boundary");
    });
  });
});
