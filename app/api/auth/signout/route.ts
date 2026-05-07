import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST() {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}
