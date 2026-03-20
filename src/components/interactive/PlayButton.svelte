<script lang="ts">
    import {
        currentTrack,
        isPlaying,
        playTrack,
        togglePlayback,
        progress,
    } from "./playerStore";

    export let title: string;
    export let podcast: string;
    export let audioUrl: string;

    $: isCurrent = $currentTrack?.audioUrl === audioUrl;
    $: active = isCurrent && $isPlaying;
    $: currentProgress = isCurrent ? $progress : 0;

    function handlePlay() {
        if (isCurrent) {
            togglePlayback();
        } else {
            playTrack({ title, podcast, audioUrl });
        }
    }
</script>

<button
    on:click|preventDefault={handlePlay}
    class="group relative flex items-center gap-3 px-6 py-3 rounded-full font-black uppercase tracking-[0.15em] text-[10px] transition-all duration-300 active:scale-95 overflow-hidden border-2 {active
        ? 'bg-slate-900 border-slate-900 text-white'
        : 'bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white'}"
    aria-label={active ? "Pause" : "Play"}
>
    <!-- Progress Background Fill -->
    {#if isCurrent}
        <div
            class="absolute left-0 top-0 bottom-0 bg-white/10 dark:bg-black/20 pointer-events-none transition-all duration-300"
            style="width: {currentProgress}%"
        ></div>
    {/if}

    <div class="relative z-10 flex items-center gap-3">
        {#if active}
            <div class="flex items-end gap-0.5 h-3">
                <div
                    class="w-0.5 bg-current animate-[pulse_0.8s_infinite]"
                ></div>
                <div
                    class="w-0.5 bg-current animate-[pulse_1.2s_infinite]"
                ></div>
                <div class="w-0.5 bg-current animate-[pulse_1s_infinite]"></div>
            </div>
            <span>Playing</span>
        {:else}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="transition-transform group-hover:scale-125"
                ><path d="M8 5v14l11-7z" /></svg
            >
            <span>{isCurrent ? "Continue" : "Listen Now"}</span>
        {/if}
    </div>

    {#if active}
        <div
            class="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"
        ></div>
    {/if}
</button>

<style>
    @keyframes pulse {
        0%,
        100% {
            height: 30%;
        }
        50% {
            height: 100%;
        }
    }
    @keyframes shimmer {
        100% {
            transform: translateX(100%);
        }
    }
</style>
