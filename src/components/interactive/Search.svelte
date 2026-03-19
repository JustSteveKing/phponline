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

<div class="relative w-full max-w-md">
    <input
        type="text"
        bind:value={query}
        oninput={handleSearch}
        onkeydown={handleKeyDown}
        disabled={!isReady || isDev}
        placeholder={isReady ? "Search PHP news..." : (error || "Initializing search...")}
        class="w-full bg-slate-100 disabled:opacity-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
    />

    {#if results.length > 0}
        <div class="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
            <ul class="divide-y divide-slate-50">
                {#each results as result, i}
                    <li>
                        <a 
                            href={result.url} 
                            class="block p-4 hover:bg-slate-50 transition-colors group {highlightedIndex === i ? 'bg-slate-50' : ''}"
                        >
                            <h4 class="font-bold text-slate-900 group-hover:text-blue-600 transition-colors {highlightedIndex === i ? 'text-blue-600' : ''}">
                                {@html result.meta.title}
                            </h4>
                            <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                                {@html result.excerpt}
                            </p>
                        </a>
                    </li>
                {/each}
            </ul>
        </div>
    {:else if query.length >= 2 && isReady}
        <div class="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-4 text-center z-50">
            <p class="text-sm text-slate-500">No results found for "{query}"</p>
        </div>
    {/if}
</div>
