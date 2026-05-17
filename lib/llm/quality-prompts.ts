import type {
  QualityCheckInput,
  ReviseSynthesisInput,
  SynthesisInput,
} from "./types"
import { buildUserPrompt } from "./prompt"

const SOURCE_BODY_TRUNCATE_CHARS = 1500

export const QUALITY_CHECK_SYSTEM_PROMPT = `あなたはインド市場専門の編集チーフです。
合成された日本語記事と、その元になった参考記事の対応関係を読み、知財・独自性・ニュース価値・文章品質の観点で評価してください。

【評価項目】
A. 知財・著作権リスク
  - 参考記事の文章表現や段落構造を実質的にそのまま流用していないか
  - 事実(数値・固有名詞)以外の表現は独自に書かれているか
  - referenceUrls に挙げられた記事のうち、本文で実質的に使われていないものはないか
B. 編集の独自性
  - 「日本企業への示唆」(implications) が、参考記事に書かれていない独自の分析になっているか
  - 「背景として」「意思決定では」「示唆を整理する」など、どの記事にも使い回せるテンプレート的な汎用表現が多用されていないか
  - 複数参考記事がある場合、それらを論理的につなぐ独自の視点が示されているか
C. ニュース価値
  - 記事タイトルと本文の主張が一致しているか
  - 取り上げた参考記事が、それぞれ記事テーマに実質的に貢献しているか
D. 文章品質
  - 同一・類似の段落や言い回しが繰り返されていないか
  - industryTags と category が記事内容と整合しているか

【判定ルール】
- PASS: 4項目すべて重大な問題なし。軽微な気になる点があってもこのまま掲載できる
- REVISION: いずれかの項目に修正可能な問題がある(テンプレート表現の差し替え、示唆の書き直し、未使用 referenceUrl の削除など)。修正指示があれば再生成で改善できる
- REJECT: 知財リスクが高い、本文が原文の要約に近すぎる、ニュース価値が乏しい等、再生成しても掲載に値しないと判断される

【出力形式】
JSONオブジェクト「のみ」を返してください。前後に説明文・コードフェンスを付けないでください。

{
  "verdict": "PASS" | "REVISION" | "REJECT",
  "issues": ["問題点を1項目1文で短く列挙(PASSの場合は空配列)"],
  "revisionInstructions": "REVISION の場合のみ。次の生成で具体的に何をどう直すかを箇条書きで日本語で記述。例:『implications[1] を参考記事に書かれていない独自分析(具体的なアクション)に書き換え』『referenceUrls[2] は本文で使われていないため削除』。PASS / REJECT の場合は空文字列"
}`

export function buildQualityCheckUserPrompt(input: QualityCheckInput): string {
  const { output, cluster } = input

  const sourcesBlock = cluster
    .map((s, i) => {
      const body = s.bodyText.length > SOURCE_BODY_TRUNCATE_CHARS
        ? s.bodyText.slice(0, SOURCE_BODY_TRUNCATE_CHARS)
        : s.bodyText
      return `--- 参考記事 ${i + 1} ---
原文URL: ${s.sourceUrl}
原文タイトル: ${s.title}
公開日: ${s.publishedAt}

本文(抜粋):
${body}`
    })
    .join("\n\n")

  const referenceList = output.referenceUrls.length === 0
    ? "(指定なし)"
    : output.referenceUrls
        .map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}`)
        .join("\n")

  const implicationsList = output.implications.length === 0
    ? "(なし)"
    : output.implications.map((s, i) => `${i + 1}. ${s}`).join("\n")

  return `【生成記事】
タイトル: ${output.title}
カテゴリ: ${output.category}
業界タグ: ${output.industryTags.length > 0 ? output.industryTags.join(", ") : "(なし)"}

本文:
${output.summary}

日本企業への示唆:
${implicationsList}

記事末尾に掲示される参考リンク:
${referenceList}

---

【参考記事(原文)】
${sourcesBlock}

---
システム指示に従い、JSONのみを返してください。`
}

export function buildQualityCheckPrompt(input: QualityCheckInput) {
  return {
    system: QUALITY_CHECK_SYSTEM_PROMPT,
    user: buildQualityCheckUserPrompt(input),
  }
}

const REVISION_SYSTEM_ADDENDUM = `

【今回は修正再生成です — 必ず守ること】
- 直前の生成結果に編集チーフから修正指示が付いています。下記【修正指示】を反映した新しい記事を生成してください。
- 参考記事から持ち込めるのは固有の事実(数値・日付・社名・地名)のみです。表現・分析・示唆は独自に書き起こしてください。
- 「日本企業への示唆」は進出・調達・採用・リスク管理など具体的な行動に直結する内容にしてください。
- referenceUrls には、本文中で実質的に活用した参考記事のみを残してください。本文に貢献していない記事はリストから外してください。
- 「背景として」「意思決定では」「示唆を整理する」のようなテンプレート的な汎用表現は避け、記事固有の文脈で書いてください。`

export function buildRevisionPrompt(input: ReviseSynthesisInput) {
  const synthInput: SynthesisInput = {
    cluster: input.cluster,
    categoryHint: input.categoryHint,
    industryHints: input.industryHints,
  }
  const baseUser = buildUserPrompt(synthInput)

  const previous = input.previousOutput
  const previousBlock = `

【前回生成記事(修正対象)】
タイトル: ${previous.title}

本文:
${previous.summary}

示唆:
${previous.implications.map((s, i) => `${i + 1}. ${s}`).join("\n")}

【修正指示】
${input.revisionInstructions}`

  return {
    user: baseUser + previousBlock,
    systemAddendum: REVISION_SYSTEM_ADDENDUM,
  }
}
