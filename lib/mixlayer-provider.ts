import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

// Define the available model IDs for type safety and auto-completion
export type MixlayerModelIds =
  | "meta/llama3.1-8b-instruct"
  | "meta/llama3.3-70b-instruct"
  | "qwen/qwen3-8b"
  | (string & {})

// Create the Mixlayer AI provider
export const mixlayer = createOpenAICompatible<MixlayerModelIds>({
  name: "mixlayer",
  apiKey: process.env.MIXLAYER_API_KEY || "",
  baseURL: "https://models.mixlayer.ai/v1",
  headers: {
    "User-Agent": "ai-sdk-mixlayer-provider",
  },
})

// Export individual model instances for convenience
export const mixlayerModels = {
  llama31_8b: mixlayer("meta/llama3.1-8b-instruct"),
  llama33_70b: mixlayer("meta/llama3.3-70b-instruct"),
  qwen3_8b: mixlayer("qwen/qwen3-8b"),
} as const
