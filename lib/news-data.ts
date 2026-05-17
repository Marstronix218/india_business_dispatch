export type Category =
  | "economy"
  | "regulation"
  | "social"
  | "culture"
  | "market"
  | "column"

export type IndustryTag =
  | "automotive"
  | "semiconductor"
  | "machine_tools"
  | "food"
  | "chemicals"
  | "logistics"
  | "agriculture"
  | "steel"
  | "education"
  | "entertainment"
  | "talent"

export type Topic =
  | "geopolitics"
  | "event"
  | "research"
  | "environment"
  | "startup"
  | "ma_partnership"

export type ContentType = "news" | "column" | "interview"
export type Visibility = "public" | "member"
export type WorkflowStatus = "published" | "review" | "failed"
export type QualityVerdict = "PASS" | "REVISION" | "REJECT"

export interface QualityCheckMeta {
  verdict: QualityVerdict
  notes?: string
  revisionCount: number
  checkedAt?: string
}

export interface MarketMetric {
  label: string
  value: string
  change: string
  unit: string
  asOf: string
}

export interface MarketSnapshot {
  fx: MarketMetric
  equities: MarketMetric
  rates: MarketMetric
  oil: MarketMetric
}

export interface SourceProvenance {
  originalTitle: string
  originalUrl: string
  canonicalUrl?: string
  originalPublishedAt?: string
  fetchedAt?: string
  extractedBy?: string
  sourceLanguage?: string
  evidenceSnippets?: string[]
  sourceName?: string
}

export interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl?: string
  publishedAt: string
  category: Category
  industryTags: IndustryTag[]
  topics?: Topic[]
  japanIndiaCollaboration?: boolean
  implications: string[]
  contentType: ContentType
  visibility: Visibility
  workflowStatus: WorkflowStatus
  imageUrl?: string
  featured?: boolean
  marketSnapshot?: MarketSnapshot
  provenance?: SourceProvenance
  sources?: SourceProvenance[]
  isSynthesized?: boolean
  qualityCheck?: QualityCheckMeta
}

export function getAllSources(article: NewsArticle): SourceProvenance[] {
  if (article.sources && article.sources.length > 0) return article.sources
  if (article.provenance) {
    return [{ ...article.provenance, sourceName: article.provenance.sourceName ?? article.source }]
  }
  return []
}

export const CATEGORY_LABELS: Record<Category, string> = {
  economy: "経済",
  regulation: "規制",
  social: "社会",
  culture: "文化",
  market: "市況",
  column: "コラム",
}

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  economy: "市場拡大、企業投資、産業トレンドを一覧で把握",
  regulation: "進出・調達・採用に影響する制度変更を整理",
  social: "消費者行動、教育、人材動向など現場の変化を観測",
  culture: "商習慣やローカル文脈を日本企業の実務に接続",
  market: "為替・株式・金利・原油の4指標を日次で確認",
  column: "編集部・寄稿・インタビューによる一次知見",
}

export const CATEGORY_COLORS: Record<Category, string> = {
  economy: "bg-primary text-primary-foreground",
  regulation: "bg-slate-600 text-white",
  social: "bg-emerald-700 text-white",
  culture: "bg-orange-500 text-white",
  market: "bg-zinc-800 text-white",
  column: "bg-secondary text-secondary-foreground",
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  news: "短報",
  column: "コラム",
  interview: "インタビュー",
}

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: "公開",
  member: "会員",
}

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  published: "公開中",
  review: "要確認",
  failed: "処理失敗",
}

export const INDUSTRY_LABELS: Record<IndustryTag, string> = {
  automotive: "自動車",
  semiconductor: "半導体",
  machine_tools: "工作機械",
  food: "食品",
  chemicals: "化学品",
  logistics: "物流",
  agriculture: "農業",
  steel: "鉄鋼",
  education: "教育",
  entertainment: "エンターテインメント",
  talent: "人材",
}

