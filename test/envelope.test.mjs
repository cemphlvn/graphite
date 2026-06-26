import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = resolve(root, "protocol/envelope.schema.json");

async function loadSchema() {
  const raw = await readFile(schemaPath, "utf8");
  return JSON.parse(raw);
}

describe("protocol/envelope.schema.json", () => {
  it("should be valid JSON", async () => {
    const raw = await readFile(schemaPath, "utf8");
    assert.doesNotThrow(() => JSON.parse(raw));
  });

  it("should reference JSON Schema 2020-12 draft", async () => {
    const schema = await loadSchema();
    assert.equal(
      schema.$schema,
      "https://json-schema.org/draft/2020-12/schema"
    );
  });

  it("should have the correct title", async () => {
    const schema = await loadSchema();
    assert.equal(schema.title, "Graphite Envelope Draft");
  });

  it("should require protocol, kind, created_at, and payload", async () => {
    const schema = await loadSchema();
    assert.deepEqual(schema.required.sort(), [
      "created_at",
      "kind",
      "payload",
      "protocol",
    ]);
  });

  it("should define protocol as a string with pattern", async () => {
    const schema = await loadSchema();
    const prop = schema.properties.protocol;
    assert.equal(prop.type, "string");
    assert.ok(prop.pattern, "protocol should have a regex pattern");
  });

  it("should allow additional properties", async () => {
    const schema = await loadSchema();
    assert.equal(schema.additionalProperties, true);
  });

  describe("envelope validation", () => {
    let validate;

    it("should compile into a valid AJV validator", async () => {
      const schema = await loadSchema();
      const ajv = new Ajv2020();
      validate = ajv.compile(schema);
      assert.equal(typeof validate, "function");
    });

    it("should accept a valid envelope", async () => {
      const schema = await loadSchema();
      const ajv = new Ajv2020();
      validate = ajv.compile(schema);

      const valid = validate({
        protocol: "graphite/0.0",
        kind: "message.text",
        created_at: "2026-06-26T00:00:00.000Z",
        payload: { text: "hello" },
      });
      assert.ok(valid, `validation errors: ${JSON.stringify(validate.errors)}`);
    });

    it("should accept an envelope with an optional gate", async () => {
      const schema = await loadSchema();
      const ajv = new Ajv2020();
      validate = ajv.compile(schema);

      const valid = validate({
        protocol: "graphite/1.0",
        kind: "governance.decision",
        created_at: "2026-06-26T12:00:00.000Z",
        gate: { signer: "foundation", decision: "approve" },
        payload: { ref: "adopt-graphite-1-0" },
      });
      assert.ok(valid, `validation errors: ${JSON.stringify(validate.errors)}`);
    });

    it("should accept an envelope with additional properties", async () => {
      const schema = await loadSchema();
      const ajv = new Ajv2020();
      validate = ajv.compile(schema);

      const valid = validate({
        protocol: "graphite/0.0",
        kind: "claim.source",
        created_at: "2026-06-26T00:00:00.000Z",
        payload: {},
        origin: "lab-alpha",
        tags: ["experiment"],
      });
      assert.ok(valid, `validation errors: ${JSON.stringify(validate.errors)}`);
    });

    it("should reject an envelope missing protocol", async () => {
      const schema = await loadSchema();
      const ajv = new Ajv2020();
      validate = ajv.compile(schema);

      const valid = validate({
        kind: "message.text",
        created_at: "2026-06-26T00:00:00.000Z",
        payload: {},
      });
      assert.ok(!valid, "should be invalid without protocol");
    });

    it("should reject an envelope missing payload", async () => {
      const schema = await loadSchema();
      const ajv = new Ajv2020();
      validate = ajv.compile(schema);

      const valid = validate({
        protocol: "graphite/0.0",
        kind: "message.text",
        created_at: "2026-06-26T00:00:00.000Z",
      });
      assert.ok(!valid, "should be invalid without payload");
    });

    it("should reject an envelope missing kind", async () => {
      const schema = await loadSchema();
      const ajv = new Ajv2020();
      validate = ajv.compile(schema);

      const valid = validate({
        protocol: "graphite/0.0",
        created_at: "2026-06-26T00:00:00.000Z",
        payload: {},
      });
      assert.ok(!valid, "should be invalid without kind");
    });

    it("should reject an envelope missing created_at", async () => {
      const schema = await loadSchema();
      const ajv = new Ajv2020();
      validate = ajv.compile(schema);

      const valid = validate({
        protocol: "graphite/0.0",
        kind: "message.text",
        payload: {},
      });
      assert.ok(!valid, "should be invalid without created_at");
    });

    it("should reject a protocol value not matching the pattern", async () => {
      const schema = await loadSchema();
      const ajv = new Ajv2020();
      validate = ajv.compile(schema);

      const valid = validate({
        protocol: "not-graphite",
        kind: "message.text",
        created_at: "2026-06-26T00:00:00.000Z",
        payload: {},
      });
      assert.ok(!valid, "should reject malformed protocol string");
    });

    it("should reject a completely empty object", async () => {
      const schema = await loadSchema();
      const ajv = new Ajv2020();
      validate = ajv.compile(schema);

      const valid = validate({});
      assert.ok(!valid, "empty object should be invalid");
    });
  });
});
