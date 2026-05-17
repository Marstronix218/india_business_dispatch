import type { SupabaseClient } from "@supabase/supabase-js"
import {
  type Category,
  type ContentType,
  type IndustryTag,
  type NewsArticle,
  type QualityCheckMeta,
  type QualityVerdict,
  type SourceProvenance,
  type Visibility,
  type WorkflowStatus,
} from "@/lib/news-data"
import type { PipelineDraft } from "@/lib/automation"
import { getAnonClient, getServiceClient, hasSupabaseConfig } from "./client"

interface ArticleRow {
  id: string
  title: string
  summary: string
  source: string
  source_url: string | null
  published_at: string
  category: string
  industry_tags: string[]
  implications: string[]
  content_type: string
  visibility: string
  workflow_status: string
  image_url: string | null
  featured: boolean
  is_synthesized: boolean
  dedupe_key: string | null
  quality_verdict: string | null
  quality_notes: string | null
  revision_count: number | null
  last_quality_check_at: string | null
  article_sources?: SourceRow[] | null
}

interface SourceRow {
  article_id: string
  source_name: string | null
  original_title: string
  original_url: string
  canonical_url: string | null
  original_published_at: string | null
  fetched_at: string | null
  extracted_by: string | null
  source_language: string | null
  evidence_snippets: string[]
  display_order: number
}

const ARTICLE_SELECT = `
  id, title, summary, source, source_url, published_at, category,
  industry_tags,
  implications, content_type, visibility, workflow_status,
  image_url, featured, is_synthesized, dedupe_key,
  quality_verdict, quality_notes, revision_count, last_quality_check_at,
  article_sources (
    article_id, source_name, original_title, original_url, canonical_url,
    original_published_at, fetched_at, extracted_by, source_language,
    evidence_snippets, display_order
  )
`

function isQualityVerdict(value: string | null): value is QualityVerdict {
  return value === "PASS" || value === "REVISION" || value === "REJECT"
}

function rowToQualityCheck(row: ArticleRow): QualityCheckMeta | undefined {
  if (!isQualityVerdict(row.quality_verdict)) return undefined
  return {
    verdict: row.quality_verdict,
    notes: row.quality_notes ?? undefined,
    revisionCount: row.revision_count ?? 0,
    checkedAt: row.last_quality_check_at ?? undefined,
  }
}

function rowToProvenance(row: SourceRow): SourceProvenance {
  return {
    originalTitle: row.original_title,
    originalUrl: row.original_url,
    canonicalUrl: row.canonical_url ?? undefined,
    originalPublishedAt: row.original_published_at ?? undefined,
    fetchedAt: row.fetched_at ?? undefined,
    extractedBy: row.extracted_by ?? undefined,
    sourceLanguage: row.source_language ?? undefined,
    evidenceSnippets: row.evidence_snippets ?? [],
    sourceName: row.source_name ?? undefined,
  }
}

function rowToArticle(row: ArticleRow): NewsArticle {
  const sources = (row.article_sources ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map(rowToProvenance)

  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    source: row.source,
    sourceUrl: row.source_url ?? undefined,
    publishedAt: row.published_at,
    category: row.category as Category,
    industryTags: (row.industry_tags ?? []) as IndustryTag[],
    implications: row.implications ?? [],
    contentType: row.content_type as ContentType,
    visibility: row.visibility as Visibility,
    workflowStatus: row.workflow_status as WorkflowStatus,
    imageUrl: row.image_url ?? undefined,
    featured: row.featured,
    isSynthesized: row.is_synthesized,
    provenance: sources[0],
    sources: sources.length > 0 ? sources : undefined,
    qualityCheck: rowToQualityCheck(row),
  }
}

export async function listPublishedArticles(
  client: SupabaseClient = getAnonClient(),
): Promise<NewsArticle[]> {
  if (!hasSupabaseConfig()) return []

  const { data, error } = await client
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("workflow_status", "published")
    .order("published_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[supabase] listPublishedArticles failed:", error.message)
    return []
  }
  return (data as unknown as ArticleRow[] ?? []).map(rowToArticle)
}

export async function listAllArticles(): Promise<NewsArticle[]> {
  if (!hasSupabaseConfig()) return []

  const { data, error } = await getServiceClient()
    .from("articles")
    .select(ARTICLE_SELECT)
    .order("published_at", { ascending: false })
    .limit(200)

  if (error) {
    console.error("[supabase] listAllArticles failed:", error.message)
    return []
  }
  return (data as unknown as ArticleRow[] ?? []).map(rowToArticle)
}

