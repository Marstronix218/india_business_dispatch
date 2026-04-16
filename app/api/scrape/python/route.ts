import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { NextResponse } from "next/server"
import { runAutomationPipeline, type RawSourceArticle } from "@/lib/automation"

const execFileAsync = promisify(execFile)

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST() {
  try {
    const { stdout } = await execFileAsync("python3", [
      "scripts/python/fetch_india_news.py",
      "--limit",
      "6",
    ])

    const payload = JSON.parse(stdout) as {
      rawArticles?: RawSourceArticle[]
      errors?: Array<{ connectorId: string; error: string }>
    }

    const rawArticles = Array.isArray(payload.rawArticles) ? payload.rawArticles : []
    if (rawArticles.length === 0) {
      return NextResponse.json({
        ok: true,
        warning: "No raw articles from python scraper",
        fetchErrors: payload.errors ?? [],
        summary: {
          fetched: 0,
          published: 0,
          reviewQueue: 0,
          failed: 0,
        },
        result: {
          published: [],
          reviewQueue: [],
          failed: [],
        },
      })
    }

    const result = runAutomationPipeline(rawArticles)

    return NextResponse.json({
      ok: true,
      fetchErrors: payload.errors ?? [],
      summary: {
        fetched: rawArticles.length,
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
