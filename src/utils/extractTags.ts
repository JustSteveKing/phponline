const TOPICS = [
    { id: "laravel", keywords: ["laravel", "artisan", "eloquent", "blade"] },
    { id: "symfony", keywords: ["symfony", "twig", "doctrine", "api platform"] },
    { id: "security", keywords: ["security", "vulnerability", "cve", "patch", "exploit", "auth", "encryption"] },
    { id: "performance", keywords: ["performance", "optimization", "speed", "benchmark", "jit", "caching"] },
    { id: "testing", keywords: ["testing", "phpunit", "pest", "tdd", "mocking", "assertion"] },
    { id: "php8", keywords: ["php 8", "php 8.1", "php 8.2", "php 8.3", "php 8.4", "php 8.5"] },
    { id: "internals", keywords: ["rfc", "internals", "mailing list", "core", "foundation"] },
    { id: "architecture", keywords: ["architecture", "design pattern", "solid", "ddd", "clean code", "refactoring"] },
    { id: "databases", keywords: ["database", "sql", "mysql", "postgresql", "sqlite", "nosql", "redis"] },
    { id: "devops", keywords: ["docker", "container", "ci/cd", "deployment", "server", "cloud", "aws", "infrastructure"] },
];

export function extractTags(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const tags = new Set<string>();

    for (const topic of TOPICS) {
        if (topic.keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
            tags.add(topic.id);
        }
    }

    return Array.from(tags);
}

export function getTopicLabel(topicId: string): string {
    const labels: Record<string, string> = {
        laravel: "Laravel",
        symfony: "Symfony",
        security: "Security",
        performance: "Performance",
        testing: "Testing",
        php8: "PHP 8.x",
        internals: "Internals/RFCs",
        architecture: "Architecture",
        databases: "Databases",
        devops: "DevOps",
    };

    return labels[topicId] || topicId.charAt(0).toUpperCase() + topicId.slice(1);
}
