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

    // Create a custom readable stream with detailed logging
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log("Starting custom stream...")

          let chunkCount = 0
          for await (const textPart of result.textStream) {
            chunkCount++
            console.log(`Chunk ${chunkCount}:`, JSON.stringify(textPart))

            // Send as Server-Sent Events format
            const sseData = `data: ${JSON.stringify({
              type: "text",
              content: textPart,
              chunkIndex: chunkCount,
            })}\n\n`

            controller.enqueue(new TextEncoder().encode(sseData))
          }

          // Send completion event
          const completeData = `data: ${JSON.stringify({ type: "complete" })}\n\n`
          controller.enqueue(new TextEncoder().encode(completeData))

          console.log(`Stream completed with ${chunkCount} chunks`)
          controller.close()
        } catch (error) {
          console.error("Custom streaming error:", error)
          const errorData = `data: ${JSON.stringify({
            type: "error",
            message: error.message,
          })}\n\n`
          controller.enqueue(new TextEncoder().encode(errorData))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Debug streaming setup error:", error)
    return new Response(`Failed to setup stream: ${error.message}`, { status: 500 })
  }
}
