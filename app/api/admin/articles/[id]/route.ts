import { NextResponse } from "next/server"
import {
  deleteArticle,
  updateArticle,
  type UpdateArticleInput,
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

function pickUpdate(body: Record<string, unknown>): UpdateArticleInput {
  const input: UpdateArticleInput = {}
  if (typeof body.title === "string") input.title = body.title
  if (typeof body.summary === "string") input.summary = body.summary
  if (typeof body.source === "string") input.source = body.source
  if (typeof body.sourceUrl === "string" || body.sourceUrl === null) {
    input.sourceUrl = (body.sourceUrl as string | null) ?? undefined
  }
  if (typeof body.publishedAt === "string") input.publishedAt = body.publishedAt
  if (typeof body.category === "string") input.category = body.category as Category
  if (Array.isArray(body.industryTags)) {
    input.industryTags = body.industryTags.filter((t): t is string => typeof t === "string") as IndustryTag[]
  }
  if (Array.isArray(body.implications)) {
    input.implications = body.implications.filter((t): t is string => typeof t === "string")
  }
  if (typeof body.contentType === "string") input.contentType = body.contentType as ContentType
  if (typeof body.visibility === "string") input.visibility = body.visibility as Visibility
  if (typeof body.workflowStatus === "string") {
    input.workflowStatus = body.workflowStatus as WorkflowStatus
  }
  if (typeof body.imageUrl === "string" || body.imageUrl === null) {
    input.imageUrl = (body.imageUrl as string | null) ?? undefined
  }
  if (typeof body.featured === "boolean") input.featured = body.featured
  return input
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 })
  }

  const update = pickUpdate(body)
  const article = await updateArticle(id, update)
  if (!article) {
    return NextResponse.json({ ok: false, error: "update failed" }, { status: 500 })
  }
  return NextResponse.json({ ok: true, article })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const ok = await deleteArticle(id)
  if (!ok) {
    return NextResponse.json({ ok: false, error: "delete failed" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
