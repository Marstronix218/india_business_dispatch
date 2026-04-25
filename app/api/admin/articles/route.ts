import { NextResponse } from "next/server"
import {
  insertArticle,
  listAllArticles,
  type InsertArticleInput,
} from "@/lib/supabase/article-repository"
import { isAdminRequest } from "@/lib/admin-auth"
import {
  type Category,
  type ContentType,
  type IndustryTag,
  type Visibility,
  type WorkflowStatus,
} from "@/lib/news-data"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }
  const articles = await listAllArticles()
  return NextResponse.json({ ok: true, articles })
}

interface CreateBody {
  title?: unknown
  summary?: unknown
  source?: unknown
  sourceUrl?: unknown
  publishedAt?: unknown
  category?: unknown
  industryTags?: unknown
  implications?: unknown
  contentType?: unknown
  visibility?: unknown
  workflowStatus?: unknown
  imageUrl?: unknown
  featured?: unknown
}

function normalize(body: CreateBody): InsertArticleInput | { error: string } {
  if (typeof body.title !== "string" || !body.title.trim()) return { error: "title is required" }
  if (typeof body.summary !== "string" || !body.summary.trim()) return { error: "summary is required" }
  if (typeof body.source !== "string" || !body.source.trim()) return { error: "source is required" }
  if (typeof body.publishedAt !== "string" || !body.publishedAt) return { error: "publishedAt is required" }
  if (typeof body.category !== "string") return { error: "category is required" }
  if (typeof body.contentType !== "string") return { error: "contentType is required" }
  if (typeof body.visibility !== "string") return { error: "visibility is required" }
  if (typeof body.workflowStatus !== "string") return { error: "workflowStatus is required" }

  const industryTags = Array.isArray(body.industryTags)
    ? body.industryTags.filter((t): t is string => typeof t === "string")
    : []
  const implications = Array.isArray(body.implications)
    ? body.implications.filter((t): t is string => typeof t === "string")
    : []

  return {
    title: body.title,
    summary: body.summary,
    source: body.source,
    sourceUrl: typeof body.sourceUrl === "string" && body.sourceUrl ? body.sourceUrl : undefined,
    publishedAt: body.publishedAt,
    category: body.category as Category,
    industryTags: industryTags as IndustryTag[],
    implications,
    contentType: body.contentType as ContentType,
    visibility: body.visibility as Visibility,
    workflowStatus: body.workflowStatus as WorkflowStatus,
    imageUrl: typeof body.imageUrl === "string" && body.imageUrl ? body.imageUrl : undefined,
    featured: body.featured === true,
    isSynthesized: false,
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  let body: CreateBody
  try {
    body = (await request.json()) as CreateBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 })
  }

  const normalized = normalize(body)
  if ("error" in normalized) {
    return NextResponse.json({ ok: false, error: normalized.error }, { status: 400 })
  }

  const article = await insertArticle(normalized)
  if (!article) {
    return NextResponse.json({ ok: false, error: "insert failed" }, { status: 500 })
  }

  return NextResponse.json({ ok: true, article })
}