export const INDUSTRY_OPTIONS: IndustryTag[] = [
  "automotive",
  "semiconductor",
  "machine_tools",
  "food",
  "chemicals",
  "logistics",
  "agriculture",
  "steel",
  "education",
  "entertainment",
  "talent",
]

export const TOPIC_LABELS: Record<Topic, string> = {
  geopolitics: "国際情勢",
  event: "イベント・展示会",
  research: "学会・研究",
  environment: "環境・サステナビリティ",
  startup: "スタートアップ",
  ma_partnership: "M&A・提携",
}

export const TOPIC_OPTIONS: Topic[] = [
  "geopolitics",
  "event",
  "research",
  "environment",
  "startup",
  "ma_partnership",
]

export interface CategorySection {
  key: Category
  label: string
  enLabel: string
  kicker: string
  accent: string
}

export const CATEGORY_SECTIONS: CategorySection[] = [
  {
    key: "economy",
    label: "経済",
    enLabel: "Economy",
    kicker: "市場拡大、企業投資、産業トレンドを一覧で把握。",
    accent: "oklch(0.42 0.12 150)",
  },
  {
    key: "regulation",
    label: "規制",
    enLabel: "Regulation",
    kicker: "進出・調達・採用に影響する制度変更を整理。",
    accent: "oklch(0.55 0.12 250)",
  },
  {
    key: "social",
    label: "社会",
    enLabel: "Social",
    kicker: "消費者行動、教育、人材動向など現場の変化を観測。",
    accent: "oklch(0.55 0.18 30)",
  },
  {
    key: "culture",
    label: "文化",
    enLabel: "Culture",
    kicker: "商習慣やローカル文脈を日本企業の実務に接続。",
    accent: "oklch(0.68 0.21 42)",
  },
  {
    key: "market",
    label: "市況",
    enLabel: "Market & Indicators",
    kicker: "為替・株式・金利・原油の4指標を日次で確認。",
    accent: "oklch(0.50 0.11 30)",
  },
  {
    key: "column",
    label: "コラム",
    enLabel: "Editorial & Columns",
    kicker: "編集部・寄稿・インタビューによる一次知見。",
    accent: "oklch(0.45 0.10 280)",
  },
]

export type ImagePlaceholderTone = "warm" | "cool" | "green" | "default"

export function deriveImageTone(article: NewsArticle): ImagePlaceholderTone {
  switch (article.category) {
    case "economy":
      return "green"
    case "regulation":
      return "cool"
    case "social":
      return "warm"
    case "culture":
      return "warm"
    case "market":
      return "cool"
    case "column":
      return "green"
    default:
      return "default"
  }
}

export const CATEGORY_OPTIONS: Category[] = [
  "economy",
  "regulation",
  "social",
  "culture",
  "market",
  "column",
]

export const CONTENT_TYPE_OPTIONS: ContentType[] = [
  "news",
  "column",
  "interview",
]

export const VISIBILITY_OPTIONS: Visibility[] = ["public", "member"]
export const WORKFLOW_STATUS_OPTIONS: WorkflowStatus[] = [
  "published",
  "review",
  "failed",
]

export const MARKET_METRIC_ORDER: Array<keyof MarketSnapshot> = [
  "fx",
  "equities",
  "rates",
  "oil",
]

export const DEFAULT_MARKET_SNAPSHOT: MarketSnapshot = {
  fx: {
    label: "為替",
    value: "₹1 = ¥1.83",
    change: "+0.7%",
    unit: "INR/JPY",
    asOf: "2026-04-16 15:00 IST",
  },
  equities: {
    label: "株式",
    value: "24,515.4",
    change: "+0.5%",
    unit: "Nifty 50",
    asOf: "2026-04-16 15:00 IST",
  },
  rates: {
    label: "金利",
    value: "7.03",
    change: "-0.04pt",
    unit: "10年国債",
    asOf: "2026-04-16 15:00 IST",
  },
  oil: {
    label: "原油",
    value: "82.6",
    change: "+1.1%",
    unit: "Brent",
    asOf: "2026-04-16 15:00 IST",
  },
}

