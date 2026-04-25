import { type NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: ["/admin/:path*"],
}

export function middleware(request: NextRequest) {
  const apiKey = process.env.ADMIN_API_KEY

  // In non-production environments, allow access when no key is configured.
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next()
    // In production without ADMIN_API_KEY set, deny access entirely.
    return new NextResponse("Admin access is not configured", { status: 403 })
  }

  const auth = request.headers.get("authorization") ?? ""
  if (auth.startsWith("Basic ")) {
    try {
      const credentials = atob(auth.slice(6))
      // credentials format is "username:password"; we only validate the password part.
      const colonIndex = credentials.indexOf(":")
      const password = colonIndex >= 0 ? credentials.slice(colonIndex + 1) : credentials
      if (password === apiKey) {
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
