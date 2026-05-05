export function resolveArticleImageUrl(
  imageUrl: string | undefined,
  _seed: string,
): string | undefined {
  if (!imageUrl) return undefined
  if (imageUrl.startsWith("/images/")) return undefined
  return imageUrl
}

const PLACEHOLDER_IMAGE_HOSTS = new Set(["picsum.photos"])

export function resolveImageCredit(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined
  if (!/^https?:\/\//i.test(imageUrl)) return undefined
  try {
    const host = new URL(imageUrl).hostname.replace(/^www\./, "")
    if (!host || PLACEHOLDER_IMAGE_HOSTS.has(host)) return undefined
    return host
  } catch {
    return undefined
  }
}
