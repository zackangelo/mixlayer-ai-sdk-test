import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json()

    // Make a direct request to Mixlayer to see the raw response
    const response = await fetch("https://models.mixlayer.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MIXLAYER_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "ai-sdk-debug",
      },
      body: JSON.stringify({
        model: model || "meta/llama3.3-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_tokens: 100,
      }),
    })

    console.log("Raw response status:", response.status)
    console.log("Raw response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Raw response error:", errorText)
      return new Response(`API Error: ${response.status} - ${errorText}`, { status: response.status })
    }

    // Stream the raw response back for inspection
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/plain",
        "X-Debug": "raw-mixlayer-response",
      },
    })
  } catch (error) {
    console.error("Raw test error:", error)
    return new Response(`Test failed: ${error.message}`, { status: 500 })
  }
}
