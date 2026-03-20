import fs from 'node:fs';
import path from 'node:path';

function getEvents() {
    const eventsDir = path.resolve('./src/content/events');
    if (!fs.existsSync(eventsDir)) return [];
    
    return fs.readdirSync(eventsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
            const content = fs.readFileSync(path.join(eventsDir, file), 'utf-8');
            const data = JSON.parse(content);
            return {
                id: file.replace('.json', ''),
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
            };
        });
}

export const EVENTS = getEvents();
