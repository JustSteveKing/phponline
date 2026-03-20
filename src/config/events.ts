import { getCollection } from "astro:content";

const events = await getCollection("events");

export const EVENTS = events.map(e => ({
    id: e.id,
    ...e.data
}));
