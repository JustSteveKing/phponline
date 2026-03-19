export function extractImageFromHtml(html: string | undefined): string | null {
  if (!html) return null;

  // Regex breakdown:
  // <img matches the start of the tag
  // [^>]+ matches any characters inside the tag except the closing >
  // src=["'] matches the src attribute and the opening quote
  // ([^"']+) is our CAPTURING GROUP (the actual URL)
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
  const match = html.match(imgRegex);

  if (match && match[1]) {
    const url = match[1];

    // Some RSS feeds use relative URLs (e.g. "/images/photo.jpg")
    // If it doesn't start with http, it might be broken without a base URL
    return url.startsWith("http") ? url : null;
  }

  return null;
}
