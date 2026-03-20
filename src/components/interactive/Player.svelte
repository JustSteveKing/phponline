<script lang="ts">
    import {
        currentTrack,
        isPlaying,
        togglePlayback,
        progress,
        currentTime,
        duration,
    } from "./playerStore";
    import { fade } from "svelte/transition";

    let audio: HTMLAudioElement;

    $: if (audio && $currentTrack) {
        if ($isPlaying) {
            audio.play().catch(() => {
                isPlaying.set(false);
            });
        } else {
            audio.pause();
        }
    }

    function handleTimeUpdate() {
        if (!audio) return;
        currentTime.set(audio.currentTime);
        progress.set((audio.currentTime / audio.duration) * 100);
    }

    function handleLoadedMetadata() {
        if (!audio) return;
        duration.set(audio.duration);
    }

    function handleSeek(e: MouseEvent) {
        if (!audio) return;
        const rect = (
            e.currentTarget as HTMLDivElement
        ).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (x / width) * $duration;
        audio.currentTime = newTime;
    }

    function formatTime(time: number) {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
</script>

{#if $currentTrack}
    <div
        transition:fade
        class="fixed bottom-0 left-0 right-0 z-100 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-slate-800 shadow-2xl safe-area-inset-bottom"
    >
        <!-- Progress Bar -->
        <div
            class="absolute -top-1 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 cursor-pointer group"
            on:click={handleSeek}
        >
            <div
                class="h-full bg-red-600 transition-all duration-100 relative"
                style="width: {$progress}%"
            >
                <div
                    class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full scale-0 group-hover:scale-100 transition-transform"
                ></div>
            </div>
        </div>

        <div
            class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6"
        >
            <!-- Track Info -->
            <div class="flex items-center gap-4 min-w-0 flex-1">
                <div
                    class="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shrink-0"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M9 18V5l12-2v13" /><circle
                            cx="6"
                            cy="18"
                            r="3"
                        /><circle cx="18" cy="16" r="3" />
                    </svg>
                </div>
                <div class="min-w-0">
                    <h4
                        class="font-black text-slate-900 dark:text-white text-sm truncate uppercase tracking-tight"
                    >
                        {$currentTrack.title}
                    </h4>
                    <p
                        class="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-500"
                    >
                        {$currentTrack.podcast}
                    </p>
                </div>
            </div>

            <!-- Controls -->
            <div class="flex flex-col items-center gap-1">
                <div class="flex items-center gap-6">
                    <button
                        class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        on:click={() => (audio.currentTime -= 15)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path d="M9 14 4 9l5-5" /><path
                                d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"
                            /></svg
                        >
                    </button>

                    <button
                        on:click={togglePlayback}
                        class="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                        {#if $isPlaying}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                ><rect x="6" y="4" width="4" height="16" /><rect
                                    x="14"
                                    y="4"
                                    width="4"
                                    height="16"
                                /></svg
                            >
                        {:else}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                class="ml-1"><path d="M8 5v14l11-7z" /></svg
                            >
                        {/if}
                    </button>

                    <button
                        class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        on:click={() => (audio.currentTime += 30)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path d="m15 14 5-5-5-5" /><path
                                d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"
                            /></svg
                        >
                    </button>
                </div>
                <div
                    class="flex items-center gap-2 text-[10px] font-black text-slate-400 tabular-nums uppercase tracking-widest"
                >
                    <span>{formatTime($currentTime)}</span>
                    <span class="opacity-30">/</span>
                    <span>{formatTime($duration)}</span>
                </div>
            </div>

            <!-- Volume / Close (Hidden on Mobile) -->
            <div class="hidden md:flex items-center justify-end gap-4 flex-1">
                <button
                    on:click={() => currentTrack.set(null)}
                    class="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
                    >
                </button>
            </div>
        </div>

        <audio
            bind:this={audio}
            src={$currentTrack.audioUrl}
            on:timeupdate={handleTimeUpdate}
            on:loadedmetadata={handleLoadedMetadata}
            on:ended={() => isPlaying.set(false)}
        ></audio>
    </div>
{/if}

<style>
    .safe-area-inset-bottom {
        padding-bottom: env(safe-area-inset-bottom);
    }
</style>
