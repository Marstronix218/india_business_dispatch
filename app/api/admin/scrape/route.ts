import { NextResponse } from "next/server"
import { runAutomationPipeline, type PipelineDraft } from "@/lib/automation"
import { fetchIndiaNews } from "@/lib/scrapers/fetch-india-news"
import { insertPipelineDrafts } from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { isAdminRequest } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 300

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const limit = Number(process.env.SCRAPE_LIMIT_PER_CONNECTOR ?? 6)
  const { rawArticles, errors } = await fetchIndiaNews(limit)

  if (rawArticles.length === 0) {
    return NextResponse.json({
      ok: true,
      warning: "No raw articles fetched",
      fetchErrors: errors,
      summary: { fetched: 0, published: 0, reviewQueue: 0, failed: 0, inserted: 0, skipped: 0 },
    })
  }

  let inserted = 0
  let skipped = 0
  const supabaseEnabled = hasSupabaseConfig()

  const onDraft = async (draft: PipelineDraft) => {
    if (draft.workflowStatus !== "published" && draft.workflowStatus !== "review") return
    if (!supabaseEnabled) {
      skipped += 1
      return
    }
    const r = await insertPipelineDrafts([draft])
    inserted += r.inserted
    skipped += r.skipped
  }

  const result = await runAutomationPipeline(rawArticles, { onDraft })

  return NextResponse.json({
    ok: true,
    fetchErrors: errors,
    summary: {
      fetched: rawArticles.length,
      published: result.published.length,
      reviewQueue: result.reviewQueue.length,
      failed: result.failed.length,
      inserted,
      skipped,
    },
  })
}
