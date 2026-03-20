import { z } from "zod";
import { CREATORS } from "../src/config/creators";
import { EVENTS } from "../src/config/events";

console.log("🔍 Validating Configuration Data...");

const CreatorSchema = z.object({
    id: z.string().regex(/^[a-z0-9-]+$/, "ID must be kebab-case (lowercase, numbers, and hyphens only)"),
    name: z.string().min(2),
    description: z.string().min(10),
    avatar: z.string().url(),
    website: z.string().url().optional(),
    twitter: z.string().optional(),
    github: z.string().optional(),
    sources: z.object({
        feeds: z.array(z.object({
            url: z.string().url(),
            label: z.string(),
            type: z.string()
        })).optional(),
        podcasts: z.array(z.object({
            feed: z.string().url(),
            title: z.string(),
            href: z.string().url(),
            badge: z.string()
        })).optional(),
        youtube: z.array(z.object({
            id: z.string().startsWith("UC"),
            label: z.string()
        })).optional(),
    })
});

const EventSchema = z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(3),
    description: z.string().min(10),
    location: z.string().min(2),
    startDate: z.date(),
    endDate: z.date(),
    url: z.string().url(),
    cfpUrl: z.string().url().optional(),
    type: z.enum(['conference', 'meetup', 'workshop']),
    creatorId: z.string().optional()
}).refine(data => data.endDate >= data.startDate, {
    message: "End date must be after or equal to start date",
    path: ["endDate"]
});

let errors = 0;

// Validate Creators
console.log(`👤 Checking ${CREATORS.length} Creators...`);
CREATORS.forEach(creator => {
    const result = CreatorSchema.safeParse(creator);
    if (!result.success) {
        console.error(`❌ Invalid Creator: ${creator.id}`);
        console.error(result.error.format());
        errors++;
    }
});

// Validate Events
console.log(`🗓️ Checking ${EVENTS.length} Events...`);
EVENTS.forEach(event => {
    const result = EventSchema.safeParse(event);
    if (!result.success) {
        console.error(`❌ Invalid Event: ${event.id}`);
        console.error(result.error.format());
        errors++;
    }
});

if (errors > 0) {
    console.error(`\n🛑 Validation failed with ${errors} error(s).`);
    process.exit(1);
}

console.log("✅ Data validation successful!");
