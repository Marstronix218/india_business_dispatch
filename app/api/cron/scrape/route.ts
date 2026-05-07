import { NextResponse } from "next/server"
import { runAutomationPipeline, type PipelineDraft } from "@/lib/automation"
import { debugClusterDetails, readClusterOptionsFromEnv } from "@/lib/clustering"
import { fetchIndiaNews } from "@/lib/scrapers/fetch-india-news"
import { insertPipelineDrafts } from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 300

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== "production"
  const header = request.headers.get("authorization") ?? ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : header
  return token === secret
}

async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const limit = Number(process.env.SCRAPE_LIMIT_PER_CONNECTOR ?? 6)
  const { rawArticles, errors } = await fetchIndiaNews(limit)

  if (rawArticles.length === 0) {
    return NextResponse.json({
      ok: true,
      warning: "No raw articles fetched",
      fetchErrors: errors,
      summary: { fetched: 0, synthesized: 0, inserted: 0, skipped: 0, failed: 0 },
    })
  }

  const url = new URL(request.url)
  const debug = url.searchParams.get("debug") === "1"
  const debugData = debug ? debugClusterDetails(rawArticles, readClusterOptionsFromEnv()) : null

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

  const failureReasons = [...result.reviewQueue, ...result.failed]
    .filter((d) => d.failureReason)
    .map((d) => ({ title: d.title, status: d.workflowStatus, reason: d.failureReason }))

  if (failureReasons.length > 0) {
    console.warn(
      `[cron/scrape] ${failureReasons.length} drafts had failure reasons:`,
      JSON.stringify(failureReasons, null, 2),
    )
  }

  return NextResponse.json({
    ok: true,
    fetchErrors: errors,
    summary: {
      fetched: rawArticles.length,
      synthesized: result.published.length + result.reviewQueue.length,
      published: result.published.length,
      reviewQueue: result.reviewQueue.length,
      failed: result.failed.length,
      inserted,
      skipped,
    },
    failureReasons,
    supabaseConfigured: hasSupabaseConfig(),
    debug: debugData,
  })
}

export async function GET(request: Request) {
  return handle(request)
}

export async function POST(request: Request) {
  return handle(request)
}
