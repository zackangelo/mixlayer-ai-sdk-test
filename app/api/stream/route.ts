import { streamText } from "ai"
import { mixlayer } from "@/lib/mixlayer-provider"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json()

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 })
    }

    const result = streamText({
      model: mixlayer(model || "meta/llama3.3-70b-instruct"),
      prompt,
      maxTokens: 1000,
    })

    // Since Mixlayer is OpenAI-compatible, this should work perfectly
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Streaming error:", error)
    return new Response(`Failed to stream text: ${error.message}`, { status: 500 })
  }
}
