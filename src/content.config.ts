import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { phpCommunityLoader } from '@/loaders/rss';
import { PHP_FEEDS } from '@/config/feeds';

export const collections = {
    news: defineCollection({
        loader: phpCommunityLoader(PHP_FEEDS),
        schema: z.object({
            title: z.string(),
            link: z.string().url(),
            pubDate: z.date(),
            content: z.string().optional(),
            source: z.string(),
            author: z.string().optional(),
        }),
    })
};