import fs from "node:fs";
import path from "node:path";
import { slugify } from "../src/utils/slugify";

// This script is intended to be run by GitHub Actions
// It parses the JSON output from stefanbuck/github-issue-parser

async function run() {
    const issueType = process.env.ISSUE_TYPE; // 'event' or 'creator'
    const issueDataPath = process.env.ISSUE_JSON_PATH;

    if (!issueType || !issueDataPath) {
        console.error("Missing ISSUE_TYPE or ISSUE_JSON_PATH");
        process.exit(1);
    }

    const rawData = fs.readFileSync(issueDataPath, 'utf8');
    const data = JSON.parse(rawData);

    if (issueType === 'event') {
        processEvent(data);
    } else {
        processCreator(data);
    }
}

function processEvent(data: any) {
    const filePath = path.join("src/config/events.ts");
    const content = fs.readFileSync(filePath, 'utf8');
    
    const id = slugify(data.title);
    
    // Check if ID already exists
    if (content.includes(`id: "${id}"`)) {
        console.error(`Event with ID ${id} already exists!`);
        process.exit(1);
    }

    const newEvent = `  {
    id: "${id}",
    title: "${data.title}",
    description: "${data.description.replace(/\n/g, ' ')}",
    location: "${data.location}",
    startDate: new Date("${data.start_date}"),
    endDate: new Date("${data.end_date}"),
    url: "${data.url}",
    type: "conference"${data.cfp_url ? `,\n    cfpUrl: "${data.cfp_url}"` : ""}
  },
];`;

    const updatedContent = content.replace(/\];\s*$/, newEvent);
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✅ Added event: ${id}`);
}

function processCreator(data: any) {
    const filePath = path.join("src/config/creators.ts");
    const content = fs.readFileSync(filePath, 'utf8');
    
    const id = slugify(data.name);
    
    if (content.includes(`id: "${id}"`)) {
        console.error(`Creator with ID ${id} already exists!`);
        process.exit(1);
    }

    // Basic sources object
    const sources: any = {};
    if (data.rss_feed) sources.feeds = [{ url: data.rss_feed, label: id, type: 'news' }];
    if (data.podcast_feed) sources.podcasts = [{ feed: data.podcast_feed, title: data.name, href: data.website || '', badge: 'Community' }];
    if (data.youtube_id) sources.youtube = [{ id: data.youtube_id, label: data.name }];

    const newCreator = `  {
    id: "${id}",
    name: "${data.name}",
    description: "${data.description.replace(/\n/g, ' ')}",
    avatar: "https://github.com/${data.twitter?.replace('@', '') || 'php'}.png", // Dynamic fallback
    ${data.website ? `website: "${data.website}",` : ""}
    ${data.twitter ? `twitter: "${data.twitter.replace('@', '')}",` : ""}
    sources: ${JSON.stringify(sources, null, 6).replace(/\}/, '      }')}
  },
];`;

    const updatedContent = content.replace(/\];\s*$/, newCreator);
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✅ Added creator: ${id}`);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
