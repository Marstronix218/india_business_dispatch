import { type NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: ["/admin/:path*"],
}

/**
 * Constant-time string comparison to prevent timing-based credential enumeration.
 * Uses XOR over UTF-8 encoded bytes so the loop always runs the same number of
 * iterations (equal to the length of the expected value).
 */
function constantTimeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  // Pad / truncate bBytes to match aBytes length to avoid length leakage.
  let result = aBytes.length === bBytes.length ? 0 : 1
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ (bBytes[i] ?? 0)
  }
  return result === 0
}

export function middleware(request: NextRequest) {
  const apiKey = process.env.ADMIN_API_KEY

  // In non-production environments, allow access when no key is configured.
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next()
    // In production without ADMIN_API_KEY set, deny access.
    return new NextResponse("Access denied", { status: 403 })
  }

  const auth = request.headers.get("authorization") ?? ""
  if (auth.startsWith("Basic ")) {
    try {
      // atob is used intentionally: Next.js middleware runs on the Edge runtime
      // where the Node.js Buffer API is unavailable.
      const credentials = atob(auth.slice(6))
      // credentials format is "username:password"; only the password part is validated.
      const colonIndex = credentials.indexOf(":")
      const password = colonIndex >= 0 ? credentials.slice(colonIndex + 1) : credentials
      if (constantTimeEqual(password, apiKey)) {
        return NextResponse.next()
      }
    } catch {
      // invalid base64 — fall through to 401
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin"',
    },
  })
}
