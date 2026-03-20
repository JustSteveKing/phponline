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

    if (!fs.existsSync(issueDataPath)) {
        console.error(`Issue JSON file not found at ${issueDataPath}`);
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
    const id = slugify(data.title);
    const filePath = path.join("src/content/events", `${id}.json`);
    
    // Check if ID already exists
    if (fs.existsSync(filePath)) {
        console.error(`Event with ID ${id} already exists!`);
        process.exit(1);
    }

    const newEvent = {
        title: data.title,
        description: data.description.replace(/\n/g, ' '),
        location: data.location,
        startDate: data.start_date,
        endDate: data.end_date,
        url: data.url,
        type: "conference",
        creatorId: data.creator_id || undefined
    };

    fs.writeFileSync(filePath, JSON.stringify(newEvent, null, 2));
    console.log(`✅ Added event: ${id}`);
}

function processCreator(data: any) {
    const id = slugify(data.name);
    const filePath = path.join("src/content/creators", `${id}.json`);
    
    if (fs.existsSync(filePath)) {
        console.error(`Creator with ID ${id} already exists!`);
        process.exit(1);
    }

    // Basic sources object
    const sources: any = {};
    if (data.rss_feed) {
        sources.feeds = [{ url: data.rss_feed, label: id, type: 'news' }];
    }
    if (data.podcast_feed) {
        sources.podcasts = [{ 
            feed: data.podcast_feed, 
            title: data.name, 
            href: data.website || 'https://phponline.dev', 
            badge: 'Community' 
        }];
    }
    if (data.youtube_id) {
        sources.youtube = [{ id: data.youtube_id, label: data.name }];
    }

    if (!data.avatar_url) {
        console.error("Avatar URL is required!");
        process.exit(1);
    }

    // Resolve avatar using unavatar.io logic
    let avatar = data.avatar_url;
    
    // If it's a GitHub URL, use the unavatar github shortcut
    if (avatar.includes('github.com')) {
        const match = avatar.match(/github\.com\/([^/.]+)/);
        if (match) {
            avatar = `https://unavatar.io/github/${match[1]}`;
        }
    } else if (avatar.includes('@')) {
        // If it's an email (or looks like one), unavatar handles it
        avatar = `https://unavatar.io/${avatar}`;
    } else if (!avatar.startsWith('http')) {
        // If it's just a username/handle, assume github for now as fallback
        avatar = `https://unavatar.io/github/${avatar}`;
    }

    const newCreator = {
        name: data.name,
        description: data.description.replace(/\n/g, ' '),
        avatar: avatar,
        website: data.website || undefined,
        twitter: data.twitter ? data.twitter.replace('@', '') : undefined,
        sources: sources
    };

    fs.writeFileSync(filePath, JSON.stringify(newCreator, null, 2));
    console.log(`✅ Added creator: ${id}`);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
