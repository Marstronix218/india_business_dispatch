import OpenAI from "openai"
import { uploadGeneratedImage } from "@/lib/supabase/image-storage"
import {
  ImageGenerationError,
  type ImageClient,
  type ImageGenerationInput,
  type ImageGenerationOutput,
} from "./types"

type OpenAIImageQuality = "low" | "medium" | "high" | "auto"
type OpenAIImageSize = "1024x1024" | "1536x1024" | "1024x1536" | "auto"
type OpenAIImageFormat = "png" | "jpeg" | "webp"

export class OpenAIImageClient implements ImageClient {
  private readonly client: OpenAI
  private readonly model: string
  private readonly size: OpenAIImageSize
  private readonly quality: OpenAIImageQuality
  private readonly format: OpenAIImageFormat
  private readonly compression: number | null
  private readonly timeoutMs: number

  constructor(opts?: {
    apiKey?: string
    model?: string
    size?: OpenAIImageSize
    quality?: OpenAIImageQuality
    format?: OpenAIImageFormat
    compression?: number
    timeoutMs?: number
  }) {
    const apiKey = opts?.apiKey ?? process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new ImageGenerationError("OPENAI_API_KEY が設定されていません")
    }
    this.client = new OpenAI({ apiKey })
    this.model = opts?.model ?? process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1-mini"
    this.size = opts?.size ?? (process.env.OPENAI_IMAGE_SIZE as OpenAIImageSize) ?? "1024x1024"
    this.quality = opts?.quality ?? (process.env.OPENAI_IMAGE_QUALITY as OpenAIImageQuality) ?? "low"
    this.format = opts?.format ?? (process.env.OPENAI_IMAGE_FORMAT as OpenAIImageFormat) ?? "jpeg"
    const rawCompression = opts?.compression ?? Number(process.env.OPENAI_IMAGE_COMPRESSION ?? 75)
    this.compression = this.format === "png" ? null : Math.max(0, Math.min(100, rawCompression))
    this.timeoutMs = opts?.timeoutMs ?? Number(process.env.IMAGE_TIMEOUT_MS ?? 90000)
  }

  async generate(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    let response: Awaited<ReturnType<OpenAI["images"]["generate"]>>
    try {
      const params: Record<string, unknown> = {
        model: this.model,
        prompt: input.prompt,
        size: this.size,
        quality: this.quality,
        n: 1,
        output_format: this.format,
      }
      if (this.compression !== null) {
        params.output_compression = this.compression
      }
      response = await this.client.images.generate(
        params as unknown as Parameters<OpenAI["images"]["generate"]>[0],
        { timeout: this.timeoutMs },
      )
    } catch (error) {
      throw new ImageGenerationError(
        `OpenAI画像生成呼び出しに失敗: ${error instanceof Error ? error.message : String(error)}`,
        error,
      )
    }

    const b64 = response.data?.[0]?.b64_json
    if (!b64) {
      throw new ImageGenerationError("OpenAI応答にb64_jsonが含まれていません")
    }

    const buffer = Buffer.from(b64, "base64")
    const contentType =
      this.format === "png" ? "image/png" : this.format === "webp" ? "image/webp" : "image/jpeg"
    const extension = this.format === "jpeg" ? "jpg" : this.format

    try {
      const { publicUrl } = await uploadGeneratedImage(buffer, { contentType, extension })
      return { imageUrl: publicUrl, model: this.model }
    } catch (error) {
      throw new ImageGenerationError(
        error instanceof Error ? error.message : String(error),
        error,
      )
    }
  }
}
