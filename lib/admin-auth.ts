const ALLOW_WITHOUT_KEY = process.env.NODE_ENV !== "production"

export const ADMIN_SESSION_COOKIE = "admin_session"

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=")
    if (rawName === name) return decodeURIComponent(rest.join("="))
  }
  return null
}

export function isAdminRequest(request: Request): boolean {
  const configured = process.env.ADMIN_API_KEY
  if (!configured) return ALLOW_WITHOUT_KEY

  const header = request.headers.get("authorization") ?? ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : header
  if (token === configured) return true

  const cookie = readCookie(request.headers.get("cookie"), ADMIN_SESSION_COOKIE)
  return cookie === configured
}
