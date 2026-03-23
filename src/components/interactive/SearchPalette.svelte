<script lang="ts">
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { liteClient as algoliasearch } from "algoliasearch/lite";
    import { PUBLIC_ALGOLIA_APP_ID, PUBLIC_ALGOLIA_SEARCH_KEY } from "astro:env/client";

    // Algolia Config from Astro Env
    const APP_ID = PUBLIC_ALGOLIA_APP_ID;
    const API_KEY = PUBLIC_ALGOLIA_SEARCH_KEY;
    const INDEX_NAME = "phponline_content";

    let isOpen = $state(false);
    let query = $state("");
    let results = $state<any[]>([]);
    let selectedIndex = $state(0);
    let isSearching = $state(false);

    const client = algoliasearch(APP_ID, API_KEY);

    async function search() {
        if (!query.trim()) {
            results = [];
            return;
        }

        isSearching = true;
        try {
            const { results: searchResults } = await client.search({
                requests: [
                    {
                        indexName: INDEX_NAME,
                        query: query,
                        hitsPerPage: 8,
                    },
                ],
            });
            results = (searchResults[0] as any).hits;
            selectedIndex = 0;
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            isSearching = false;
        }
    }

    $effect(() => {
        const timeout = setTimeout(search, 200);
        return () => clearTimeout(timeout);
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
            selectedIndex = (selectedIndex + 1) % results.length;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + results.length) % results.length;
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
        class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 sm:px-6 md:px-20"
        transition:fade={{ duration: 200 }}
        onclick={() => (isOpen = false)}
    >
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

        <div 
            class="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            transition:fly={{ y: -20, duration: 300 }}
            onclick={(e) => e.stopPropagation()}
        >
            <!-- Search Input -->
            <div class="relative flex items-center p-4 border-b border-slate-100 dark:border-slate-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input 
                    type="text"
                    bind:value={query}
                    placeholder="Search news, RFCs, creators..."
                    class="w-full bg-transparent border-none outline-hidden px-4 text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                    autofocus
                />
                <div class="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">ESC</span>
                </div>
            </div>

            <!-- Results -->
            <div class="max-h-[60vh] overflow-y-auto p-2">
                {#if results.length > 0}
                    {#each results as hit, i}
                        <a 
                            href={hit.url}
                            class="flex items-start gap-4 p-4 rounded-xl transition-all {selectedIndex === i ? 'bg-red-50 dark:bg-red-950/20 ring-1 ring-red-200 dark:ring-red-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
                            onmouseenter={() => (selectedIndex = i)}
                        >
                            {#if hit.image}
                                <img src={hit.image} alt="" class="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0" />
                            {:else}
                                <div class="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                    <span class="text-red-600 font-black uppercase text-xs">{hit.type[0]}</span>
                                </div>
                            {/if}
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-500">{hit.type}</span>
                                    {#if hit.source}
                                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {hit.source}</span>
                                    {/if}
                                </div>
                                <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{hit.title}</h4>
                                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{hit.description}</p>
                            </div>
                        </a>
                    {/each}
                {:else if query && !isSearching}
                    <div class="p-12 text-center">
                        <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </div>
                        <p class="text-slate-900 dark:text-white font-bold">No results found for "{query}"</p>
                        <p class="text-sm text-slate-500 mt-1">Try a different keyword or category.</p>
                    </div>
                {:else if !query}
                    <div class="p-8">
                        <h5 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Popular Categories</h5>
                        <div class="grid grid-cols-2 gap-2">
                            {#each ['Laravel', 'Symfony', 'Security', 'Internals'] as tag}
                                <button 
                                    class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-slate-300 hover:text-red-600 transition-all text-sm font-bold text-left"
                                    onclick={() => (query = tag)}
                                >
                                    <div class="w-2 h-2 rounded-full bg-red-500"></div>
                                    {tag}
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-black text-slate-400">↑↓</span>
                        <span class="text-[10px] font-bold text-slate-500">Navigate</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-black text-slate-400">↵</span>
                        <span class="text-[10px] font-bold text-slate-500">Select</span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-slate-400 italic">Search by</span>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/Algolia_logo.svg" alt="Algolia" class="h-3 opacity-50 grayscale" />
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
