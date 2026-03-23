import { SITE_CONFIG } from "@/config/site";

/**
 * Clean any query parameters from the URL and add our own UTM data.
 * For YouTube URLs, we preserve the 'v' parameter.
 * @param url The original URL
 * @returns The cleaned and tagged URL
 */
export function cleanAndTagUrl(url: string | undefined): string | undefined {
    if (!url) return url;

    try {
        const urlObj = new URL(url);
        
        // Handle YouTube 'v' parameter
        const videoId = urlObj.searchParams.get('v');

        // Clean all query parameters
        urlObj.search = '';

        // Restore 'v' if it existed (for YouTube links)
        if (videoId) {
            urlObj.searchParams.set('v', videoId);
        }

        // Add UTM parameters
        urlObj.searchParams.set('utm_source', SITE_CONFIG.utm.source);
        urlObj.searchParams.set('utm_medium', SITE_CONFIG.utm.medium);
        urlObj.searchParams.set('utm_campaign', SITE_CONFIG.utm.campaign);

        return urlObj.toString();
    } catch (e) {
        // If it's not a valid URL, return it as is
        return url;
    }
}
