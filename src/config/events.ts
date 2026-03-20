import type { CommunityEvent } from "@/types";

export const EVENTS: CommunityEvent[] = [
  {
    id: "laracon-eu-2026",
    title: "Laracon EU 2026",
    description: "The official European Laravel conference. Join developers from all over the world for two days of learning and networking.",
    location: "Amsterdam, Netherlands",
    startDate: new Date("2026-02-05"),
    endDate: new Date("2026-02-06"),
    url: "https://laracon.eu",
    type: "conference",
    creatorId: "laravel"
  },
  {
    id: "php-uk-2026",
    title: "PHP UK Conference 2026",
    description: "The 20th anniversary of the UK's largest PHP conference. A community-run event focusing on everything PHP.",
    location: "London, UK",
    startDate: new Date("2026-02-19"),
    endDate: new Date("2026-02-20"),
    url: "https://phpuk.org",
    type: "conference"
  },
  {
    id: "php-tek-2026",
    title: "php[tek] 2026",
    description: "The longest-running annual PHP conference in the United States.",
    location: "Chicago, IL",
    startDate: new Date("2026-05-19"),
    endDate: new Date("2026-05-21"),
    url: "https://tek.phparch.com",
    type: "conference"
  },
  {
    id: "laracon-us-2026",
    title: "Laracon US 2026",
    description: "The flagship Laravel conference in the United States. Experience the latest Laravel releases and community announcements.",
    location: "Dallas, TX",
    startDate: new Date("2026-07-15"),
    endDate: new Date("2026-07-16"),
    url: "https://laracon.us",
    type: "conference",
    creatorId: "laravel"
  }
];
