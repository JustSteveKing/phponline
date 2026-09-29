import fs from "node:fs";
import path from "node:path";

/**
 * Fail the run if any feed failed, after the deploy rather than before it.
 *
 * A single dead feed should not stop everything else being published, and it
 * should not pass quietly either. Splitting it this way gets both: the site
 * goes out with the content that arrived, and the run still goes red so
 * somebody is told which source is broken.
 */

const REPORT = path.join(import.meta.dir, "..", ".ingest-report.json");

if (!fs.existsSync(REPORT)) {
  console.error("No ingest report found. Did scripts/ingest.ts run?");
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(REPORT, "utf8"));

if (!report.failures?.length) {
  console.log(`All ${report.attempted} sources ingested.`);
  process.exit(0);
}

console.error(`${report.failures.length} of ${report.attempted} sources failed:\n`);

for (const failure of report.failures) {
  console.error(`  ${failure.source}`);
  console.error(`    ${failure.url}`);
  console.error(`    ${failure.error}\n`);
}

console.error("The site was still built and deployed with the content that did arrive.");
process.exit(1);
