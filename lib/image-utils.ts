export function resolveArticleImageUrl(
  imageUrl: string | undefined,
  _seed: string,
): string | undefined {
  if (!imageUrl) return undefined
  if (imageUrl.startsWith("/images/")) return undefined
  return imageUrl
}
