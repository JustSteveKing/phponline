import { getCollection } from "astro:content";

const creators = await getCollection("creators");

export const CREATORS = creators.map(c => ({
    id: c.id,
    ...c.data
}));
