import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import Parser from "rss-parser";
import { PHP_FEEDS } from "../src/config/feeds";

const STATIC_PAGES = [
    { id: "home", title: "The PHP Community Pulse", source: "Home" },
    { id: "archive", title: "Community Archive", source: "Resources" },
    { id: "rfcs", title: "RFC Tracker", source: "Core Dev" },
    { id: "podcasts", title: "Community Podcasts", source: "Audio" },
    { id: "about", title: "About the Project", source: "Project" },
];

const parser = new Parser();

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

async function generate() {
    console.log("🚀 Starting OG Image Generation...");
    
    // Using a reliable TTF font source from a CDN
    const fontUrl = "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-900-normal.woff";
    const fontData = await fetch(fontUrl).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch font: ${res.statusText}`);
        return res.arrayBuffer();
    });
    
    if (!fs.existsSync("public/og")) {
        fs.mkdirSync("public/og", { recursive: true });
    }

    // 1. Generate for Static Pages (Parallel)
    console.log("📄 Generating for Static Pages...");
    await Promise.all(STATIC_PAGES.map(page => 
        generateImage(page.id, page.title, page.source, fontData)
    ));

    // 2. Generate for Podcasts
    console.log("🎙️ Generating for Podcasts...");
    const { PODCAST_FEEDS } = await import("../src/config/feeds");
    await Promise.all(PODCAST_FEEDS.map(podcast => 
        generateImage(`podcasts/${slugify(podcast.title)}`, podcast.title, "Podcast", fontData)
    ));

    // 3. Generate for Feed Items
    for (const feed of PHP_FEEDS) {
        try {
            console.log(`📡 Fetching ${feed.label}...`);
            const data = await parser.parseURL(feed.url);
            
            // Process feed items in parallel
            const itemPromises = data.items.map(async (item) => {
                const title = item.title || "Untitled";
                const source = feed.label;
                
                // Generate ID (Match rss.ts logic)
                let id = "";
                try {
                    const baseUrl = feed.url.startsWith('http') ? new URL(feed.url).origin : "https://phponline.dev";
                    const urlObj = new URL(item.link || "", baseUrl);
                    let pathSlug = urlObj.pathname.split('/').filter(Boolean).join('-');
                    if (!pathSlug || pathSlug.includes('index.php')) {
                        pathSlug = urlObj.hash ? urlObj.hash.replace('#', '') : slugify(title);
                    }
                    pathSlug = pathSlug.replace(/[\[\]\(\)]/g, '');
                    id = `${slugify(source)}/${pathSlug}`;
                } catch (e) {
                    id = `${slugify(source)}/${slugify(title)}`;
                }

                return generateImage(id, title, source, fontData);
            });

            await Promise.all(itemPromises);
        } catch (e) {
            console.error(`❌ Failed feed ${feed.label}:`, e);
        }
    }
    console.log("✅ OG Image Generation Complete!");
}

async function generateImage(id: string, title: string, source: string, fontData: ArrayBuffer) {
    const filePath = path.join("public/og", `${id}.png`);
    const dirPath = path.dirname(filePath);
    
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    // Skip if already exists
    if (fs.existsSync(filePath)) return;

    console.log(`🎨 Generating: ${id}`);

    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    backgroundColor: '#0f172a',
                    backgroundImage: 'radial-gradient(circle at top right, #e53e3e33, transparent), radial-gradient(circle at bottom left, #e53e3e11, transparent)',
                    padding: '80px',
                    fontFamily: 'Inter',
                },
                children: [
                    {
                        type: 'div',
                        props: {
                            style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: { backgroundColor: '#e53e3e', padding: '8px 16px', borderRadius: '100px', color: 'white', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' },
                                        children: source,
                                    },
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: { color: '#94a3b8', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' },
                                        children: 'phponline.dev',
                                    },
                                },
                            ],
                        },
                    },
                    {
                        type: 'h1',
                        props: {
                            style: { fontSize: '64px', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '20px', display: 'flex' },
                            children: title,
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            style: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px' },
                            children: [
                                { type: 'div', props: { style: { width: '40px', height: '2px', backgroundColor: '#e53e3e' } } },
                                { type: 'div', props: { style: { color: '#e53e3e', fontSize: '20px', fontWeight: 'bold' }, children: 'The pulse of the PHP ecosystem' } }
                            ]
                        }
                    }
                ],
            },
        },
        {
            width: 1200,
            height: 630,
            fonts: [{ name: 'Inter', data: fontData, weight: 400, style: 'normal' }],
        }
    );

    const resvg = new Resvg(svg);
    const pngBuffer = resvg.render().asPng();
    fs.writeFileSync(filePath, pngBuffer);
}

generate();
