import { OpenAIImageClient } from "./openai-client"
import { RunwareClient } from "./runware-client"
import type { ImageClient } from "./types"

export type {
  ImageClient,
  ImageGenerationInput,
  ImageGenerationOutput,
} from "./types"
export { ImageGenerationError } from "./types"

export function getImageClient(): ImageClient | null {
  const provider = (process.env.IMAGE_PROVIDER ?? "openai").toLowerCase()
  if (provider === "none") return null
  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) return null
    return new OpenAIImageClient()
  }
  if (provider === "runware") {
    if (!process.env.RUNWARE_API_KEY) return null
    return new RunwareClient()
  }
  return null
}
