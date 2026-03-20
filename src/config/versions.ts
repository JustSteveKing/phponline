import { getCollection } from "astro:content";

const versions = await getCollection("versions");

export const PHP_STATUS = Object.fromEntries(
  versions.map((v) => [v.data.version, v.data]),
);
