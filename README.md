# PHP Online (phponline.dev)

The modern homepage for the PHP community. `phponline.dev` is a central pulse for the PHP ecosystem, aggregating high-quality news, RFCs, podcasts, and videos from trusted community sources into a unified, searchable, and highly readable format.

## 🚀 Mission

We exist to highlight the work of creators, contributors, and maintainers. By providing a "magazine-style" experience, we allow developers to quickly scan what's trending and track language evolution without the noise of traditional social media.

## 🛠️ Technology Stack

- **Framework**: [Astro 6.0](https://astro.build) (Content Layer)
- **Interactive**: [Svelte 5](https://svelte.dev)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com)
- **Search**: [Pagefind](https://pagefind.app) (Static Search)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Runtime**: [Bun](https://bun.sh)

## 📂 Project Structure

- `src/content/`: JSON-based content for creators and events.
- `src/config/`: Configuration for feeds, site metadata, and page definitions.
- `scripts/`: Automation scripts for processing submissions, validating config, and generating OG images.
- `public/og/`: Generated Open Graph images for social sharing.

## 🤝 How to Contribute

We love community contributions! There are several ways to get involved:

### 1. Submit a Creator or Event
The easiest way to contribute is via our [GitHub Issue Templates](https://github.com/juststeveking/phponline.dev/issues/new/choose).
- **Creators**: Add your blog, podcast, or YouTube channel.
- **Events**: Add a conference, meetup, or workshop to the community calendar.

*Submissions are automatically processed via GitHub Actions and turned into Pull Requests.*

### 2. Code Contributions
1. **Clone the repository**:
   ```bash
   git clone https://github.com/juststeveking/phponline.dev.git
   cd phponline.dev
   ```
2. **Install dependencies**:
   ```bash
   bun install
   ```
3. **Start the development server**:
   ```bash
   bun run dev
   ```
4. **Build the project**:
   ```bash
   bun run build
   ```

### 3. Scripts
- `bun run prepare`: Runs validation, OG generation, and a full build.
- `bun run generate-og`: Generates fresh OG images for all pages and content.
- `bun run validate-config`: Ensures all JSON content matches expected schemas.

## 🛡️ License

This project is open-source and built for the community. See the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the PHP Community.
