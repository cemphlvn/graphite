import { getNonAdoptionBoundary, getAdoption, getStatus } from "./meta.mjs";

export async function isAdopted() {
  const adoption = await getAdoption();
  return adoption.foundation_wide === true;
}

export async function getBoundaryRules() {
  return getNonAdoptionBoundary();
}

export async function checkBoundary() {
  const adopted = await isAdopted();
  if (adopted) {
    return { enforced: false, reason: "foundation-wide adoption is active" };
  }

  const rules = await getBoundaryRules();
  const status = await getStatus();

  return {
    enforced: true,
    status,
    rules
  };
}
