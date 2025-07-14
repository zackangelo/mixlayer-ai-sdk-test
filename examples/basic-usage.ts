import { generateText, streamText, generateObject } from "ai"
import { mixlayer, mixlayerModels } from "@/lib/mixlayer-provider"
import { z } from "zod"

// Example 1: Basic text generation
export async function basicTextGeneration() {
  const { text } = await generateText({
    model: mixlayer("meta/llama3.3-70b-instruct"),
    prompt: "Explain the concept of machine learning in simple terms.",
  })

  console.log("Generated text:", text)
  return text
}

// Example 2: Using pre-configured model instances
export async function usingModelInstances() {
  const { text } = await generateText({
    model: mixlayerModels.llama33_70b,
    prompt: "Write a short story about a robot learning to paint.",
    maxTokens: 500,
  })

  console.log("Story:", text)
  return text
}

// Example 3: Streaming text generation
export async function streamingExample() {
  const { textStream } = streamText({
    model: mixlayer("meta/llama3.1-8b-instruct"),
    prompt: "Describe the process of photosynthesis step by step.",
  })

  // Process the stream
  for await (const textPart of textStream) {
    process.stdout.write(textPart)
  }
}

// Example 4: Structured data generation
export async function structuredDataExample() {
  const { object } = await generateObject({
    model: mixlayer("qwen/qwen3-8b"),
    schema: z.object({
      recipe: z.object({
        name: z.string(),
        ingredients: z.array(
          z.object({
            name: z.string(),
            amount: z.string(),
            unit: z.string(),
          }),
        ),
        instructions: z.array(z.string()),
        cookingTime: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
      }),
    }),
    prompt: "Generate a recipe for chocolate chip cookies.",
  })

  console.log("Generated recipe:", JSON.stringify(object, null, 2))
  return object
}

// Example 5: Chat conversation
export async function chatExample() {
  const { text } = await generateText({
    model: mixlayer("meta/llama3.3-70b-instruct"),
    messages: [
      {
        role: "system",
        content: "You are a helpful coding assistant. Provide clear and concise answers.",
      },
      {
        role: "user",
        content: "How do I create a REST API with Node.js and Express?",
      },
    ],
  })

  console.log("Assistant response:", text)
  return text
}
