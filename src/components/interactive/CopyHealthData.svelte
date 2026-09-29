<script lang="ts">
    let { phpStatus } = $props();

    let copied = false;

    function copyToMarkdown() {
        let markdown = "| Version | Status | Released | Active Support Until | Security Support Until |\n";
        markdown += "| :--- | :--- | :--- | :--- | :--- |\n";

        Object.entries(phpStatus).forEach(([version, data]: [string, any]) => {
            markdown += `| PHP ${version} | ${data.status.toUpperCase()} | ${data.initialRelease} | ${data.activeUntil} | ${data.securityUntil} |\n`;
        });

        navigator.clipboard.writeText(markdown).then(() => {
            copied = true;
            setTimeout(() => (copied = false), 2000);
        });
    }
</script>

<button
    on:click={copyToMarkdown}
    class="group flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 text-ink-500 dark:text-ink-400 hover:text-php-600 dark:hover:text-php-600 hover:border-php-100 dark:hover:border-php-900/30 transition-all duration-300 shadow-sm"
>
    {#if copied}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
        <span class="text-meta font-semibold uppercase tracking-wide text-green-600 dark:text-green-500">Copied!</span>
    {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-12 transition-transform"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
        <span class="text-meta font-semibold uppercase tracking-wide">Copy as Markdown</span>
    {/if}
</button>
