export function resolveSourceArticleUrl(sourceUrl: string | undefined, title: string) {
  void title
  if (!sourceUrl) return undefined

  try {
    const parsed = new URL(sourceUrl)
    const isHomepage = parsed.pathname === "/" && !parsed.search && !parsed.hash

    return isHomepage ? undefined : sourceUrl
  } catch {
    return sourceUrl
  }
}
