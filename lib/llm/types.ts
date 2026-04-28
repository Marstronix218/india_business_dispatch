export interface SynthesisSource {
  source: string
  sourceUrl: string
  publishedAt: string
  title: string
  bodyText: string
}

export interface SynthesisInput {
  cluster: SynthesisSource[]
  categoryHint?: string
  industryHints?: string[]
}

export interface IndiaRelevance {
  score: 0 | 1 | 2 | 3
  reason: string
}

export interface SynthesisOutput {
  title: string
  summary: string
  implications: string[]
  industryTags: string[]
  category: string
  citedSources: string[]
  indiaRelevance: IndiaRelevance
}

export interface LLMClient {
  synthesize(input: SynthesisInput): Promise<SynthesisOutput>
}

export class LLMError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = "LLMError"
  }
}
