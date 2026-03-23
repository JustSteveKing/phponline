import type { PageMetadata } from "@/types";

export const PAGES: Record<string, PageMetadata> = {
    home: {
        title: "phponline.dev | The PHP Community Pulse",
        description: "The modern homepage for the PHP community. Aggregating the best news, RFCs, podcasts, and articles.",
        ogImage: "/og/home.png",
    },
    about: {
        title: "About | phponline.dev",
        description: "Learn about phponline.dev, our mission to unify the PHP community, and how you can contribute to the project.",
        ogImage: "/og/about.png",
    },
    archive: {
        title: "Community Archive | phponline.dev",
        description: "Browsing the collective knowledge of the PHP ecosystem. Our curated news and resource library.",
        ogImage: "/og/archive.png",
    },
    creators: {
        title: "Community Creators | phponline.dev",
        description: "Meet the people and organizations shaping the PHP ecosystem.",
        ogImage: "/og/creators.png",
    },
    events: {
        title: "PHP Community Events & Conferences | phponline.dev",
        description: "Stay updated with upcoming PHP and Laravel conferences, meetups, and workshops around the world.",
        ogImage: "/og/events.png",
    },
    health: {
        title: "PHP Versions Health Report | phponline.dev",
        description: "Check the support status, release dates, and security updates for all active PHP versions.",
        ogImage: "/og/home.png",
    },
    podcasts: {
        title: "PHP Podcasts | phponline.dev",
        description: "Tune in to the voices shaping the ecosystem. A curated directory of the best PHP podcasts for developers.",
        ogImage: "/og/podcasts.png",
    },
    rfcs: {
        title: "RFC Tracker | phponline.dev",
        description: "Monitor the evolution of PHP in real-time. Follow every RFC from discussion to implementation with our community tracker.",
        ogImage: "/og/rfcs.png",
    },
    videos: {
        title: "PHP Videos & Tutorials | phponline.dev",
        description: "Watch the latest PHP and Laravel tutorials from the community's top creators. Curated videos for modern developers.",
        ogImage: "/og/videos.png",
    },
};
