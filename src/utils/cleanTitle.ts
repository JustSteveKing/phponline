export function cleanTitle(title: string | undefined): string {
    if (!title) return "";

    return title
        // Remove tags in square brackets: [RFC], [UNDER DISCUSSION], etc.
        .replace(/\[.*?\]/g, "")
        // Remove tags in parentheses: (End of mbregex), etc.
        .replace(/\(.*?\)/g, "")
        // Clean up multiple spaces
        .replace(/\s\s+/g, " ")
        // Trim whitespace
        .trim();
}
