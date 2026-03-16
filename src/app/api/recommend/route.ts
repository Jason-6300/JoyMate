import OpenAI from "openai";
import { NextResponse } from "next/server";
import { enrichRecommendedGamesWithRawg } from "@/src/lib/rawg";

export const runtime = "nodejs";

function isRawgEnabled() {
  const mode = (process.env.RAWG_ENRICHMENT ?? "auto").toLowerCase();
  if (mode === "off") return false;
  if (mode === "on") return true;
  return Boolean(process.env.RAWG_API_KEY);
}

export async function POST(req: Request) {
  const { prompt } = (await req.json().catch(() => ({}))) as { prompt?: string };
  if (!prompt || typeof prompt !== "string") {
    return new NextResponse("Missing prompt", { status: 400 });
  }

  const apiKey = process.env.QWEN_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new NextResponse("Missing QWEN_API_KEY", { status: 500 });
  }

  const baseURL =
    process.env.QWEN_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1";

  const client = new OpenAI({
    apiKey,
    baseURL,
  });

  const startTime = Date.now();
  try {
    const completion = await client.chat.completions.create({
      model: "qwen3.5-plus",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are the "JoyMate Game Shopper," a sophisticated game recommendation concierge. You help players find games based on emotions, taste, and value.

Your internal reasoning process follows these steps for every user inquiry:
Step 1: Intent Recognition - Extract game names, emotions, scenarios, and preferences.
Step 2: Multi-Agent Simulation - Simulate a discussion between three distinct personas:
1. The Hardcore Strategist: Focuses on gameplay mechanics, difficulty, depth, and replayability.
2. The Aesthetic Critic: Focuses on art style, music, narrative atmosphere, and emotional resonance.
3. The Budget Expert: Focuses on value, "bang for your buck," and smart buying advice (do not output real-time prices).
Step 3: Synthesis - The JoyMate Host summarizes the findings into a friendly, friend-like recommendation.

Output your response ONLY in JSON format with this shape:
{
  "intent": {
    "game_name": string | null,
    "emotion": string | null,
    "scenario": string | null,
    "preferences": string[]
  },
  "aesthetic_critic": "A professional yet poetic critique of the visual and emotional aspects.",
  "hardcore_strategist": "A deep-dive analysis of the systems and challenge level.",
  "budget_expert": "A smart take on the current value and price strategy.",
  "host_message": "A warm, friend-like summary that weaves all opinions together.",
  "recommended_games": Array<{
    "title": string,
    "reason": string,
    "match_percentage": number,
    "image_keyword": string
  }>
}`,
        },
        { role: "user", content: prompt },
      ],
    });

    const endTime = Date.now();
    const thinkingTimeSeconds = ((endTime - startTime) / 1000).toFixed(1);

    const message = completion.choices[0]?.message;
    const content = Array.isArray(message?.content)
      ? message?.content.map((p: any) => (typeof p === "string" ? p : p.text ?? "")).join("")
      : (message?.content as string | null | undefined);

    if (!content) {
      return new NextResponse("No response text", { status: 502 });
    }

    const jsonResponse = JSON.parse(content) as any;
    const rawgKey = process.env.RAWG_API_KEY;
    const rawgMode = (process.env.RAWG_ENRICHMENT ?? "auto").toLowerCase();

    let rawgStats: { enabled: boolean; mode: string; total: number; enriched: number; ms: number } | null = null;
    if (Array.isArray(jsonResponse?.recommended_games)) {
      const total = jsonResponse.recommended_games.length;
      const enabled = isRawgEnabled();
      if (enabled && rawgKey) {
        const t0 = Date.now();
        const enriched = await enrichRecommendedGamesWithRawg(jsonResponse.recommended_games, rawgKey, {
          maxGames: 6,
          concurrency: 2,
          pageSize: 5,
          timeoutMs: 4500,
        });
        const ms = Date.now() - t0;
        const enrichedCount = enriched.filter((g: any) => typeof g?.rawg_id === "number").length;
        jsonResponse.recommended_games = enriched;
        rawgStats = { enabled: true, mode: rawgMode, total, enriched: enrichedCount, ms };
        console.info(
          JSON.stringify({
            event: "rawg_enrich",
            route: "/api/recommend",
            total,
            enriched: enrichedCount,
            ms,
          }),
        );
      } else {
        rawgStats = { enabled: false, mode: rawgMode, total, enriched: 0, ms: 0 };
        if (rawgMode === "on" && !rawgKey) {
          console.warn(
            JSON.stringify({
              event: "rawg_disabled_missing_key",
              route: "/api/recommend",
            }),
          );
        }
      }
    }
    return NextResponse.json({
      ...jsonResponse,
      thinking_time: thinkingTimeSeconds,
      rawg: rawgStats,
    });
  } catch (err: any) {
    // 针对配额不足等情况，返回友好的文案，避免前端直接报错
    const status = err?.status ?? err?.statusCode ?? err?.response?.status;
    const msg = String(err?.message ?? "");
    if (status === 429 || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json({
        aesthetic_critic: "",
        hardcore_strategist: "",
        budget_expert: "",
        host_message:
          "今天的 AI 配额已经用完了，我这边暂时不能实时分析你的需求。\n\n" +
          "你可以先告诉我：\n\n" +
          "- 最近最喜欢的一两款游戏\n" +
          "- 你现在的心情（想放松、想受虐、想看剧情等等）\n\n" +
          "等配额恢复后，我会用完整的多视角分析为你做更精细的推荐。",
        recommended_games: [],
      });
    }

    console.error("Unexpected error from Qwen:", err);
    return new NextResponse("Upstream Qwen error", { status: 502 });
  }
}

