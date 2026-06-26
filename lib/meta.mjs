import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { rootDir } from "./paths.mjs";

let _cache = null;

export async function loadMeta() {
  if (_cache) return _cache;
  const text = await readFile(join(rootDir, "ontology", "graphite.yaml"), "utf8");
  _cache = parseYaml(text);
  return _cache;
}

export async function getStatus() {
  const meta = await loadMeta();
  return meta.status;
}

export async function getAdoption() {
  const meta = await loadMeta();
  return meta.adoption;
}

export async function getNonAdoptionBoundary() {
  const meta = await loadMeta();
  return meta.non_adoption_boundary;
}

export async function getProperties() {
  const meta = await loadMeta();
  return meta.properties;
}

export function clearCache() {
  _cache = null;
}
