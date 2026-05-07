import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface LoginBody {
  key?: unknown
}

export async function POST(request: Request) {
  const configured = process.env.ADMIN_API_KEY
  if (!configured) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_API_KEY is not configured" },
      { status: 500 },
    )
  }

  let body: LoginBody
  try {
    body = (await request.json()) as LoginBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 })
  }

  const provided = typeof body.key === "string" ? body.key : ""
  if (provided !== configured) {
    return NextResponse.json({ ok: false, error: "invalid key" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: configured,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