const LEGACY_CATEGORY_MAP: Record<string, Category> = {
  economy: "economy",
  policy: "regulation",
  regulation: "regulation",
  corporate: "economy",
  startup: "economy",
  social: "social",
  culture: "culture",
  market: "market",
  column: "column",
}

export function normalizeLegacyCategory(category: string): Category {
  return LEGACY_CATEGORY_MAP[category] ?? "economy"
}

export function formatArticleDate(date: string) {
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatArticleShortDate(date: string) {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const JST_DATETIME_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const JST_DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export function formatJstDateTime(value: string | undefined | null): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return `${JST_DATETIME_FORMATTER.format(d)} JST`
}

export function formatJstDate(value: string | undefined | null): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return JST_DATE_FORMATTER.format(d)
}

const MS_PER_DAY = 86_400_000

function recencyScore(publishedAt: string, now: number): number {
  const ts = new Date(publishedAt).getTime()
  if (Number.isNaN(ts)) return 0
  const days = (now - ts) / MS_PER_DAY
  if (days <= 1) return 100
  if (days <= 3) return 70
  if (days <= 7) return 40
  if (days <= 30) return 15
  return 0
}

export function computePopularityScore(
  article: NewsArticle,
  now: number = Date.now(),
): number {
  let score = recencyScore(article.publishedAt, now)

  const sources = getAllSources(article)
  if (sources.length >= 2) score += 30

  if (article.imageUrl) score += 20

  const summaryLen = article.summary?.length ?? 0
  if (summaryLen >= 800) score += 10
  if (summaryLen >= 1200) score += 5

  if (article.implications && article.implications.length >= 3) score += 10

  if (article.featured) score += 25

  return score
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "1",
    title: "インド政府、半導体パッケージ支援の第2弾を準備",
    summary:
      "中央政府が半導体の後工程と周辺材料を対象にした追加支援策の詳細を詰めており、州政府側でも設備投資補助や用地優遇の条件見直しが進んでいる。今回の焦点は前工程の大型誘致よりも、組立・検査・封止材・精密部材といった裾野領域をどう厚くするかに移っている点だ。既存の電子機器メーカーやEMSも調達先の現地化を急ぎ始めており、日本企業にとっては装置、治具、検査、保守教育まで含めた周辺提案の余地が大きい。一方で、支援条件は州ごとの差がまだ大きく、電力安定性や人材供給まで含めて立地を比較しないと投資採算がぶれやすい局面に入っている。",
    source: "Ministry of Electronics & IT",
    sourceUrl: "https://www.meity.gov.in/",
    publishedAt: "2026-04-15",
    category: "economy",
    industryTags: ["semiconductor", "machine_tools"],
    topics: ["ma_partnership"],
    implications: [
      "勝機あり: 後工程装置、検査機、素材周辺の提案余地が大きい。",
      "注意点: 補助金条件は州ごとの差が大きく、立地比較が必須。",
      "次アクション: 現地候補州ごとに電力・物流・人材の確保条件を並べて比較する。",
    ],
    contentType: "news",
    visibility: "public",
    workflowStatus: "published",
    imageUrl: "/images/article-2.jpg",
    featured: true,
  },
  {
    id: "2",
    title: "港湾混雑の緩和で西部回廊の自動車輸送が改善",
    summary:
      "ムンバイ周辺港湾の混雑が足元でやや緩和し、西部工業地帯からの完成車・部品輸送に改善の兆しが出ている。とくにナバシェバ周辺では通関と内陸配送の滞留が縮まり、物流各社は内陸倉庫の再配置やクロスドック機能の増強を急いでいる。日系自動車関連企業では、これまで港湾遅延を前提に厚めに積んでいた在庫を見直し、販売計画に合わせた補充頻度へ戻す動きが出始めた。ただし改善は西部中心で、北部や内陸奥地向けの配送は依然として道路事情の差が大きい。調達と販売の両面で、拠点別のリードタイムを再計測して運用を更新する必要がある。",
    source: "Logistics Insider API",
    sourceUrl: "https://www.logisticsinsider.in/10-minutes-to-melt-can-quick-commerce-keep-its-cool/",
    publishedAt: "2026-04-14",
    category: "economy",
    industryTags: ["automotive", "logistics"],
    implications: [
      "勝機あり: 部品在庫の現地保有を増やし、短納期案件を取り込みやすい。",
      "注意点: 港湾改善は地域差があり、北部向け配送はなお不安定。",
      "次アクション: 調達拠点別にリードタイムを再計測し、配送設計を更新する。",
    ],
    contentType: "news",
    visibility: "public",
    workflowStatus: "published",
    imageUrl: "/images/article-10.jpg",
  },
  {
    id: "3",
    title: "就労ビザ申請で技能証明の添付要件が厳格化",
    summary:
      "外国人専門職の就労ビザ申請で、学歴証明に加えて職務実績の詳細説明やプロジェクト履歴の添付を求めるケースが増えている。とくに製造、IT、専門サービス分野では、肩書きだけではなく何を担当し、どのような技能を現地で発揮するのかを具体的に示すことが求められている。結果として、採用内定後に書類補完が発生し、着任までのリードタイムが想定より伸びる企業が出ている。日本本社の駐在前提で組んだ計画ほど影響を受けやすく、現地採用や短期出張との組み合わせを含めた代替案を先に用意しておく必要がある。人事、法務、現場責任者の三者で説明文のテンプレートを持っておくことが重要になっている。",
    source: "Business Standard",
    sourceUrl: "https://www.business-standard.com/",
    publishedAt: "2026-04-13",
    category: "regulation",
    industryTags: ["talent"],
    implications: [
      "注意点: 日本本社からの駐在・出張前提で採用計画を組むと遅延しやすい。",
      "次アクション: 職務記述書とプロジェクト実績の英文テンプレートを先に整備する。",
      "代替策: 現地採用比率を高め、立ち上げ初期の常駐依存を下げる。",
    ],
    contentType: "news",
    visibility: "public",
    workflowStatus: "published",
    imageUrl: "/images/article-11.jpg",
  },
  {
    id: "4",
    title: "都市部の教育支出増で日系EdTech提携の相談が拡大",
    summary:
      "都市部の中間所得層で教育支出が増え、語学、STEM、資格講座などの学校外学習市場が拡大している。保護者の支出姿勢は依然として価格感度が高いものの、単なる授業提供だけでなく、進学・就職につながる成果を示せるサービスへの評価は上がっている。現地プレイヤーだけで完結するのではなく、日本の教育コンテンツや職業訓練ノウハウを組み合わせたいという相談も増えており、日系企業には直営進出より提携型での入口が広がっている。州や都市によって言語対応や支払い能力に差があるため、ひとつの商品設計で全国展開するより、提携先と共同で地域別に構成を調整するアプローチが現実的だ。",
    source: "Education Market Feed",
    sourceUrl: "https://www.educationworld.in/",
    publishedAt: "2026-04-12",
    category: "social",
    industryTags: ["education", "talent"],
    topics: ["startup"],
    japanIndiaCollaboration: true,
    implications: [
      "勝機あり: 直営よりも現地パートナー連携型の参入が成立しやすい。",
      "注意点: 価格感度が高く、都市別に商品構成を分ける必要がある。",
      "次アクション: B2B2C の販路候補として学校法人と人材育成企業を洗い出す。",
    ],
    contentType: "news",
    visibility: "public",
    workflowStatus: "published",
    imageUrl: "/images/article-8.jpg",
  },
  {
    id: "5",
    title: "地域言語コンテンツの伸長で日本IPの配信戦略が変化",
    summary:
      "動画配信市場ではヒンディー語以外の地域言語コンテンツが着実に存在感を高めており、日本発IPの展開でもローカライズの深さが成否を分ける局面に入っている。従来は英語字幕や一部吹き替えでも一定の反応が取れたが、現在は州ごとの視聴文化に合わせて配信時期、訴求クリエイティブ、物販連動を調整する事業者が伸びている。日本企業にとっては、コンテンツ単体の販売よりも、配信、イベント、ライセンス商品を横断して展開するほうが収益の厚みを作りやすい。一方で、全国一律の販促設計では反応差が大きく、どの地域言語から優先して手を付けるかの見極めが必要になっている。",
    source: "Hindustan Media Ventures",
    sourceUrl: "https://www.hindustantimes.com/",
    publishedAt: "2026-04-11",
    category: "culture",
    industryTags: ["entertainment"],
    topics: ["startup"],
    japanIndiaCollaboration: true,
    implications: [
      "勝機あり: 地域言語対応を前提にした配信・物販連動が有効。",
      "注意点: 一括で英語化するだけでは拡散しづらくなっている。",
      "次アクション: 州別の視聴データを見て、優先言語の翻訳順を決める。",
    ],
    contentType: "news",
    visibility: "public",
    workflowStatus: "published",
    imageUrl: "/images/article-14.jpg",
  },
  {
    id: "6",
    title: "4月16日の為替・株式・金利・原油: ルピー堅調、株高継続",
    summary:
      "4月16日のインド市場は、ルピーが対円でやや持ち直し、株式市場では主要指数が続伸した一方、長期金利はやや低下、原油は中東情勢を背景に上昇した。ルピーの底堅さは資金流入と金利見通しの落ち着きを反映しており、輸入比率の高い企業にとっては一時的なコスト安定要因になる。一方で株価上昇は国内需要と大型投資への期待感を映しているが、原油高が続けば輸送・化学・素材コストには逆風となる。日系企業としては、短期の為替水準だけを見るのではなく、株式センチメント、資金調達金利、エネルギーコストをまとめて見て、価格改定や仕入れタイミングの判断材料にする必要がある日だ。",
    source: "編集部マーケットまとめ",
    publishedAt: "2026-04-16",
    category: "market",
    industryTags: [],
    implications: [
      "注意点: 原油高が輸送費と化学素材コストの上昇圧力になる。",
      "次アクション: 為替だけでなく金利と原油も合わせて見て月次収支前提を更新する。",
      "確認項目: 値上げ交渉や仕入れ前倒しの必要性を今週中に点検する。",
    ],
    contentType: "news",
    visibility: "public",
    workflowStatus: "published",
    imageUrl: "/images/article-1.jpg",
    marketSnapshot: DEFAULT_MARKET_SNAPSHOT,
  },
  {
    id: "7",
    title: "現地工場の購買責任者が語る、工作機械選定で外せない3条件",
    summary:
      "西インドで工場立ち上げを担った購買責任者への寄稿。現場では本体価格だけでなく、故障時に誰が何日で来られるか、交換部品をどこから何日で調達できるか、立ち上げ後に現地スタッフへどこまで教育を移管できるかが発注判断を大きく左右しているという。日本側は高精度を強みに語りがちだが、現地では停止時間の短さと復旧の確実性がより重視される。結果として、納入後の保守体制や教育パッケージまで含めて提案した企業の方が、価格競争を避けながら採用されやすい。設備販売を単発商材ではなく運用支援まで含めた契約として組み直す視点が重要だと指摘している。",
    source: "編集部寄稿",
    publishedAt: "2026-04-10",
    category: "column",
    industryTags: ["machine_tools", "automotive"],
    implications: [
      "勝機あり: 納入後の教育と保守を含む提案は価格競争を避けやすい。",
      "注意点: 日本本社の基準だけでベンダー評価すると導入速度が落ちる。",
      "次アクション: 販売代理店ではなく保守実行体制まで商談時に確認する。",
    ],
    contentType: "column",
    visibility: "member",
    workflowStatus: "published",
    imageUrl: "/images/article-6.jpg",
  },
  {
    id: "8",
    title: "食品加工向け包装材の国産化が進み、輸入仕様の見直し圧力",
    summary:
      "食品加工業界では包装材の国産化が進み、従来は輸入仕様を前提にしていた調達設計の見直し圧力が強まっている。現地サプライヤーの品質が一気に均一化したわけではないが、認証対応や供給安定性を備えた企業が増えたことで、価格だけでなく調達スピードの面で優位性が出始めている。日系企業にとっては高機能材をそのまま輸入するモデルだけでは不利になりやすく、現地加工や共同開発を含めた選択肢を持つ必要がある。食品安全基準や包材認証の運用差も残るため、営業と品質保証の両面から現地パートナーの絞り込みを進めることが重要になっている。",
    source: "Food Industry Monitor",
    sourceUrl: "https://www.foodprocessingindia.gov.in/",
    publishedAt: "2026-04-09",
    category: "economy",
    industryTags: ["food", "chemicals"],
    topics: ["environment"],
    implications: [
      "勝機あり: 高機能包装材や品質保証の仕組みは差別化余地が大きい。",
      "注意点: 現地調達比率の要求が強まっており、輸入一本足は不利。",
      "次アクション: 認証対応可能な現地加工パートナー候補を早めに確保する。",
    ],
    contentType: "news",
    visibility: "public",
    workflowStatus: "published",
    imageUrl: "/images/article-12.jpg",
  },
  {
    id: "9",
    title: "冷蔵物流の投資拡大で農業・食品サプライチェーンが再編",
    summary:
      "冷蔵倉庫と保冷輸送への投資が増え、生鮮と加工食品の流通設計が大きく変わり始めている。これまでロス前提で設計されていた区間に温度管理が入り、農業と食品の境界領域で在庫可視化や品質保証ソリューションへの需要が高まっている。とくに大都市向けの広域流通では、冷蔵輸送そのものだけでなく、倉庫の回転率、温度記録、配送遅延時の代替ルート設計まで含めた運用提案が求められている。日系企業にとっては設備販売だけでなく、運用データや保守も含めた長期契約の余地があり、コールドチェーンを支える周辺領域で商機が広がっている。",
    source: "Agri Logistics Feed",
    sourceUrl: "https://agricoop.nic.in/",
    publishedAt: "2026-04-08",
    category: "economy",
    industryTags: ["agriculture", "logistics", "food"],
    topics: ["environment"],
    implications: [
      "勝機あり: 温度記録、在庫見える化、品質保証の周辺需要が伸びる。",
      "注意点: 州またぎ流通では依然として道路事情の差が大きい。",
      "次アクション: コールドチェーン運営会社との提携可否を先に確認する。",
    ],
    contentType: "news",
    visibility: "public",
    workflowStatus: "published",
    imageUrl: "/images/article-4.jpg",
  },
  {
    id: "10",
    title: "進出済み日系企業に聞く、採用競争下で定着率を上げた評価制度",
    summary:
      "チェンナイで事業を拡大する日系企業へのインタビュー。現地の採用競争が激しくなる中、賃金だけで引き留めるのではなく、評価理由の透明化、上司との定期1on1、昇格条件の明文化を進めたことで定着率が改善したという。日本本社の曖昧な期待値をそのまま持ち込むと、現地社員には将来像が見えにくくなり、転職市場が活発な地域ほど離職につながりやすい。逆に、何を達成すると評価されるのかを開示し、研修機会と連動させたことで、採用広報でも好影響が出た。評価制度は人事施策に見えて、実際には採用競争力そのものに直結しているという示唆が強い。",
    source: "編集部インタビュー",
    publishedAt: "2026-04-07",
    category: "column",
    industryTags: ["talent", "automotive"],
    implications: [
      "勝機あり: 評価制度の見える化は採用広報にも転用できる。",
      "注意点: 日本式の曖昧な査定理由は離職リスクを高めやすい。",
      "次アクション: 現地管理職向けに面談スクリプトと評価説明資料を整備する。",
    ],
    contentType: "interview",
    visibility: "member",
    workflowStatus: "published",
    imageUrl: "/images/article-13.jpg",
  },
  {
    id: "11",
    title: "鋼材価格の戻りで自動車向け調達契約の改定交渉が活発化",
    summary:
      "鋼材市況の戻りを受け、自動車部品各社で四半期ごとの価格改定交渉が増えている。年次一括契約では変動を吸収しにくくなり、日系メーカーでも現地サプライヤーとの契約条件を見直す動きが広がっている。とくに量産立ち上げ期は原材料スライド条項の有無が採算に直結し、鋼材だけでなく物流や電力の変動も含めて交渉材料に持ち込む企業が増えている。市場価格の上昇局面では、代替材提案や共同購買の枠組みも商談の入口になりやすく、調達部門だけでなく営業・設計とも連携して条件を見直す必要がある。",
    source: "Steel Market Watch",
    sourceUrl: "https://steel.gov.in/",
    publishedAt: "2026-04-06",
    category: "economy",
    industryTags: ["steel", "automotive"],
    topics: ["ma_partnership"],
    implications: [
      "注意点: 年次一括契約では価格変動を吸収しにくい局面に入っている。",
      "勝機あり: 代替材提案や共同購買の打診は商談の入口になりやすい。",
      "次アクション: 原材料スライド条項の有無を既存契約で総点検する。",
    ],
    contentType: "news",
    visibility: "public",
    workflowStatus: "published",
    imageUrl: "/images/article-5.jpg",
  },
  {
    id: "12",
    title: "輸入ライセンス運用の追加説明待ちで、規制記事をレビューキューへ",
    summary:
      "制度改定の一次情報は取得済みだが、現地実務での解釈が複数に分かれているため公開前レビューへ移送したサンプル。規制カテゴリでは条文の発表と現場運用の間に時間差があり、通関、販売、法務で受け止め方が割れるケースが少なくない。とくに輸入ライセンスや品質表示の領域では、地方当局ごとの差も出やすいため、発表直後の情報をそのまま断定的に出すと誤解を招く。運用が安定するまでは非公開キューに落とし、人確認で補足する設計を残しておくことが、全自動運用でも重要になる。",
    source: "Internal Queue",
    publishedAt: "2026-04-05",
    category: "regulation",
    industryTags: ["chemicals", "food"],
    implications: [
      "注意点: 規制運用が固まる前の拡散は誤判断につながりやすい。",
      "次アクション: 法務・通関・販売現場の3視点で解釈を照合する。",
    ],
    contentType: "news",
    visibility: "member",
    workflowStatus: "review",
    imageUrl: "/images/article-11.jpg",
  },
  {
    id: "13",
    title: "要約生成に失敗した記事サンプル",
    summary:
      "翻訳結果が空で示唆生成にも失敗したため、公開対象から除外したサンプル。失敗データを残しておくことで、後から収集条件や翻訳プロンプトを調整し、再処理の対象を特定しやすくしている。全自動運用では成功記事だけを見ると問題が見えにくくなるため、失敗件数と失敗理由を管理画面で把握できるようにしておくことが重要になる。将来的に自動再実行や運用アラートを入れる前提でも、まずは失敗が発生した時点の状態を保持することを優先している。",
    source: "Automation Log",
    publishedAt: "2026-04-04",
    category: "economy",
    industryTags: ["logistics"],
    implications: ["処理失敗サンプル。公開はされない。"],
    contentType: "news",
    visibility: "member",
    workflowStatus: "failed",
  },
]

export function getPublicSeedArticles() {
  return NEWS_ARTICLES.filter((article) => article.workflowStatus === "published")
}
