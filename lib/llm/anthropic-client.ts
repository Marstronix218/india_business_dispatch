import Anthropic from "@anthropic-ai/sdk"
import { buildSynthesisPrompt } from "./prompt"
import { parseSynthesisOutput } from "./parse"
import { LLMError, type LLMClient, type SynthesisInput, type SynthesisOutput } from "./types"

export class AnthropicClient implements LLMClient {
  private readonly client: Anthropic
  private readonly model: string
  private readonly maxTokens: number
  private readonly timeoutMs: number

  constructor(opts?: { apiKey?: string; model?: string; maxTokens?: number; timeoutMs?: number }) {
    const apiKey = opts?.apiKey ?? process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new LLMError("ANTHROPIC_API_KEY が設定されていません")
    }
    this.client = new Anthropic({ apiKey })
    this.model = opts?.model ?? process.env.LLM_MODEL_ANTHROPIC ?? "claude-sonnet-4-6"
    this.maxTokens = opts?.maxTokens ?? Number(process.env.LLM_MAX_TOKENS ?? 2000)
    this.timeoutMs = opts?.timeoutMs ?? Number(process.env.LLM_TIMEOUT_MS ?? 45000)
  }

  async synthesize(input: SynthesisInput): Promise<SynthesisOutput> {
    const { system, user } = buildSynthesisPrompt(input)

    try {
      const response = await this.client.messages.create(
        {
          model: this.model,
          max_tokens: this.maxTokens,
          system,
          messages: [{ role: "user", content: user }],
        },
        { timeout: this.timeoutMs },
      )

      const textBlock = response.content.find((block) => block.type === "text")
      if (!textBlock || textBlock.type !== "text") {
        throw new LLMError("Claude応答にテキストブロックがありません")
      }

      return parseSynthesisOutput(textBlock.text, input)
    } catch (error) {
      if (error instanceof LLMError) throw error
      throw new LLMError(
        `Claude呼び出しに失敗: ${error instanceof Error ? error.message : String(error)}`,
        error,
      )
    }
  }
}
