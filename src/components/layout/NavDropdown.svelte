<script lang="ts">
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";

    interface Props {
        label: string;
        items: { name: string; href: string }[];
        currentPath: string;
    }

    let { label, items, currentPath } = $props<Props>();

    let isOpen = $state(false);
    let container: HTMLDivElement;

    function toggle() {
        isOpen = !isOpen;
    }

    function close() {
        isOpen = false;
    }

    // Close on click outside
    function handleClickOutside(event: MouseEvent) {
        if (container && !container.contains(event.target as Node)) {
            close();
        }
    }

    // Close on Escape key
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            close();
        }
    }

    onMount(() => {
        window.addEventListener("click", handleClickOutside);
        window.addEventListener("keydown", handleKeydown);
        return () => {
            window.removeEventListener("click", handleClickOutside);
            window.removeEventListener("keydown", handleKeydown);
        };
    });

    const isActive = $derived(
        items.some(
            (item) =>
                currentPath === item.href ||
                (currentPath.startsWith(item.href) && item.href !== "/"),
        ),
    );
</script>

<div class="relative inline-block text-left" bind:this={container}>
    <button
        type="button"
        onclick={toggle}
        class="flex items-center gap-1.5 text-sm font-bold transition-all py-2 focus:outline-hidden {isActive ? 'text-red-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
        aria-expanded={isOpen}
        aria-haspopup="true"
    >
        {label}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
        >
            <path d="m6 9 6 6 6-6"></path>
        </svg>
    </button>

    {#if isOpen}
        <div
            class="absolute left-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden"
            transition:fly={{ y: 10, duration: 200 }}
            role="menu"
            aria-orientation="vertical"
        >
            <div class="py-2 px-2 space-y-1">
                {#each items as item}
                    <a
                        href={item.href}
                        onclick={close}
                        class="block px-4 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath === item.href ? 'bg-red-50 dark:bg-red-950/20 text-red-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}"
                        role="menuitem"
                    >
                        {item.name}
                    </a>
                {/each}
            </div>
        </div>
    {/if}
</div>
