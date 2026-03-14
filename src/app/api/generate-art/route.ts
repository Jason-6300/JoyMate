import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { prompt?: string; size?: "1K" | "2K" | "4K" };
  if (!body.prompt || typeof body.prompt !== "string") {
    return new NextResponse("Missing prompt", { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new NextResponse("Missing GEMINI_API_KEY", { status: 500 });
  }

  const imageAi = new GoogleGenAI({ apiKey });

  try {
    const response = await imageAi.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: body.prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: body.size ?? "1K",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        return NextResponse.json({ imageUrl });
      }
    }

    return new NextResponse("No image generated", { status: 502 });
  } catch (err: any) {
    const status = err?.status ?? err?.statusCode;
    if (status === 429 || err?.message?.includes("quota") || err?.message?.includes("RESOURCE_EXHAUSTED")) {
      // 与推荐接口保持一致：配额不足时用友好提示
      return NextResponse.json(
        {
          imageUrl: "",
          error:
            "当前图片生成配额已用完，暂时无法生成新的概念图。\n\n" +
            "你可以先用文字记录下你的想法，等配额恢复后再一键生成画面效果。",
        },
        { status: 200 },
      );
    }

    console.error("Unexpected error from Gemini (image):", err);
    return new NextResponse("Upstream Gemini image error", { status: 502 });
  }
}

