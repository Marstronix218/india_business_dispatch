import { extractJsonObject } from "./parse"
import { LLMError, type QualityCheckOutput, type QualityVerdict } from "./types"

export function parseQualityCheckOutput(raw: string): QualityCheckOutput {
  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonObject(raw))
  } catch (error) {
    throw new LLMError("品質チェック応答のJSONパースに失敗", error)
  }

  if (!parsed || typeof parsed !== "object") {
    throw new LLMError("品質チェック応答がオブジェクトではありません")
  }

  const obj = parsed as Record<string, unknown>
  const verdict = normalizeVerdict(obj.verdict)
  const issues = normalizeIssues(obj.issues)
  const revisionInstructions = typeof obj.revisionInstructions === "string"
    ? obj.revisionInstructions.trim()
    : ""

  if (verdict === "REVISION" && !revisionInstructions) {
    throw new LLMError("品質チェック応答: verdict=REVISION だが revisionInstructions が空")
  }

  return {
    verdict,
    issues,
    revisionInstructions: revisionInstructions || undefined,
  }
}

function normalizeVerdict(value: unknown): QualityVerdict {
  if (typeof value !== "string") {
    throw new LLMError("品質チェック応答に verdict フィールドがありません")
  }
  const upper = value.trim().toUpperCase()
  if (upper === "PASS" || upper === "REVISION" || upper === "REJECT") return upper
  throw new LLMError(`品質チェック応答の verdict が不正: ${value}`)
}

function normalizeIssues(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === "string")
    .map((s) => s.trim())
    .filter(Boolean)
}
