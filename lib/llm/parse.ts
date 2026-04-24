import type { SynthesisOutput } from "./types"
import { LLMError } from "./types"

export function extractJsonObject(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenceMatch) {
    const inner = fenceMatch[1].trim()
    if (inner.startsWith("{") && inner.endsWith("}")) return inner
  }

  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)

  throw new LLMError("LLM応答にJSONオブジェクトが見つかりません")
}

export function parseSynthesisOutput(raw: string): SynthesisOutput {
  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonObject(raw))
  } catch (error) {
    throw new LLMError("LLM応答のJSONパースに失敗", error)
  }

  if (!parsed || typeof parsed !== "object") {
    throw new LLMError("LLM応答がオブジェクトではありません")
  }

  const obj = parsed as Record<string, unknown>
  const title = asString(obj.title)
  const summary = asString(obj.summary)
  const implications = asStringArray(obj.implications)
  const industryTags = asStringArray(obj.industryTags ?? [])
  const category = asString(obj.category)
  const citedSources = asStringArray(obj.citedSources ?? [])

  if (!title || !summary || implications.length === 0 || !category) {
    throw new LLMError("LLM応答に必須フィールドが欠落しています")
  }

  return { title, summary, implications, industryTags, category, citedSources }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string").map((s) => s.trim()).filter(Boolean)
}
