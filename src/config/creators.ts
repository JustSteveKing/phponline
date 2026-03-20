import fs from 'node:fs';
import path from 'node:path';

function getCreators() {
    const creatorsDir = path.resolve('./src/content/creators');
    if (!fs.existsSync(creatorsDir)) return [];
    
    return fs.readdirSync(creatorsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
            const content = fs.readFileSync(path.join(creatorsDir, file), 'utf-8');
            return {
                id: file.replace('.json', ''),
                ...JSON.parse(content)
            };
        });
}

export const CREATORS = getCreators();
