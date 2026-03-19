import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const news = await getCollection('news');
  const sorted = news.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'phponline.dev | The PHP Community Pulse',
    description: 'The modern homepage for the PHP community. Aggregating the best news, RFCs, podcasts, and articles.',
    site: context.site || 'https://www.phponline.dev',
    items: sorted.slice(0, 50).map((item) => ({
      title: item.data.title || 'Untitled',
      pubDate: item.data.pubDate,
      description: item.data.content?.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 200) + '...',
      link: `/news/${item.id}`,
    })),
    customData: `<language>en-us</language>`,
  });
}
