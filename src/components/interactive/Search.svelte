<script lang="ts">
    import { onMount } from "svelte";

    let query = $state("");
    let results = $state([]);
    let isReady = $state(false);
    let pagefind = $state(null);
    let highlightedIndex = $state(-1);
    let error = $state(null);
    const isDev = import.meta.env.DEV;

    onMount(async () => {
        // Skip in dev mode to avoid noisy 404s in the console
        if (isDev) {
            error = "Search unavailable in dev mode";
            return;
        }

        try {
            // Use a variable to prevent Vite from statically analyzing the import path
            const pagefindPath = "/pagefind/pagefind.js";
            // @ts-ignore
            pagefind = await import(/* @vite-ignore */ pagefindPath);
            await pagefind.options({
                // Optional: Configure ranking or metadata here
            });
            isReady = true;
        } catch (e) {
            error = "Search failed to load";
            console.warn(
                "Pagefind not found. Search is disabled in dev mode unless you build.",
            );
        }
    });

    async function handleSearch() {
        if (!isReady || query.length < 2) {
            results = [];
            highlightedIndex = -1;
            return;
        }

        // Use the locally stored pagefind instance instead of window
        const search = await pagefind.search(query);
        results = await Promise.all(
            search.results.slice(0, 5).map((r) => r.data()),
        );
        highlightedIndex = -1;
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (results.length === 0) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            highlightedIndex = (highlightedIndex + 1) % results.length;
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            highlightedIndex =
                (highlightedIndex - 1 + results.length) % results.length;
        } else if (event.key === "Enter") {
            if (highlightedIndex >= 0) {
                window.location.href = results[highlightedIndex].url;
            }
        } else if (event.key === "Escape") {
            results = [];
            highlightedIndex = -1;
            query = "";
        }
    }
</script>

<div class="relative w-full max-w-sm">
    <div class="relative group/search">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-red-600 dark:group-focus-within/search:text-red-500 transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
            type="text"
            bind:value={query}
            oninput={handleSearch}
            onkeydown={handleKeyDown}
            disabled={!isReady}
            placeholder={isReady ? "Search stories, RFCs..." : "Initializing..."}
            class="w-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 border border-slate-200/60 dark:border-slate-700/50 rounded-full pl-11 pr-5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600/20 dark:focus:ring-red-500/20 focus:border-red-600 dark:focus:border-red-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
        />
        <div class="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
            <kbd class="hidden font-sans px-2 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">⌘K</kbd>
        </div>
    </div>

    {#if results.length > 0}
        <div class="absolute top-full right-0 mt-3 w-screen max-w-md bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 transition-colors duration-300">
            <div class="p-3 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <span class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Results</span>
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{results.length} found</span>
            </div>
            <ul class="divide-y divide-slate-50 dark:divide-slate-800/50 max-h-[400px] overflow-y-auto p-2">
                {#each results as result, i}
                    <li>
                        <a 
                            href={result.url} 
                            class="block p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group {highlightedIndex === i ? 'bg-slate-50 dark:bg-slate-800/50' : ''}"
                        >
                            <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors leading-tight {highlightedIndex === i ? 'text-red-600 dark:text-red-500' : ''}">
                                {@html result.meta.title}
                            </h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                {@html result.excerpt}
                            </p>
                        </a>
                    </li>
                {/each}
            </ul>
        </div>
    {:else if query.length >= 2 && isReady}
        <div class="absolute top-full right-0 mt-3 w-screen max-w-md bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 text-center z-50 transition-colors duration-300">
            <div class="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/><line x1="9" y1="9" x2="13" y2="13"/><line x1="13" y1="9" x2="9" y2="13"/></svg>
            </div>
            <p class="text-slate-900 dark:text-white font-bold mb-1">No results found</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">We couldn't find anything matching "{query}"</p>
        </div>
    {/if}
</div>