export async function getArticleById(id: string): Promise<NewsArticle | null> {
  if (!hasSupabaseConfig()) return null

  const { data, error } = await getAnonClient()
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[supabase] getArticleById failed:", error.message)
    return null
  }
  return data ? rowToArticle(data as unknown as ArticleRow) : null
}

export interface InsertArticleInput {
  title: string
  summary: string
  source: string
  sourceUrl?: string
  publishedAt: string
  category: Category
  industryTags: IndustryTag[]
  implications: string[]
  contentType: ContentType
  visibility: Visibility
  workflowStatus: WorkflowStatus
  imageUrl?: string
  featured?: boolean
  isSynthesized?: boolean
  dedupeKey?: string
  sources?: SourceProvenance[]
  qualityCheck?: QualityCheckMeta
}

function toRowInsert(input: InsertArticleInput) {
  return {
    title: input.title,
    summary: input.summary,
    source: input.source,
    source_url: input.sourceUrl ?? null,
    published_at: input.publishedAt,
    category: input.category,
    industry_tags: input.industryTags,
    implications: input.implications,
    content_type: input.contentType,
    visibility: input.visibility,
    workflow_status: input.workflowStatus,
    image_url: input.imageUrl ?? null,
    featured: input.featured ?? false,
    is_synthesized: input.isSynthesized ?? false,
    dedupe_key: input.dedupeKey ?? null,
    quality_verdict: input.qualityCheck?.verdict ?? null,
    quality_notes: input.qualityCheck?.notes ?? null,
    revision_count: input.qualityCheck?.revisionCount ?? 0,
    last_quality_check_at: input.qualityCheck?.checkedAt ?? null,
  }
}

async function insertSourcesFor(
  client: SupabaseClient,
  articleId: string,
  sources: SourceProvenance[] | undefined,
) {
  if (!sources || sources.length === 0) return
  const rows = sources.map((s, i) => ({
    article_id: articleId,
    source_name: s.sourceName ?? null,
    original_title: s.originalTitle,
    original_url: s.originalUrl,
    canonical_url: s.canonicalUrl ?? null,
    original_published_at: s.originalPublishedAt ?? null,
    fetched_at: s.fetchedAt ?? null,
    extracted_by: s.extractedBy ?? null,
    source_language: s.sourceLanguage ?? null,
    evidence_snippets: s.evidenceSnippets ?? [],
    display_order: i,
  }))
  const { error } = await client.from("article_sources").insert(rows)
  if (error) {
    console.error("[supabase] insertSources failed:", error.message)
  }
}

export async function insertArticle(input: InsertArticleInput): Promise<NewsArticle | null> {
  const client = getServiceClient()
  const { data, error } = await client
    .from("articles")
    .insert(toRowInsert(input))
    .select("id")
    .single()

  if (error || !data) {
    console.error("[supabase] insertArticle failed:", error?.message)
    return null
  }

  await insertSourcesFor(client, data.id, input.sources)
  return getArticleByIdService(data.id)
}

async function getArticleByIdService(id: string): Promise<NewsArticle | null> {
  const { data, error } = await getServiceClient()
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[supabase] getArticleByIdService failed:", error.message)
    return null
  }
  return data ? rowToArticle(data as unknown as ArticleRow) : null
}

export interface InsertDraftsResult {
  inserted: number
  skipped: number
}

export async function insertPipelineDrafts(
  drafts: PipelineDraft[],
): Promise<InsertDraftsResult> {
  if (!hasSupabaseConfig() || drafts.length === 0) {
    return { inserted: 0, skipped: drafts.length }
  }

  const client = getServiceClient()
  let inserted = 0
  let skipped = 0

  for (const draft of drafts) {
    const input: InsertArticleInput = {
      title: draft.title,
      summary: draft.summary,
      source: draft.source,
      sourceUrl: draft.sourceUrl,
      publishedAt: draft.publishedAt,
      category: draft.category,
      industryTags: draft.industryTags,
      implications: draft.implications,
      contentType: draft.contentType,
      visibility: draft.visibility,
      workflowStatus: draft.workflowStatus,
      imageUrl: draft.imageUrl,
      featured: false,
      isSynthesized: draft.isSynthesized ?? false,
      dedupeKey: draft.dedupeKey,
      sources: draft.sources,
      qualityCheck: draft.qualityCheck,
    }

    const { data, error } = await client
      .from("articles")
      .insert(toRowInsert(input))
      .select("id")
      .single()

    if (error) {
      if (error.code === "23505") {
        skipped += 1
        continue
      }
      console.error("[supabase] insertPipelineDrafts failed:", error.message)
      skipped += 1
      continue
    }

    if (data) {
      await insertSourcesFor(client, data.id, input.sources)
      inserted += 1
    }
  }

  return { inserted, skipped }
}

