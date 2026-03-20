import fs from 'node:fs';
import path from 'node:path';

const versionColors = {
    active: "text-green-600",
    security: "text-amber-600",
    eol: "text-red-600",
};

function getVersions() {
    const filePath = path.resolve('./src/content/versions.json');
    if (!fs.existsSync(filePath)) return {};
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    return Object.fromEntries(
        data.map((v: any) => [v.version, {
            ...v,
            color: versionColors[v.status as keyof typeof versionColors] || "text-slate-600"
        }])
    );
}

export const PHP_STATUS = getVersions();
