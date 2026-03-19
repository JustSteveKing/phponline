export function getReadingTime(text: string | undefined): string {
    if (!text) return "1 min read";
    
    // Remove HTML tags
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");
    
    const wordsPerMinute = 200;
    const numberOfWords = cleanText.split(/\s/g).length;
    const minutes = Math.ceil(numberOfWords / wordsPerMinute);
    
    return `${minutes} min read`;
}
