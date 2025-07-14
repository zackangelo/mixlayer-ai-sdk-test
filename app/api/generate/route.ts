import { generateText } from "ai";
import { mixlayer } from "@mixlayer/ai-sdk-provider";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const { text, usage } = await generateText({
      model: mixlayer(model || "meta/llama3.3-70b-instruct"),
      prompt,
      maxTokens: 1000,
    });

    return NextResponse.json({
      text,
      usage,
      model: model || "meta/llama3.3-70b-instruct",
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate text" },
      { status: 500 }
    );
  }
}
