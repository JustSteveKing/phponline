import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";

async function generate() {
    console.log("🚀 Generating Favicons...");
    
    // The "ONLINE" part of the logo is roughly from x=48 to x=90
    // We'll create a square version centered on the red box
    const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42" fill="none">
    <rect width="42" height="42" rx="8" fill="#e53e3e"/>
    <path fill="#fff" d="M11.92 18.201c.325-2.32-.717-3.673-2.323-3.673-1.545 0-2.89 1.265-3.203 3.5-.327 2.313.718 3.656 2.332 3.656 1.537 0 2.874-1.248 3.195-3.483m-1.246-.173c-.211 1.51-.955 2.353-1.901 2.353-.868 0-1.346-.74-1.135-2.18.209-1.51.958-2.37 1.91-2.37.874 0 1.325.765 1.126 2.197M19.124 14.624h-1.247l-.616 4.38h-.05l-1.944-4.38h-1.1l-.983 6.965h1.253l.622-4.384h.046l1.953 4.384h1.082zM19.99 21.589h3.794l.173-1.214h-2.54l.81-5.751h-1.253zM27.665 14.624h-1.253l-.984 6.965h1.253zM34.468 14.624H33.22l-.617 4.38h-.049l-1.945-4.38h-1.099l-.984 6.965h1.253l.622-4.384h.046l1.954 4.384h1.082zM35.334 21.589h4.005l.173-1.214H36.76l.232-1.663h2.535l.173-1.215h-2.534l.231-1.66h2.74l.174-1.213h-3.993z" transform="translate(-2, 3)"/>
</svg>`;

    // Save SVG
    fs.writeFileSync("public/favicon.svg", faviconSvg);
    console.log("✅ favicon.svg generated");

    // Generate ICO (32x32)
    const resvg = new Resvg(faviconSvg, {
        fitTo: {
            mode: 'width',
            value: 32,
        },
    });
    const pngBuffer = resvg.render().asPng();
    fs.writeFileSync("public/favicon.ico", pngBuffer);
    console.log("✅ favicon.ico generated");
}

generate();
