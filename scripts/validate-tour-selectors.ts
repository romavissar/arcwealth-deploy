import { readFileSync } from "node:fs";
import path from "node:path";

function extractTourSelectors(content: string): string[] {
  const matches = content.matchAll(/selector:\s*"\[data-tour-id='([^']+)'\]"/g);
  return Array.from(matches, (match) => match[1]);
}

function extractTourAnchors(content: string): string[] {
  const matches = content.matchAll(/data-tour-id="([^"]+)"/g);
  return Array.from(matches, (match) => match[1]);
}

const root = process.cwd();
const guidedTourPath = path.join(root, "components/onboarding/GuidedTour.tsx");
const anchorFiles = [
  "components/layout/TopBar.tsx",
  "app/(app)/dashboard/page.tsx",
  "app/(app)/learn/page.tsx",
  "app/(app)/textbook/page.tsx",
  "app/(app)/glossary/page.tsx",
  "app/(app)/leaderboard/page.tsx",
  "app/(app)/profile/page.tsx",
];

const guidedTourContent = readFileSync(guidedTourPath, "utf8");
const selectors = extractTourSelectors(guidedTourContent);
const selectorSet = new Set(selectors);

if (selectorSet.size !== selectors.length) {
  throw new Error("Duplicate selector IDs found in TOUR_STEPS. Each tutorial step selector must be unique.");
}

const anchors = new Set(
  anchorFiles.flatMap((relativePath) => extractTourAnchors(readFileSync(path.join(root, relativePath), "utf8")))
);

const missingSelectors = selectors.filter((selector) => !anchors.has(selector));
if (missingSelectors.length > 0) {
  throw new Error(`Missing data-tour-id anchor(s): ${missingSelectors.join(", ")}`);
}

console.log(`Tour selector integrity check passed (${selectors.length} selectors validated).`);
