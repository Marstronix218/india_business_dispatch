import {
  type Category,
  INDUSTRY_LABELS,
  type IndustryTag,
  type NewsArticle,
  normalizeLegacyCategory,
} from "@/lib/news-data"
import { cleanText, ensureMinimumSummaryLength } from "@/lib/summary-utils"

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

export function buildDedupeKey(title: string) {
  return cleanText(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 8)
    .join("-")
}

export function translateToJapanesePreview(bodyText: string) {
  const cleaned = cleanText(bodyText)
  if (!cleaned) return ""
  return cleaned.slice(0, 2400)
}

export function buildSummary(bodyText: string) {
  const translated = translateToJapanesePreview(bodyText)
  return ensureMinimumSummaryLength(translated, 500)
}

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

function buildDraft(group: RawSourceArticle[]): PipelineDraft {
  const primary = [...group].sort((a, b) => a.connectorId.localeCompare(b.connectorId))[0]
  const summary = buildSummary(primary.bodyText)
  const category = normalizeLegacyCategory(primary.legacyCategory ?? "economy")
  const industryTags = primary.industryHints ?? []

  if (!summary) {
    return {
      dedupeKey: buildDedupeKey(primary.title),
      title: primary.title,
      summary: "",
      source: primary.source,
      sourceUrl: primary.url,
      publishedAt: primary.publishedAt,
      category,
      industryTags,
      implications: [],
      contentType: "news",
      visibility: "member",
      workflowStatus: "failed",
      originConnectorIds: group.map((item) => item.connectorId),
      failureReason: "要約生成に失敗",
    }
  }

  const workflowStatus =
    category === "regulation" && group.length === 1 ? "review" : "published"

  return {
    dedupeKey: buildDedupeKey(primary.title),
    title: primary.title,
    summary,
    imageUrl: primary.imageUrl,
    source: primary.source,
    sourceUrl: primary.url,
    publishedAt: primary.publishedAt,
    category,
    industryTags,
    implications: buildImplications(industryTags, category),
    contentType: "news",
    visibility: "public",
    workflowStatus,
    originConnectorIds: group.map((item) => item.connectorId),
  }
}

export function runAutomationPipeline(
  rawArticles: RawSourceArticle[],
): PipelineResult {
  const grouped = dedupeArticles(rawArticles)
  const drafts = Array.from(grouped.values()).map(buildDraft)

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
