import OpenAI from "openai"
import { buildSynthesisPrompt } from "./prompt"
import { parseSynthesisOutput } from "./parse"
import { LLMError, type LLMClient, type SynthesisInput, type SynthesisOutput } from "./types"
import { isRetryableLLMError, sleep } from "./retry"

export class OpenAIClient implements LLMClient {
  private readonly client: OpenAI
  private readonly model: string
  private readonly maxTokens: number
  private readonly timeoutMs: number
  private readonly maxRetries: number

  constructor(opts?: { apiKey?: string; model?: string; maxTokens?: number; timeoutMs?: number; maxRetries?: number }) {
    const apiKey = opts?.apiKey ?? process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new LLMError("OPENAI_API_KEY が設定されていません")
    }
    this.client = new OpenAI({ apiKey, maxRetries: 0 })
    this.model = opts?.model ?? process.env.LLM_MODEL_OPENAI ?? "gpt-4o-mini"
    this.maxTokens = opts?.maxTokens ?? Number(process.env.LLM_MAX_TOKENS ?? 2000)
    this.timeoutMs = opts?.timeoutMs ?? Number(process.env.LLM_TIMEOUT_MS ?? 45000)
    this.maxRetries = opts?.maxRetries ?? Number(process.env.LLM_MAX_RETRIES ?? 3)
  }

  async synthesize(input: SynthesisInput): Promise<SynthesisOutput> {
    const { system, user } = buildSynthesisPrompt(input)

    let lastError: unknown
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create(
          {
            model: this.model,
            max_tokens: this.maxTokens,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
          },
          { timeout: this.timeoutMs },
        )

        const content = response.choices[0]?.message?.content
        if (!content) {
          throw new LLMError("OpenAI応答が空です")
        }

        return parseSynthesisOutput(content, input)
      } catch (error) {
        lastError = error
        const isParseError =
          error instanceof LLMError &&
          (error.message.includes("JSONパースに失敗") ||
            error.message.includes("JSONオブジェクトが見つかりません") ||
            error.message.includes("必須フィールドが欠落"))
        const retryable = isParseError || isRetryableLLMError(error)
        if (attempt < this.maxRetries && retryable) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000) + Math.floor(Math.random() * 500)
          console.warn(
            `[openai] retryable error on attempt ${attempt + 1}/${this.maxRetries + 1}, retrying in ${delayMs}ms: ${error instanceof Error ? error.message : String(error)}`,
          )
          await sleep(delayMs)
          continue
        }
        if (error instanceof LLMError) throw error
        throw new LLMError(
          `OpenAI呼び出しに失敗: ${error instanceof Error ? error.message : String(error)}`,
          error,
        )
      }
    }
    throw new LLMError(
      `OpenAI呼び出しに失敗 (リトライ上限到達): ${lastError instanceof Error ? lastError.message : String(lastError)}`,
      lastError,
    )
  }
}
