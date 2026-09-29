import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { PHP_FEEDS, PODCAST_FEEDS, YOUTUBE_CHANNELS } from "../src/config/feeds";
import {
  parser,
  newsRecords,
  episodeRecords,
  videoRecords,
  youtubeFeedUrl,
  type Record,
  type Record_,
} from "../src/ingest/transform";

/**
 * Fetch every feed and write what it holds into src/content as files.
 *
 * The site used to load feeds during the build, which meant it could only
 * ever show what was currently in each feed. Anything that scrolled off left
 * phponline.dev permanently, and a feed that was down during a build removed
 * its publication from the site without failing anything.
 *
 * Writing the items down fixes both. The archive accumulates, and a feed
 * being unreachable now costs the new items from that feed rather than all of
 * them. Nothing here ever deletes: an entry that has fallen out of a feed is
 * exactly the thing an archive exists to still have.
 */

const CONTENT = path.join(import.meta.dir, "..", "src", "content");
const REPORT = path.join(import.meta.dir, "..", ".ingest-report.json");

type Failure = { source: string; url: string; error: string };

const failures: Failure[] = [];
let attempted = 0;
let written = 0;
let unchanged = 0;

/**
 * A filename that a filesystem will accept, for an id that has to stay
 * exactly as it is.
 *
 * The id is the site's URL, so it cannot be changed to suit the disk. It is
 * carried inside the file instead and the collection reads it back, which
 * leaves the filename free to be sanitised. When sanitising changes anything,
 * a hash of the original goes on the end so that two different ids cannot
 * land on one file.
 */
function segment(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  if (cleaned === raw) return cleaned;

  const suffix = createHash("sha256").update(raw).digest("hex").slice(0, 8);

  return `${cleaned || "item"}-${suffix}`;
}

function filePathFor(collection: string, id: string): string {
  const parts = id.split("/").filter(Boolean).map(segment);
  const file = `${parts.pop()}.json`;

  return path.join(CONTENT, collection, ...parts, file);
}

/**
 * Drop the fields that have no value.
 *
 * JSON has no undefined, so an absent field would otherwise be written as
 * null, and the schemas mark these optional rather than nullable. Absent is
 * also what the feed actually told us, so it is the honest thing to store.
 */
function prune(data: Record_): Record_ {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== null && value !== undefined),
  );
}

/**
 * Write a record, and say nothing if it has not changed.
 *
 * Comparing before writing keeps the commit to what actually moved. Without
 * it every run rewrites every file, the diff is useless and the repository
 * grows for no reason.
 */
function write(collection: string, record: Record): void {
  const target = filePathFor(collection, record.id);
  const body = JSON.stringify({ id: record.id, ...prune(record.data) }, null, 2) + "\n";

  if (fs.existsSync(target) && fs.readFileSync(target, "utf8") === body) {
    unchanged++;
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, body);
  written++;
}

async function ingest(
  collection: string,
  label: string,
  url: string,
  build: (parsed: any) => Record[],
): Promise<void> {
  attempted++;

  try {
    const parsed = await parser.parseURL(url);
    const records = build(parsed);

    for (const record of records) {
      write(collection, record);
    }

    console.log(`  ok    ${label}  ${records.length} items`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    failures.push({ source: label, url, error: message });
    console.log(`  FAIL  ${label}  ${message}`);
  }
}

console.log("Ingesting feeds");

for (const feed of PHP_FEEDS) {
  await ingest("news", feed.label, feed.url, (parsed) => newsRecords(feed, parsed));
}

for (const podcast of PODCAST_FEEDS) {
  await ingest("episodes", podcast.title, podcast.feed, (parsed) => episodeRecords(podcast, parsed));
}

for (const channel of YOUTUBE_CHANNELS) {
  const url = youtubeFeedUrl(channel.id);
  await ingest("videos", channel.label, url, (parsed) => videoRecords(channel, parsed));
}

fs.writeFileSync(
  REPORT,
  JSON.stringify({ at: new Date().toISOString(), attempted, written, unchanged, failures }, null, 2) + "\n",
);

console.log(`\n${written} written, ${unchanged} unchanged, ${failures.length} of ${attempted} sources failed.`);

// Every source failing is not a feed problem, it is this machine having no
// network or the parser being broken. Building on that would publish a site
// with nothing new in it and report success, so it stops here instead.
if (attempted > 0 && failures.length === attempted) {
  console.error("\nEvery source failed. Refusing to continue.");
  process.exit(1);
}

// Some failing is survivable and must still be loud, but not here: the build
// and the deploy should go ahead with the content that did arrive, and the
// run is failed afterwards by scripts/report-ingest.ts.
process.exit(0);
