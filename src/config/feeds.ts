import fs from 'node:fs';
import path from 'node:path';
import type { Feed, Podcast, YouTubeChannel } from "@/types";

// We'll read the JSON files directly from the filesystem to avoid circular dependencies
// with the Astro content layer. This is safe as it's run during the build.
function getCreators() {
    const creatorsDir = path.resolve('./src/content/creators');
    if (!fs.existsSync(creatorsDir)) return [];
    
    return fs.readdirSync(creatorsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
            const content = fs.readFileSync(path.join(creatorsDir, file), 'utf-8');
            return {
                id: file.replace('.json', ''),
                data: JSON.parse(content)
            };
        });
}

const creators = getCreators();

export const PHP_FEEDS: Feed[] = creators.flatMap((creator) =>
  (creator.data.sources.feeds || []).map((feed: any) => ({
    ...feed,
    id: `${creator.id}-${feed.label}`,
    creatorId: creator.id,
  })),
);

export const PODCAST_FEEDS: Podcast[] = creators.flatMap((creator) =>
  (creator.data.sources.podcasts || []).map((podcast: any) => ({
    ...podcast,
    creatorId: creator.id,
  })),
);

export const YOUTUBE_CHANNELS: YouTubeChannel[] = creators.flatMap((creator) =>
  (creator.data.sources.youtube || []).map((yt: any) => ({
    ...yt,
    avatar: creator.data.avatar,
    creatorId: creator.id,
  })),
);
