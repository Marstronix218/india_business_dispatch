export interface ImageGenerationInput {
  prompt: string
  negativePrompt?: string
  width?: number
  height?: number
}

export interface ImageGenerationOutput {
  imageUrl: string
  model: string
  costUsd?: number
}

export interface ImageClient {
  generate(input: ImageGenerationInput): Promise<ImageGenerationOutput>
}

export class ImageGenerationError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = "ImageGenerationError"
  }
}
