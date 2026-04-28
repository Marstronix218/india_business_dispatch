import {
  type Category,
  INDUSTRY_LABELS,
  type IndustryTag,
  type NewsArticle,
  type SourceProvenance,
  normalizeLegacyCategory,
} from "@/lib/news-data"
import { cleanText, ensureMinimumSummaryLength } from "@/lib/summary-utils"
import { isLikelyArticleUrl } from "@/lib/source-url-utils"
import { clusterArticles, readClusterOptionsFromEnv } from "@/lib/clustering"
import {
  LLMError,
  getLLMClient,
  type LLMClient,
  type SynthesisOutput,
  type SynthesisSource,
} from "@/lib/llm"
import { resolveOgImage } from "@/lib/scrapers/og-image"
import { fetchSimilarArticles } from "@/lib/scrapers/fetch-india-news"

export type ConnectorMode = "rss" | "api"

export interface SourceConnector {
  id: string
  name: string
  mode: ConnectorMode
  endpointLabel: string
  enabled: boolean
  priority: number
}

export interface RawSourceArticle {
  connectorId: string
  externalId: string
  source: string
  title: string
  url: string
  publishedAt: string
  bodyText: string
  imageUrl?: string
  originalTitle?: string
  originalPublishedAt?: string
  canonicalUrl?: string
  fetchedAt?: string
  extractedBy?: string
  sourceLanguage?: string
  evidenceSnippets?: string[]
  legacyCategory?: string
  industryHints?: IndustryTag[]
}

export interface PipelineDraft
  extends Omit<NewsArticle, "id" | "featured"> {
  dedupeKey: string
  originConnectorIds: string[]
  failureReason?: string
}

export interface PipelineResult {
  published: PipelineDraft[]
  reviewQueue: PipelineDraft[]
  failed: PipelineDraft[]
}

export const SOURCE_CONNECTORS: SourceConnector[] = [
  {
    id: "reuters-india-rss",
    name: "Reuters India RSS",
    mode: "rss",
    endpointLabel: "RSS feed",
    enabled: true,
    priority: 1,
  },
  {
    id: "rbi-api",
    name: "RBI Bulletin API",
    mode: "api",
    endpointLabel: "Official API",
    enabled: true,
    priority: 2,
  },
  {
    id: "pib-business-rss",
    name: "PIB Business RSS",
    mode: "rss",
    endpointLabel: "RSS feed",
    enabled: true,
    priority: 3,
  },
]

const KNOWN_INDUSTRY_TAGS: IndustryTag[] = [
  "automotive", "semiconductor", "machine_tools", "food", "chemicals",
  "logistics", "agriculture", "steel", "education", "entertainment", "talent",
]
const KNOWN_TAG_SET = new Set<string>(KNOWN_INDUSTRY_TAGS)

export function buildDedupeKey(title: string) {
  return cleanText(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 8)
    .join("-")
}

/** @deprecated fallback only — LLM失敗時の暫定要約に使用 */
export function translateToJapanesePreview(bodyText: string) {
  const cleaned = cleanText(bodyText)
  if (!cleaned) return ""
  return cleaned.slice(0, 2400)
}

/** @deprecated fallback only — LLM失敗時の暫定要約に使用 */
export function buildSummary(bodyText: string) {
  const translated = translateToJapanesePreview(bodyText)
  return ensureMinimumSummaryLength(translated, 500)
}

/** @deprecated fallback only — LLM失敗時の示唆テンプレート */
export function buildImplications(
  industryTags: IndustryTag[],
  category: Category,
): string[] {
  const firstTag = industryTags[0]
  const tagLabel = firstTag ? INDUSTRY_LABELS[firstTag] : "対象市場"

  if (category === "regulation") {
    return [
      "注意点: 制度運用が固まるまで対外説明を急がない。",
      "次アクション: 法務・通関・現地営業で影響範囲を確認する。",
      `監視対象: ${tagLabel} 領域の実務運用を継続監視する。`,
    ]
  }

  return [
    `勝機あり: ${tagLabel} 領域の提案材料として活用できる。`,
    "注意点: 一次ソースと現地オペレーションの差分確認が必要。",
    "次アクション: 自社の進出・採用計画に引き付けて優先度を付ける。",
  ]
}

/** @deprecated cluster ベースに移行 — 参照コードのための互換エクスポート */
export function dedupeArticles(rawArticles: RawSourceArticle[]) {
  const grouped = new Map<string, RawSourceArticle[]>()

  rawArticles.forEach((article) => {
    const key = buildDedupeKey(article.title)
    const group = grouped.get(key) ?? []
    group.push(article)
    grouped.set(key, group)
  })

  return grouped
}

function toProvenance(article: RawSourceArticle): SourceProvenance {
  return {
    originalTitle: article.originalTitle ?? article.title,
    originalUrl: article.url,
    canonicalUrl: article.canonicalUrl,
    originalPublishedAt: article.originalPublishedAt ?? article.publishedAt,
    fetchedAt: article.fetchedAt,
    extractedBy: article.extractedBy,
    sourceLanguage: article.sourceLanguage,
    evidenceSnippets: article.evidenceSnippets,
    sourceName: article.source,
  }
}

