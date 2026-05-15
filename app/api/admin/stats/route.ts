import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/admin-auth"
import { getDailyGenerationStats } from "@/lib/supabase/article-repository"
import { getAnthropicCosts, getOpenAiCosts } from "@/lib/billing"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const WINDOW_DAYS = 30

/**
 * Admin dashboard stats: per-day article/image generation counts plus
 * OpenAI/Anthropic account spend. Server-only because it touches the Supabase
 * service key and the provider Admin keys.
 */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  // getDailyGenerationStats can throw if the Supabase service key is missing;
  // keep the billing widgets working even then by isolating that failure.
  const [daily, openai, anthropic] = await Promise.all([
    getDailyGenerationStats(WINDOW_DAYS).catch((err: unknown) => {
      console.error("[admin/stats] daily generation stats failed:", err)
      return []
    }),
    getOpenAiCosts(WINDOW_DAYS),
    getAnthropicCosts(WINDOW_DAYS),
  ])

  return NextResponse.json({
    ok: true,
    daily,
    billing: { openai, anthropic },
  })
}
