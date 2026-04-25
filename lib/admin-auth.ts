const ALLOW_WITHOUT_KEY = process.env.NODE_ENV !== "production"

export function isAdminRequest(request: Request): boolean {
  const configured = process.env.ADMIN_API_KEY
  if (!configured) return ALLOW_WITHOUT_KEY

  const header = request.headers.get("authorization") ?? ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : header
  return token === configured
}