function pickPrimary(cluster: RawSourceArticle[]): RawSourceArticle {
  return [...cluster].sort((a, b) => a.connectorId.localeCompare(b.connectorId))[0]
}

function normalizeTagList(tags: string[]): IndustryTag[] {
  const result: IndustryTag[] = []
  for (const t of tags) {
    if (KNOWN_TAG_SET.has(t)) result.push(t as IndustryTag)
  }
  return Array.from(new Set(result))
}

function buildFailedDraft(
  cluster: RawSourceArticle[],
  primary: RawSourceArticle,
  reason: string,
  summary = "",
): PipelineDraft {
  const category = normalizeLegacyCategory(primary.legacyCategory ?? "economy")
  const industryTags = primary.industryHints ?? []
  const sources = cluster.map(toProvenance)
  return {
    dedupeKey: buildDedupeKey(primary.title),
    title: primary.title,
    summary,
    imageUrl: primary.imageUrl,
    provenance: sources[0],
    sources,
    source: primary.source,
    sourceUrl: primary.url,
    publishedAt: primary.publishedAt,
    category,
    industryTags,
    implications: [],
    contentType: "news",
    visibility: "member",
    workflowStatus: "failed",
    originConnectorIds: cluster.map((item) => item.connectorId),
    failureReason: reason,
    isSynthesized: false,
  }
}

function buildFallbackDraft(
  cluster: RawSourceArticle[],
  primary: RawSourceArticle,
  failureReason: string,
): PipelineDraft {
  const summary = buildSummary(primary.bodyText)
  const category = normalizeLegacyCategory(primary.legacyCategory ?? "economy")
  const industryTags = primary.industryHints ?? []
  const sources = cluster.map(toProvenance)

  if (!summary) {
    return buildFailedDraft(cluster, primary, "要約生成に失敗")
  }

  return {
    dedupeKey: buildDedupeKey(primary.title),
    title: primary.title,
    summary,
    imageUrl: primary.imageUrl,
    provenance: sources[0],
    sources,
    source: cluster.length > 1 ? `${primary.source}、他${cluster.length - 1}件` : primary.source,
    sourceUrl: primary.url,
    publishedAt: primary.publishedAt,
    category,
    industryTags,
    implications: buildImplications(industryTags, category),
    contentType: "news",
    visibility: "member",
    workflowStatus: "review",
    originConnectorIds: cluster.map((item) => item.connectorId),
    failureReason,
    isSynthesized: false,
  }
}

function readIndiaRelevanceMin(): number {
  const raw = Number(process.env.INDIA_RELEVANCE_MIN)
  if (!Number.isFinite(raw)) return 2
  return Math.max(0, Math.min(3, Math.round(raw)))
}

function buildSynthesizedDraft(
  cluster: RawSourceArticle[],
  primary: RawSourceArticle,
  output: SynthesisOutput,
): PipelineDraft {
  const category = normalizeLegacyCategory(output.category || primary.legacyCategory || "economy")
  const llmTags = normalizeTagList(output.industryTags)
  const industryTags = llmTags.length > 0 ? llmTags : primary.industryHints ?? []
  const sources = cluster.map(toProvenance)

  const workflowStatus =
    category === "regulation" && cluster.length === 1 ? "review" : "published"

  return {
    dedupeKey: buildDedupeKey(primary.title),
    title: output.title || primary.title,
    summary: ensureMinimumSummaryLength(output.summary, 500),
    imageUrl: primary.imageUrl,
    provenance: sources[0],
    sources,
    source: cluster.length > 1 ? `${primary.source}、他${cluster.length - 1}件` : primary.source,
    sourceUrl: primary.url,
    publishedAt: primary.publishedAt,
    category,
    industryTags,
    implications: output.implications,
    contentType: "news",
    visibility: workflowStatus === "review" ? "member" : "public",
    workflowStatus,
    originConnectorIds: cluster.map((item) => item.connectorId),
    isSynthesized: true,
  }
}

async function ensureImageUrl(cluster: RawSourceArticle[]): Promise<void> {
  if (cluster.some((a) => a.imageUrl && a.imageUrl.length > 0)) return
  for (const article of cluster) {
    if (!isLikelyArticleUrl(article.url)) continue
    const image = await resolveOgImage(article.url)
    if (image) {
      article.imageUrl = image
      for (const other of cluster) {
        if (!other.imageUrl) other.imageUrl = image
      }
      return
    }
  }
}

