import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const issueId = process.argv[2];

if (!issueId) {
    console.error("Please provide an issue ID: bun scripts/pull-issue.ts <issue-number>");
    process.exit(1);
}

try {
    console.log(`🔍 Fetching issue #${issueId}...`);
    const issueRaw = execSync(`gh issue view ${issueId} --json body,labels,title`, { encoding: "utf8" });
    const issue = JSON.parse(issueRaw);

    const isEvent = issue.labels.some((l: any) => l.name === 'event-submission' || l.name === 'event') || 
                    issue.title.includes('[Event]') || 
                    issue.body.includes('### Event Title');
    const isCreator = issue.labels.some((l: any) => l.name === 'creator-submission' || l.name === 'creator') || 
                      issue.title.includes('[Creator]') || 
                      issue.body.includes('### Creator Name');

    if (!isEvent && !isCreator) {
        console.error("Could not determine if this is an event or creator submission based on labels or title.");
        process.exit(1);
    }

    const issueType = isEvent ? 'event' : 'creator';
    console.log(`📌 Detected issue type: ${issueType}`);

    const data = parseIssueBody(issue.body, issueType);
    
    console.log("\n--- Submission Overview ---");
    console.log(`Type: ${issueType.toUpperCase()}`);
    for (const [key, value] of Object.entries(data)) {
        console.log(`${key}: ${value}`);
    }
    console.log("---------------------------\n");

    const confirm = await askConfirmation("Do you want to process this submission?");
    if (!confirm) {
        console.log("Operation cancelled.");
        process.exit(0);
    }

    const edit = await askConfirmation("Do you want to edit the data before processing?");
    let finalData = data;
    if (edit) {
        finalData = await editData(data);
    }

    // Ensure tmp directory exists
    if (!fs.existsSync("tmp")) {
        fs.mkdirSync("tmp");
    }

    const jsonPath = path.join("tmp", `issue-${issueId}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(finalData, null, 2));

    console.log(`✅ Parsed issue data to ${jsonPath}`);
    console.log(`🚀 Processing ${issueType} submission...`);

    // Run the existing process-issue script
    execSync(`ISSUE_TYPE=${issueType} ISSUE_JSON_PATH=${jsonPath} bun scripts/process-issue.ts`, { stdio: "inherit" });

    console.log(`🔍 Running validation...`);
    execSync(`bun run validate-config`, { stdio: "inherit" });

    console.log(`✨ Local process complete!`);
    console.log(`📝 Don't forget to create a new branch and commit your changes.`);

} catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
}

async function askConfirmation(question: string): Promise<boolean> {
    const readline = require('node:readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question(`${question} (y/n): `, (answer: string) => {
            readline.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}

async function editData(data: any): Promise<any> {
    const tmpFile = path.join("tmp", `edit-${Date.now()}.json`);
    if (!fs.existsSync("tmp")) fs.mkdirSync("tmp");
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));

    const editor = process.env.EDITOR || "vi";
    console.log(`Opening ${editor} to edit data...`);
    
    try {
        execSync(`${editor} ${tmpFile}`, { stdio: "inherit" });
        const editedRaw = fs.readFileSync(tmpFile, "utf8");
        const editedData = JSON.parse(editedRaw);
        fs.unlinkSync(tmpFile);
        return editedData;
    } catch (e) {
        console.error("Error editing data or parsing JSON. Using original data.");
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        return data;
    }
}

function parseIssueBody(body: string, type: 'event' | 'creator') {
    const sections = body.split("### ");
    const rawData: Record<string, string> = {};

    for (const section of sections) {
        if (!section.trim()) continue;
        const lines = section.split("\n");
        const key = lines[0].trim();
        const value = lines.slice(1).join("\n").trim();
        
        if (value && value !== "_No response_") {
            rawData[key] = value;
        }
    }

    const mapping: Record<string, Record<string, string>> = {
        event: {
            "Event Title": "title",
            "Location": "location",
            "Start Date": "start_date",
            "End Date": "end_date",
            "Event Website": "url",
            "Description": "description",
            "CFP URL (Optional)": "cfp_url"
        },
        creator: {
            "Creator Name": "name",
            "Description": "description",
            "Avatar URL": "avatar_url",
            "Website / Portfolio": "website",
            "RSS Feed URL (Optional)": "rss_feed",
            "YouTube Channel ID (Optional)": "youtube_id",
            "Podcast RSS Feed (Optional)": "podcast_feed",
            "Twitter Handle (Optional)": "twitter"
        }
    };

    const result: Record<string, any> = {};
    const typeMapping = mapping[type];

    for (const [label, key] of Object.entries(typeMapping)) {
        if (rawData[label]) {
            result[key] = rawData[label];
        }
    }

    // Special case for YouTube ID (sometimes people put @username, but we might need the ID)
    // The current script doesn't handle this, so we'll just pass it through as is for now.

    return result;
}
