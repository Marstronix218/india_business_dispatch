import { NextResponse } from "next/server"
import { runAutomationPipeline, type RawSourceArticle } from "@/lib/automation"
import { isAdminRequest } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface RequestBody {
  rawArticles?: RawSourceArticle[]
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  try {
    const payload = (await request.json()) as RequestBody
    const rawArticles = Array.isArray(payload.rawArticles) ? payload.rawArticles : []

    if (rawArticles.length === 0) {
      return NextResponse.json(
        { ok: false, error: "rawArticles is required" },
        { status: 400 },
      )
    }

    const result = await runAutomationPipeline(rawArticles)

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
