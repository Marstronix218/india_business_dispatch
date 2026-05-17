import { AnthropicClient } from "./anthropic-client"
import { OpenAIClient } from "./openai-client"
import type { LLMClient } from "./types"

export type {
  LLMClient,
  QualityCheckInput,
  QualityCheckOutput,
  QualityVerdict,
  ReviseSynthesisInput,
  SynthesisInput,
  SynthesisOutput,
  SynthesisSource,
} from "./types"
export { LLMError } from "./types"

export function getLLMClient(): LLMClient {
  const provider = (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase()
  if (provider === "openai") return new OpenAIClient()
  return new AnthropicClient()
}