async function buildDraft(
  cluster: RawSourceArticle[],
  llm: LLMClient | null,
): Promise<PipelineDraft> {
  const primary = pickPrimary(cluster)

  if (cluster.length < 2) {
    return buildFailedDraft(cluster, primary, "単独ソースのため著作権配慮で除外")
  }

  if (!isLikelyArticleUrl(primary.url)) {
    return buildFailedDraft(cluster, primary, "原文URLが記事ページではない")
  }

  if (!cleanText(primary.bodyText ?? "")) {
    return buildFailedDraft(cluster, primary, "本文が空のため合成不可")
  }

  await ensureImageUrl(cluster)

  if (!llm) {
    return buildFallbackDraft(cluster, primary, "LLM未設定、旧方式で暫定生成")
  }

  try {
    const synthInput: SynthesisSource[] = cluster.map((a) => ({
      source: a.source,
      sourceUrl: a.url,
      publishedAt: a.publishedAt,
      title: a.title,
      bodyText: cleanText(a.bodyText ?? ""),
    }))

    const output = await llm.synthesize({
      cluster: synthInput,
      categoryHint: primary.legacyCategory,
      industryHints: primary.industryHints,
    })

    const minScore = readIndiaRelevanceMin()
    if (output.indiaRelevance.score < minScore) {
      return buildFailedDraft(
        cluster,
        primary,
        `インド関連性が低い (score=${output.indiaRelevance.score}, 閾値=${minScore}): ${output.indiaRelevance.reason}`,
      )
    }

    return buildSynthesizedDraft(cluster, primary, output)
  } catch (error) {
    const msg = error instanceof LLMError
      ? error.message
      : error instanceof Error ? error.message : String(error)
    console.error(`[automation] LLM合成失敗 (title="${primary.title}"): ${msg}`)
    return buildFallbackDraft(cluster, primary, `LLM合成失敗: ${msg}`)
  }
}

function urlKey(a: RawSourceArticle): string {
  return (a.canonicalUrl ?? a.url).split("?")[0].replace(/\/+$/, "").toLowerCase()
}

function isPromisingSingleton(article: RawSourceArticle): boolean {
  const t = article.title
  if (!t) return false
  const properNounCount = (t.match(/\b[A-Z][a-zA-Z0-9]{2,}\b/g) ?? []).length
  const acronymCount = (t.match(/\b[A-Z]{2,}\b/g) ?? []).length
  const hasNumber = /\d/.test(t)
  return properNounCount >= 2 || acronymCount >= 1 || (properNounCount >= 1 && hasNumber)
}

async function augmentSingletonClusters(
  clusters: RawSourceArticle[][],
  alreadyFetched: RawSourceArticle[],
  maxSeeds: number,
): Promise<RawSourceArticle[][]> {
  const excludeUrls = new Set(alreadyFetched.map(urlKey))

  const singletonIndexes: number[] = []
  for (let i = 0; i < clusters.length; i++) {
    if (clusters[i].length === 1 && isPromisingSingleton(clusters[i][0])) {
      singletonIndexes.push(i)
    }
  }
  const seeds = singletonIndexes.slice(0, maxSeeds)
  if (seeds.length === 0) return clusters

  const augmented = clusters.map((c) => [...c])
  await Promise.all(
    seeds.map(async (idx) => {
      const seed = augmented[idx][0]
      const found = await fetchSimilarArticles(seed.title, excludeUrls, 3)
      for (const f of found) {
        const k = urlKey(f)
        if (excludeUrls.has(k)) continue
        excludeUrls.add(k)
        augmented[idx].push(f)
      }
    }),
  )
  return augmented
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor++
      if (index >= items.length) return
      results[index] = await worker(items[index])
    }
  })
  await Promise.all(runners)
  return results
}

export async function runAutomationPipeline(
  rawArticles: RawSourceArticle[],
  deps?: { llm?: LLMClient | null },
): Promise<PipelineResult> {
  let llm: LLMClient | null
  if (deps && "llm" in deps) {
    llm = deps.llm ?? null
  } else {
    try {
      llm = getLLMClient()
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.warn(`[automation] LLMクライアント初期化失敗、fallback経路のみで動作: ${msg}`)
      llm = null
    }
  }

  const seen = new Set<string>()
  const deduped: RawSourceArticle[] = []
  for (const a of rawArticles) {
    const key = (a.canonicalUrl ?? a.url).split("?")[0].replace(/\/+$/, "").toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(a)
  }

  const MAX_CLUSTER_SIZE = 5
  const rawClusters = clusterArticles(deduped, readClusterOptionsFromEnv())
  const trimmed = rawClusters.map((c) =>
    c.length > MAX_CLUSTER_SIZE
      ? [...c]
          .sort((a, b) => a.connectorId.localeCompare(b.connectorId))
          .slice(0, MAX_CLUSTER_SIZE)
      : c,
  )

  const enableAugment = process.env.AUGMENT_SINGLETONS !== "0"
  const augmentLimit = Number(process.env.AUGMENT_MAX_SEEDS ?? 5)
  const clusters = enableAugment
    ? await augmentSingletonClusters(trimmed, deduped, augmentLimit)
    : trimmed
  const drafts = await mapWithConcurrency(clusters, 3, (cluster) => buildDraft(cluster, llm))

  return drafts.reduce<PipelineResult>(
    (acc, draft) => {
      if (draft.workflowStatus === "failed") {
        acc.failed.push(draft)
      } else if (draft.workflowStatus === "review") {
        acc.reviewQueue.push(draft)
      } else {
        acc.published.push(draft)
      }
      return acc
    },
    { published: [], reviewQueue: [], failed: [] },
  )
}
