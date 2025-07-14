"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

const MODELS = [
  { id: "meta/llama3.1-8b-instruct", name: "Llama 3.1 8B", description: "Fast and efficient" },
  { id: "meta/llama3.3-70b-instruct", name: "Llama 3.3 70B", description: "Most capable" },
  { id: "qwen/qwen3-8b", name: "Qwen 3 8B", description: "Balanced performance" },
]

export default function MixlayerDemo() {
  const [prompt, setPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState("meta/llama3.3-70b-instruct")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setResponse("")

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: selectedModel }),
      })

      const data = await res.json()
      setResponse(data.text)
    } catch (error) {
      setResponse("Error: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStream = async () => {
    if (!prompt.trim()) return

    setIsStreaming(true)
    setResponse("")

    try {
      // Use the debug endpoint for better error tracking
      const res = await fetch("/api/stream-debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: selectedModel }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body reader available")
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        console.log("Raw chunk:", chunk)

        // Parse Server-Sent Events format
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              console.log("Parsed data:", data)

              if (data.type === "text") {
                setResponse((prev) => prev + data.content)
              } else if (data.type === "error") {
                throw new Error(data.message)
              } else if (data.type === "complete") {
                console.log("Stream completed")
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE data:", line, parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error)
      setResponse(`Error: ${error.message}`)
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mixlayer AI Provider Demo</h1>
        <p className="text-muted-foreground">Test the Mixlayer AI provider with different models using the AI SDK</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Enter your prompt and select a model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Prompt</label>
              <Textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={isLoading || isStreaming || !prompt.trim()} className="flex-1">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate
              </Button>
              <Button
                onClick={handleStream}
                disabled={isLoading || isStreaming || !prompt.trim()}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                {isStreaming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Stream
              </Button>
              <Button
                onClick={async () => {
                  const res = await fetch("/api/test-raw", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: "Hello", model: selectedModel }),
                  })
                  const text = await res.text()
                  console.log("Raw API response:", text)
                  setResponse(text)
                }}
                variant="outline"
                size="sm"
              >
                Test Raw API
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Response
              {(isLoading || isStreaming) && (
                <Badge variant="secondary">{isLoading ? "Generating..." : "Streaming..."}</Badge>
              )}
            </CardTitle>
            <CardDescription>AI-generated response will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] p-4 bg-muted rounded-md">
              {response ? (
                <pre className="whitespace-pre-wrap text-sm">{response}</pre>
              ) : (
                <p className="text-muted-foreground italic">Response will appear here...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Available Models</CardTitle>
          <CardDescription>Models available through the Mixlayer AI provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {MODELS.map((model) => (
              <div key={model.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{model.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                <Badge variant="outline" className="text-xs">
                  {model.id}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
