const USER_AGENT =
  "Mozilla/5.0 (compatible; IndiaBusinessDispatch/1.0; +https://example.com/bot)"

const META_PATTERNS: RegExp[] = [
  /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
]

function normalizeImageUrl(raw: string, base: string): string | undefined {
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  try {
    return new URL(trimmed, base).toString()
  } catch {
    return undefined
  }
}

export async function resolveOgImage(
  url: string,
  timeoutMs = 5000,
): Promise<string | undefined> {
  if (!url) return undefined

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    })
    if (!response.ok) return undefined

    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.includes("html")) return undefined

    const html = (await response.text()).slice(0, 200_000)
    for (const pattern of META_PATTERNS) {
      const match = html.match(pattern)
      if (match?.[1]) {
        const normalized = normalizeImageUrl(match[1], response.url)
        if (normalized) return normalized
      }
    }
    return undefined
  } catch {
    return undefined
  } finally {
    clearTimeout(timer)
  }
}
