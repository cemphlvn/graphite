import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { rootDir } from "./paths.mjs";

let _schema = null;

async function loadSchema() {
  if (_schema) return _schema;
  const text = await readFile(join(rootDir, "protocol", "envelope.schema.json"), "utf8");
  _schema = JSON.parse(text);
  return _schema;
}

export async function getRequiredFields() {
  const schema = await loadSchema();
  return schema.required;
}

export async function createEnvelope({ kind, payload, gate }) {
  const schema = await loadSchema();
  const protocolPattern = schema.properties.protocol.pattern;
  const match = protocolPattern.match(/\^(.+)\$/);
  const prefix = match ? match[1].split("/")[0] : "graphite";

  const envelope = {
    protocol: `${prefix}/0.0`,
    kind,
    created_at: new Date().toISOString(),
    payload: payload || {}
  };

  if (gate) {
    envelope.gate = gate;
  }

  return envelope;
}

export async function validateEnvelope(envelope) {
  const schema = await loadSchema();
  const errors = [];

  if (typeof envelope !== "object" || envelope === null) {
    return { valid: false, errors: ["envelope must be a non-null object"] };
  }

  for (const field of schema.required) {
    if (!(field in envelope)) {
      errors.push(`missing required field: ${field}`);
    }
  }

  for (const [key, rule] of Object.entries(schema.properties)) {
    if (!(key in envelope)) continue;
    const value = envelope[key];

    if (rule.type === "string" && typeof value !== "string") {
      errors.push(`${key} must be a string`);
    } else if (rule.type === "object" && (typeof value !== "object" || value === null)) {
      errors.push(`${key} must be an object`);
    }

    if (rule.pattern && typeof value === "string") {
      if (!new RegExp(rule.pattern).test(value)) {
        errors.push(`${key} does not match pattern ${rule.pattern}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
