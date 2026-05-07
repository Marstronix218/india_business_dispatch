import { type NextRequest, NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth"

export const config = {
  matcher: ["/admin/:path*"],
}

function constantTimeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  let result = aBytes.length === bBytes.length ? 0 : 1
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ (bBytes[i] ?? 0)
  }
  return result === 0
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin/login")) return NextResponse.next()

  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next()
    return new NextResponse("ADMIN_API_KEY is not configured", { status: 500 })
  }

  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (cookie && constantTimeEqual(cookie, apiKey)) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = "/admin/login"
  url.search = ""
  return NextResponse.redirect(url)
}
