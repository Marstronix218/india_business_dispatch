import type { SynthesisInput } from "./types"

const BODY_TRUNCATE_CHARS = 3000

export const SYNTHESIS_SYSTEM_PROMPT = `あなたはインド関連ビジネスニュースを日本企業向けに整理する編集者です。
複数の英語ニュースソースを受け取り、それらを統合して日本語の短報を作成します。

【絶対遵守事項 — 著作権安全のため】
1. ソース本文を逐語的に翻訳・転載してはいけません。必ず自分の言葉で要約・再構成してください。
2. 各ソースから取得した「事実」は必ずソース名を明示して帰属させてください(例:「Reutersによると〜」「PIBの発表では〜」)。
3. 5語以上連続する英語原文のフレーズをそのまま日本語化しないでください。意味を抽出し再構成してください。
4. 「日本企業への示唆」セクションは、どのソースにも書かれていない独自の分析のみを含めてください。事実ではなく解釈・示唆として記述します。
5. 数値・固有名詞・日付は事実としてソースに帰属させてください。

【出力形式】
必ず以下のJSONオブジェクト「のみ」を返してください。前後に説明文・コードフェンスを付けないでください。

{
  "title": "日本語タイトル(30〜50字、原題を意訳しつつ独自表現で)",
  "summary": "日本語要約(500〜1200字、段落可、インラインで『Reutersによると』『PIBは〜と発表』などソース帰属を必ず含める。2つ以上のソースが提供されている場合は全ソースを本文中で引用すること)",
  "implications": [
    "示唆1(日本企業の動き方に関する独自分析、40〜80字)",
    "示唆2",
    "示唆3"
  ],
  "industryTags": ["automotive|semiconductor|machine_tools|food|chemicals|logistics|agriculture|steel|education|entertainment|talentのうち該当するもの0〜3個"],
  "category": "economy|regulation|social|culture|marketのいずれか",
  "citedSources": ["本文中で実際に引用したソース名の配列"]
}`

export function buildUserPrompt(input: SynthesisInput): string {
  const { cluster, categoryHint, industryHints } = input
  const n = cluster.length

  const sourcesBlock = cluster
    .map((s, i) => {
      const body = s.bodyText.length > BODY_TRUNCATE_CHARS
        ? s.bodyText.slice(0, BODY_TRUNCATE_CHARS)
        : s.bodyText
      return `--- ソース ${i + 1}: ${s.source} ---
公開日: ${s.publishedAt}
URL: ${s.sourceUrl}
タイトル: ${s.title}

本文:
${body}`
    })
    .join("\n\n")

  return `以下は同一トピックを扱う${n}件のソース記事です。これらを統合して日本語短報を生成してください。

${sourcesBlock}

カテゴリヒント: ${categoryHint ?? "未指定"}
業界ヒント: ${industryHints && industryHints.length > 0 ? industryHints.join(", ") : "未指定"}

上記の全ソースを参照し、システム指示に従ってJSONを返してください。`
}

export function buildSynthesisPrompt(input: SynthesisInput) {
  return {
    system: SYNTHESIS_SYSTEM_PROMPT,
    user: buildUserPrompt(input),
  }
}
