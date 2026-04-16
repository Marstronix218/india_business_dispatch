export function resolveArticleImageUrl(imageUrl: string | undefined, seed: string) {
  if (!imageUrl) {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/675`
  }

  if (imageUrl.startsWith("/images/")) {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}-legacy/1200/675`
  }

  return imageUrl
}
