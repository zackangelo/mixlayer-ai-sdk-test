import { generateText, streamText } from "ai"
import { mixlayer } from "@/lib/mixlayer-provider"

// Example with custom provider options
export async function advancedProviderOptions() {
  const { text } = await generateText({
    model: mixlayer("meta/llama3.3-70b-instruct"),
    prompt: "Explain quantum computing concepts.",
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
    // Provider-specific options
    providerOptions: {
      mixlayer: {
        // Add any Mixlayer-specific options here
        customOption: "value",
      },
    },
  })

  return text
}

// Example with error handling
export async function robustGeneration() {
  try {
    const { text } = await generateText({
      model: mixlayer("meta/llama3.1-8b-instruct"),
      prompt: "What are the benefits of renewable energy?",
      maxRetries: 3,
    })

    return { success: true, text }
  } catch (error) {
    console.error("Generation failed:", error)
    return { success: false, error: error.message }
  }
}

// Example with streaming and custom handling
export async function advancedStreaming() {
  const result = streamText({
    model: mixlayer("qwen/qwen3-8b"),
    prompt: "Write a technical blog post about TypeScript best practices.",
  })

  let fullText = ""

  // Handle the stream with custom logic
  for await (const textPart of result.textStream) {
    fullText += textPart

    // Custom processing - e.g., real-time word count
    const wordCount = fullText.split(" ").length
    if (wordCount % 50 === 0) {
      console.log(`Progress: ${wordCount} words generated...`)
    }
  }

  return fullText
}

// Example comparing different models
export async function modelComparison() {
  const prompt = "Explain the difference between AI and machine learning."

  const models = ["meta/llama3.1-8b-instruct", "meta/llama3.3-70b-instruct", "qwen/qwen3-8b"] as const

  const results = await Promise.all(
    models.map(async (modelId) => {
      const { text, usage } = await generateText({
        model: mixlayer(modelId),
        prompt,
        maxTokens: 300,
      })

      return {
        model: modelId,
        text,
        usage,
      }
    }),
  )

  return results
}
