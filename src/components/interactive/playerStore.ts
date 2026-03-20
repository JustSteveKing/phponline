import { writable } from 'svelte/store';

export interface Track {
    title: string;
    podcast: string;
    audioUrl: string;
}

export const currentTrack = writable<Track | null>(null);
export const isPlaying = writable(false);
export const progress = writable(0);
export const currentTime = writable(0);
export const duration = writable(0);

export function playTrack(track: Track) {
    currentTrack.set(track);
    isPlaying.set(true);
}

export function togglePlayback() {
    isPlaying.update(p => !p);
}
