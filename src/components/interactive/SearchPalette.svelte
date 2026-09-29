<script lang="ts">
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";

    let isOpen = $state(false);
    let query = $state("");
    let results = $state<any[]>([]);
    let selectedIndex = $state(0);
    let isSearching = $state(false);

    /**
     * Pagefind is loaded from the built output, not bundled.
     *
     * It does not exist until `astro build` has written it, so Vite must be
     * told to keep its hands off the import or a dev server fails to resolve
     * it and the whole component dies. In dev there is simply no search.
     */
    let pagefind: any = null;
    let unavailable = $state(false);

    async function loadPagefind() {
        if (pagefind) return pagefind;

        try {
            // Held in a variable on purpose. @vite-ignore is ignored for a
            // string literal, so Vite still tries to resolve the path at
            // build time and fails, because it will not exist until this
            // build has finished writing it.
            const entry = "/pagefind/pagefind.js";
            pagefind = await import(/* @vite-ignore */ entry);
            await pagefind.options({ excerptLength: 24 });
            return pagefind;
        } catch {
            unavailable = true;
            return null;
        }
    }

    /**
     * What kind of thing a result is, read from its path.
     *
     * Pagefind could carry this as page metadata, but that would mean a
     * data-pagefind-meta attribute on every template. The URL already says
     * it, and the URL is generated from the same ids the collections use.
     */
    function describe(url: string): { type: string; source?: string } {
        const parts = url.replace(/^\//, "").replace(/\/$/, "").split("/");

        switch (parts[0]) {
            case "news":
                return parts[1] === "topic"
                    ? { type: "Topic" }
                    : { type: "Article", source: parts[1] };
            case "podcasts":
                return { type: "Episode", source: parts[1] };
            case "videos":
                return { type: "Video", source: parts[1] === "watch" ? parts[2] : parts[1] };
            case "creators":
                return { type: "Creator" };
            case "rfcs":
                return { type: "RFC" };
            case "events":
                return { type: "Event" };
            default:
                return { type: "Page" };
        }
    }

    async function search() {
        if (!query.trim()) {
            results = [];
            return;
        }

        const pf = await loadPagefind();
        if (!pf) {
            results = [];
            return;
        }

        isSearching = true;
        try {
            const response = await pf.search(query);

            // Pagefind returns pointers; the payload is fetched per result,
            // which is what keeps the index cheap to load.
            const top = await Promise.all(
                response.results.slice(0, 8).map((r: any) => r.data()),
            );

            results = top.map((hit: any) => {
                const { type, source } = describe(hit.url);

                return {
                    url: hit.url,
                    title: hit.meta?.title ?? hit.url,
                    description: hit.excerpt?.replace(/<[^>]*>/g, "") ?? "",
                    image: hit.meta?.image,
                    type,
                    source,
                };
            });

            selectedIndex = 0;
        } catch (error) {
            console.error("Search error:", error);
            results = [];
        } finally {
            isSearching = false;
        }
    }

    // Debounce search
    let timeout: ReturnType<typeof setTimeout>;
    $effect(() => {
        if (query || query === "") {
            clearTimeout(timeout);
            timeout = setTimeout(search, 200);
        }
    });

    function handleKeydown(e: KeyboardEvent) {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            isOpen = !isOpen;
        }

        if (!isOpen) return;

        if (e.key === "Escape") {
            isOpen = false;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedIndex = results.length > 0 ? (selectedIndex + 1) % results.length : 0;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedIndex = results.length > 0 ? (selectedIndex - 1 + results.length) % results.length : 0;
        }

        if (e.key === "Enter" && results[selectedIndex]) {
            window.location.href = results[selectedIndex].url;
            isOpen = false;
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeydown);
        window.addEventListener("open-search", () => (isOpen = true));

        return () => {
            window.removeEventListener("keydown", handleKeydown);
            window.removeEventListener("open-search", () => (isOpen = true));
        };
    });
</script>

{#if isOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] px-4 sm:px-6 md:px-20"
        transition:fade={{ duration: 200 }}
        onclick={() => (isOpen = false)}
    >
        <div class="fixed inset-0 bg-ink-900/60 backdrop-blur-sm"></div>

        <div
            class="relative w-full max-w-2xl bg-white dark:bg-[var(--color-ink-900)] rounded-2xl shadow-2xl border border-ink-200 dark:border-ink-800 overflow-hidden"
            transition:fly={{ y: -20, duration: 300 }}
            onclick={(e) => e.stopPropagation()}
        >
            <!-- Search Input -->
            <div class="relative flex items-center p-4 border-b border-ink-100 dark:border-ink-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-ink-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                    type="text"
                    bind:value={query}
                    placeholder="Search news, RFCs, creators..."
                    class="w-full bg-transparent border-none outline-hidden px-4 text-lg font-medium text-ink-900 dark:text-white placeholder:text-ink-400"
                    autofocus
                />
                <div class="flex items-center gap-1.5 px-2 py-1 bg-ink-100 dark:bg-ink-800 rounded-md">
                    <span class="text-meta font-semibold text-ink-500 uppercase tracking-wide">ESC</span>
                </div>
            </div>

            <!-- Results -->
            <div class="max-h-[60vh] overflow-y-auto p-2">
                {#if results.length > 0}
                    {#each results as hit, i}
                        <a
                            href={hit.url}
                            class="flex items-start gap-4 p-4 rounded-xl transition-all {selectedIndex === i ? 'bg-php-50 dark:bg-php-950/20 ring-1 ring-php-200 dark:ring-php-900/50' : 'hover:bg-ink-50 dark:hover:bg-ink-800/50'}"
                            onmouseenter={() => (selectedIndex = i)}
                        >
                            {#if hit.image}
                                <img src={hit.image} alt={hit.title} loading="lazy" decoding="async" class="w-12 h-12 rounded-lg object-cover bg-ink-100 dark:bg-ink-800 shrink-0" />
                            {:else}
                                <div class="w-12 h-12 rounded-lg bg-php-100 dark:bg-php-900/20 flex items-center justify-center shrink-0">
                                    <span class="text-php-600 font-black uppercase text-xs">{hit.type[0]}</span>
                                </div>
                            {/if}
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-meta font-semibold uppercase tracking-wide text-php-600 dark:text-php-400">{hit.type}</span>
                                    {#if hit.source}
                                        <span class="text-meta font-medium text-ink-400 uppercase tracking-wide">• {hit.source}</span>
                                    {/if}
                                </div>
                                <h4 class="text-sm font-bold text-ink-900 dark:text-white mb-1 line-clamp-1">{hit.title}</h4>
                                <p class="text-xs text-ink-500 dark:text-ink-400 line-clamp-1">{hit.description}</p>
                            </div>
                        </a>
                    {/each}
                {:else if query && !isSearching}
                    <div class="p-12 text-center">
                        <div class="w-16 h-16 bg-ink-50 dark:bg-ink-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ink-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </div>
                        <p class="text-ink-900 dark:text-white font-bold">No results found for "{query}"</p>
                        <p class="text-sm text-ink-500 mt-1">Try a different keyword or category.</p>
                    </div>
                {/if}
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/50 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-1.5">
                        <span class="text-meta font-semibold text-ink-400">↑↓</span>
                        <span class="text-meta font-medium text-ink-500">Navigate</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-meta font-semibold text-ink-400">↵</span>
                        <span class="text-meta font-medium text-ink-500">Select</span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-meta font-medium text-ink-400">Searching this site only</span>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    :global(body.search-open) {
        overflow: hidden;
    }
</style>