export interface UpdateArticleInput extends Partial<InsertArticleInput> {}

export async function updateArticle(
  id: string,
  input: UpdateArticleInput,
): Promise<NewsArticle | null> {
  const client = getServiceClient()
  const row: Record<string, unknown> = {}
  if (input.title !== undefined) row.title = input.title
  if (input.summary !== undefined) row.summary = input.summary
  if (input.source !== undefined) row.source = input.source
  if (input.sourceUrl !== undefined) row.source_url = input.sourceUrl ?? null
  if (input.publishedAt !== undefined) row.published_at = input.publishedAt
  if (input.category !== undefined) row.category = input.category
  if (input.industryTags !== undefined) row.industry_tags = input.industryTags
  if (input.implications !== undefined) row.implications = input.implications
  if (input.contentType !== undefined) row.content_type = input.contentType
  if (input.visibility !== undefined) row.visibility = input.visibility
  if (input.workflowStatus !== undefined) row.workflow_status = input.workflowStatus
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl ?? null
  if (input.featured !== undefined) row.featured = input.featured
  if (input.isSynthesized !== undefined) row.is_synthesized = input.isSynthesized
  if (input.qualityCheck !== undefined) {
    row.quality_verdict = input.qualityCheck?.verdict ?? null
    row.quality_notes = input.qualityCheck?.notes ?? null
    row.revision_count = input.qualityCheck?.revisionCount ?? 0
    row.last_quality_check_at = input.qualityCheck?.checkedAt ?? null
  }

  const { error } = await client.from("articles").update(row).eq("id", id)
  if (error) {
    console.error("[supabase] updateArticle failed:", error.message)
    return null
  }

  if (input.sources) {
    await client.from("article_sources").delete().eq("article_id", id)
    await insertSourcesFor(client, id, input.sources)
  }

  return getArticleByIdService(id)
}

export async function deleteArticle(id: string): Promise<boolean> {
  const { error } = await getServiceClient().from("articles").delete().eq("id", id)
  if (error) {
    console.error("[supabase] deleteArticle failed:", error.message)
    return false
  }
  return true
}

export interface DailyGenerationStat {
  /** Calendar date in JST, `YYYY-MM-DD`. */
  date: string
  /** Articles created (DB rows) on that day. */
  articles: number
  /** Articles created with a generated image (`image_url` set) on that day. */
  images: number
}

const DAY_MS = 24 * 60 * 60 * 1000
const JST_OFFSET_MS = 9 * 60 * 60 * 1000

/** Calendar date (`YYYY-MM-DD`) of an ISO timestamp in JST (UTC+9, no DST). */
function jstDate(iso: string): string {
  return new Date(new Date(iso).getTime() + JST_OFFSET_MS)
    .toISOString()
    .slice(0, 10)
}

/**
 * Counts articles and image-bearing articles created per day over the last
 * `days` days, bucketed by JST calendar date and zero-filled so the series has
 * no gaps. Used by the admin dashboard generation graph.
 */
export async function getDailyGenerationStats(
  days = 30,
): Promise<DailyGenerationStat[]> {
  if (!hasSupabaseConfig()) return []

  const sinceIso = new Date(Date.now() - days * DAY_MS).toISOString()
  const { data, error } = await getServiceClient()
    .from("articles")
    .select("created_at, image_url")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[supabase] getDailyGenerationStats failed:", error.message)
    return []
  }

  // Pre-seed every day in the window (oldest → newest) so the chart is continuous.
  const buckets = new Map<string, DailyGenerationStat>()
  for (let i = days - 1; i >= 0; i--) {
    const date = jstDate(new Date(Date.now() - i * DAY_MS).toISOString())
    buckets.set(date, { date, articles: 0, images: 0 })
  }

  for (const row of (data ?? []) as {
    created_at: string
    image_url: string | null
  }[]) {
    const bucket = buckets.get(jstDate(row.created_at))
    if (!bucket) continue // row landed just outside the JST window — skip
    bucket.articles += 1
    if (row.image_url) bucket.images += 1
  }

  return [...buckets.values()]
}
