import { NextResponse } from "next/server"
import { runAutomationPipeline, type RawSourceArticle } from "@/lib/automation"

export const dynamic = "force-dynamic"

interface RequestBody {
  rawArticles?: RawSourceArticle[]
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestBody
    const rawArticles = Array.isArray(payload.rawArticles) ? payload.rawArticles : []

    if (rawArticles.length === 0) {
      return NextResponse.json(
        { ok: false, error: "rawArticles is required" },
        { status: 400 },
      )
    }

    const result = runAutomationPipeline(rawArticles)

    return NextResponse.json({
      ok: true,
      summary: {
        published: result.published.length,
        reviewQueue: result.reviewQueue.length,
        failed: result.failed.length,
      },
      result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
