import {
  ImageGenerationError,
  type ImageClient,
  type ImageGenerationInput,
  type ImageGenerationOutput,
} from "./types"

const RUNWARE_ENDPOINT = "https://api.runware.ai/v1"

const DEFAULT_NEGATIVE_PROMPT =
  "text, watermark, logo, brand name, trademark, company signage, product branding, readable signage, identifiable company, identifiable building, public figure, politician, celebrity, executive, signature, blurry, low quality, deformed, recognizable real person face"

interface RunwareImageResult {
  taskUUID?: string
  imageUUID?: string
  imageURL?: string
  cost?: number
}

interface RunwareResponse {
  data?: RunwareImageResult[]
  errors?: Array<{ code?: string; message?: string }>
}

export class RunwareClient implements ImageClient {
  private readonly apiKey: string
  private readonly model: string
  private readonly timeoutMs: number
  private readonly defaultWidth: number
  private readonly defaultHeight: number

  constructor(opts?: {
    apiKey?: string
    model?: string
    timeoutMs?: number
    width?: number
    height?: number
  }) {
    const apiKey = opts?.apiKey ?? process.env.RUNWARE_API_KEY
    if (!apiKey) {
      throw new ImageGenerationError("RUNWARE_API_KEY が設定されていません")
    }
    this.apiKey = apiKey
    this.model = opts?.model ?? process.env.RUNWARE_MODEL ?? "runware:z-image@turbo"
    this.timeoutMs = opts?.timeoutMs ?? Number(process.env.IMAGE_TIMEOUT_MS ?? 60000)
    this.defaultWidth = opts?.width ?? Number(process.env.IMAGE_WIDTH ?? 1280)
    this.defaultHeight = opts?.height ?? Number(process.env.IMAGE_HEIGHT ?? 720)
  }

  async generate(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    const taskUUID = crypto.randomUUID()
    const body = [
      {
        taskType: "imageInference",
        taskUUID,
        model: this.model,
        positivePrompt: input.prompt,
        negativePrompt: input.negativePrompt ?? DEFAULT_NEGATIVE_PROMPT,
        width: input.width ?? this.defaultWidth,
        height: input.height ?? this.defaultHeight,
        numberResults: 1,
        outputType: "URL",
        outputFormat: "JPG",
        includeCost: true,
      },
    ]

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const res = await fetch(RUNWARE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new ImageGenerationError(
          `Runware HTTPエラー (${res.status}): ${text.slice(0, 300)}`,
        )
      }

      const json = (await res.json()) as RunwareResponse

      if (json.errors && json.errors.length > 0) {
        const first = json.errors[0]
        throw new ImageGenerationError(
          `Runwareエラー: ${first.message ?? first.code ?? "unknown"}`,
        )
      }

      const result = json.data?.find((d) => d.taskUUID === taskUUID) ?? json.data?.[0]
      if (!result?.imageURL) {
        throw new ImageGenerationError("Runware応答にimageURLが含まれていません")
      }

      return {
        imageUrl: result.imageURL,
        model: this.model,
        costUsd: result.cost,
      }
    } catch (error) {
      if (error instanceof ImageGenerationError) throw error
      if (error instanceof Error && error.name === "AbortError") {
        throw new ImageGenerationError(
          `Runwareタイムアウト (${this.timeoutMs}ms)`,
          error,
        )
      }
      throw new ImageGenerationError(
        `Runware呼び出しに失敗: ${error instanceof Error ? error.message : String(error)}`,
        error,
      )
    } finally {
      clearTimeout(timer)
    }
  }
}
