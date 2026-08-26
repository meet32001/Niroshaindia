// Helper function to resolve image URLs across the application
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getImageUrl(source: any): string {
  const defaultFallback =
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

  if (!source) return defaultFallback;

  if (typeof source === "string") {
    if (source.startsWith("http://") || source.startsWith("https://") || source.startsWith("/")) {
      return source;
    }
  }

  if (source.url && typeof source.url === "string") {
    return source.url;
  }

  if (source.asset?.url && typeof source.asset.url === "string") {
    return source.asset.url;
  }

  return defaultFallback;
}

// Backward-compatibility builder matching sanity urlFor API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  const url = getImageUrl(source);
  return {
    url: () => url,
  };
}
