import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as pf from "pagefind";
import type { AstroIntegration } from "astro";

/**
 * Build the search index from the pages that were just built.
 *
 * This replaces Algolia, which had failed in two independent ways and told
 * nobody about either. The index was only ever produced by `bun run
 * index-algolia`, which no workflow ran, so it held whatever somebody last
 * uploaded by hand. And the client needs PUBLIC_ALGOLIA_APP_ID and
 * PUBLIC_ALGOLIA_SEARCH_KEY at build time, which Cloudflare's build never
 * had, so the deployed bundle carried no credentials and the component
 * quietly resolved its client to null. Typing in the palette returned
 * nothing, with no error anywhere.
 *
 * Neither failure is available here. The index is written from dist by the
 * same build that produced dist, so it cannot drift from the site and there
 * is no key to leave unset. It also means nobody's search queries leave the
 * reader's browser, which for a community institution is worth having.
 */
export default function pagefind(): AstroIntegration {
  return {
    name: "pagefind",
    hooks: {
      // Imported at the top rather than in here. By astro:build:done Vite's
      // module runner is closed and a dynamic import throws, which is the
      // same trap the og-images integration hit.
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);

        const { index, errors } = await pf.createIndex({});

        if (!index) {
          throw new Error(`Could not create the search index: ${errors?.join(", ")}`);
        }

        await index.addDirectory({ path: outDir });

        const indexDir = path.join(outDir, "pagefind");
        await index.writeFiles({ outputPath: indexDir });
        await pf.close();

        // Pagefind ships its own search UI alongside the index. This site has
        // its own palette, so those bundles are a third of a megabyte nobody
        // will ever request.
        for (const unused of ["pagefind-ui.js", "pagefind-ui.css", "pagefind-modular-ui.js", "pagefind-modular-ui.css", "pagefind-component-ui.js", "pagefind-component-ui.css"]) {
            fs.rmSync(path.join(indexDir, unused), { force: true });
        }

        // addDirectory reports the files it walked, which is not the number
        // that ended up indexed: paginated listings opt out, and a page that
        // opts out leaves no fragment behind.
        const indexed = fs.readdirSync(path.join(indexDir, "fragment")).length;

        logger.info(`Search index: ${indexed} pages`);
      },
    },
  };
}
