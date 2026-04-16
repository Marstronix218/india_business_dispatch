export function isLikelyArticleUrl(sourceUrl: string | undefined) {
  if (!sourceUrl) return false

  try {
    const parsed = new URL(sourceUrl)
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false
    }

    const path = parsed.pathname || "/"
    if (path === "/") {
      return false
    }

    const lowered = path.toLowerCase()
    const disallowed = [
      "/category/",
      "/tag/",
      "/author/",
      "/search",
      "/topics/",
      "/topic/",
      "/about",
      "/contact",
      "/feed",
    ]
    if (disallowed.some((token) => lowered.includes(token))) {
      return false
    }

    if (lowered.endsWith(".jpg") || lowered.endsWith(".png") || lowered.endsWith(".svg")) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export function resolveSourceArticleUrl(sourceUrl: string | undefined, title: string) {
  void title
  if (!sourceUrl) return undefined

  try {
    return isLikelyArticleUrl(sourceUrl) ? sourceUrl : undefined
  } catch {
    return sourceUrl
  }
}
