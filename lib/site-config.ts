export type LeadType = "expansion" | "hiring"
export type CompanySize = "under_50" | "under_100" | "over_100"
export type DigestFrequency = "daily" | "weekly"

export interface LeadInquiry {
  leadType: LeadType
  companyName: string
  contactName: string
  email: string
  companySize: CompanySize
  message: string
}

export interface MembershipSignup {
  companyName: string
  contactName: string
  email: string
  frequency: DigestFrequency
}

export interface PricingPlan {
  id: string
  name: string
  audience: string
  priceLabel: string
  termLabel: string
  seatsLabel?: string
  summary: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  featured?: boolean
}

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  expansion: "インド進出を相談したい",
  hiring: "インド人材を採用したい",
}

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  under_50: "50名以下",
  under_100: "100名以下",
  over_100: "100名超",
}

export const DIGEST_FREQUENCY_LABELS: Record<DigestFrequency, string> = {
  daily: "毎日ダイジェスト",
  weekly: "週次ダイジェスト",
}

export const MEMBERSHIP_BENEFITS = [
  "毎日または週次のインド市場ダイジェスト",
  "業界タグ付きの新着短報を日本語で受信",
  "無料会員登録後に法人向けパイロット資料を案内",
]

export const EDITORIAL_PILLARS = [
  "RSS/API優先でソースを取得",
  "約500文字の日本語要約を公開",
  "日本企業への示唆を3点以内で整理",
]

export const AUTOMATION_STAGES = [
  "収集",
  "重複排除",
  "翻訳",
  "短要約生成",
  "示唆生成",
  "カテゴリ・業界タグ付与",
  "公開",
]

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free-member",
    name: "無料会員",
    audience: "進出検討中の担当者向け",
    priceLabel: "0円",
    termLabel: "登録無料",
    summary: "まずは市場感を掴みたい企業向けの入口プラン。",
    features: [
      "日次または週次ダイジェスト",
      "新着短報の受信",
      "法人向け資料請求の優先案内",
    ],
    ctaLabel: "無料会員登録",
    ctaHref: "/pricing",
  },
  {
    id: "corp-50",
    name: "法人パイロット 50名以下",
    audience: "現地調査を進める少人数チーム向け",
    priceLabel: "要問い合わせ",
    termLabel: "最低6か月 / 初月無料",
    seatsLabel: "50名以下",
    summary: "業界別ウォッチと相談窓口をまとめて導入する基本プラン。",
    features: [
      "業界別ウォッチリスト",
      "メール配信のカスタマイズ",
      "進出・採用の相談窓口",
    ],
    ctaLabel: "資料請求",
    ctaHref: "/contact?leadType=expansion",
    featured: true,
  },
  {
    id: "corp-100",
    name: "法人パイロット 100名以下",
    audience: "複数部門で利用する中規模組織向け",
    priceLabel: "要問い合わせ",
    termLabel: "最低6か月 / 初月無料",
    seatsLabel: "100名以下",
    summary: "経営・事業・採用チームでの横断利用を想定した拡張プラン。",
    features: [
      "部門別の配信テーマ設計",
      "月次レビューの壁打ち",
      "人材採用テーマの追加監視",
    ],
    ctaLabel: "相談する",
    ctaHref: "/contact?leadType=expansion",
  },
  {
    id: "corp-enterprise",
    name: "法人パイロット Enterprise",
    audience: "100名超または複数拠点運営企業向け",
    priceLabel: "個別見積",
    termLabel: "最低6か月 / 初月無料",
    seatsLabel: "100名超",
    summary: "既進出企業の情報需要と運用体制に合わせて設計する個別プラン。",
    features: [
      "拠点別の監視テーマ設定",
      "会員向けインタビュー・コラム配信",
      "専任窓口による伴走支援",
    ],
    ctaLabel: "見積もり依頼",
    ctaHref: "/contact?leadType=expansion",
  },
]
