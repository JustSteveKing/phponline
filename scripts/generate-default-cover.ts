import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";

async function generate() {
    console.log("🚀 Generating Default PHP Cover...");
    
    const fontUrl = "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-900-normal.woff";
    const fontData = await fetch(fontUrl).then(res => res.arrayBuffer());
    
    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0f172a',
                    backgroundImage: 'radial-gradient(circle at top right, #e53e3e33, transparent), radial-gradient(circle at bottom left, #e53e3e11, transparent)',
                    fontFamily: 'Inter',
                    position: 'relative',
                    overflow: 'hidden',
                },
                children: [
                    // Decorative PHP elephant-like shape (simplified)
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                right: '-100px',
                                bottom: '-50px',
                                width: '500px',
                                height: '500px',
                                backgroundColor: '#e53e3e',
                                borderRadius: '100%',
                                opacity: 0.1,
                                filter: 'blur(100px)',
                            }
                        }
                    },
                    {
                        type: 'div',
                        props: {
                            style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: { backgroundColor: '#e53e3e', padding: '12px 24px', borderRadius: '100px', color: 'white', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em' },
                                        children: 'PHP ECOSYSTEM',
                                    },
                                },
                                {
                                    type: 'h1',
                                    props: {
                                        style: { fontSize: '80px', fontWeight: 900, color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' },
                                        children: 'phponline.dev',
                                    },
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: { height: '4px', width: '80px', backgroundColor: '#e53e3e', marginTop: '10px' }
                                    }
                                }
                            ],
                        },
                    },
                ],
            },
        },
        {
            width: 1200,
            height: 800, // Slightly taller for better card compatibility
            fonts: [{ name: 'Inter', data: fontData, weight: 900, style: 'normal' }],
        }
    );

    const resvg = new Resvg(svg);
    const pngBuffer = resvg.render().asPng();
    
    const outputPath = path.join("src/assets", "default-php-cover.png");
    fs.writeFileSync(outputPath, pngBuffer);
    
    console.log(`✅ Default cover generated at: ${outputPath}`);
}

generate();
