import { NextResponse } from "next/server";
import { enrichTitleWithRawg } from "@/src/lib/rawg";

export const runtime = "nodejs";

function isRawgEnabled() {
  const mode = (process.env.RAWG_ENRICHMENT ?? "auto").toLowerCase();
  if (mode === "off") return false;
  if (mode === "on") return true;
  return Boolean(process.env.RAWG_API_KEY);
}

type FeaturedItem = {
  title: string;
  title_en?: string;
  cover_url?: string;
  metacritic?: number | null;
  rating?: number | null;
  platforms?: string[];
  genres?: string[];
  rawg_url?: string;
};

let cached: { expiresAt: number; data: FeaturedItem[] } | null = null;

export async function GET() {
  const apiKey = process.env.RAWG_API_KEY;
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return NextResponse.json({ featured: cached.data });
  }

  const rawgMode = (process.env.RAWG_ENRICHMENT ?? "auto").toLowerCase();
  if (!isRawgEnabled() || !apiKey) {
    const fallback: FeaturedItem[] = [
      { title: "赛博朋克 2077", title_en: "Cyberpunk 2077" },
      { title: "艾尔登法环", title_en: "Elden Ring" },
      { title: "博德之门 3", title_en: "Baldur's Gate 3" },
      { title: "塞尔达传说：王国之泪", title_en: "The Legend of Zelda: Tears of the Kingdom" },
    ];
    if (rawgMode === "on" && !apiKey) {
      console.warn(JSON.stringify({ event: "rawg_disabled_missing_key", route: "/api/featured" }));
    }
    return NextResponse.json({ featured: fallback });
  }

  const featuredList = [
    { title_en: "Cyberpunk 2077", title_zh: "赛博朋克 2077" },
    { title_en: "Elden Ring", title_zh: "艾尔登法环" },
    { title_en: "Baldur's Gate 3", title_zh: "博德之门 3" },
    { title_en: "The Legend of Zelda: Tears of the Kingdom", title_zh: "塞尔达传说：王国之泪" },
  ];

  const results = await Promise.all(
    featuredList.map(async ({ title_en, title_zh }) => {
      const e = await enrichTitleWithRawg(title_en, apiKey, { pageSize: 5, timeoutMs: 4500 }).catch(() => null);
      if (!e) return { title: title_zh, title_en } as FeaturedItem;
      return {
        title: title_zh,
        title_en,
        cover_url: e.cover_url,
        metacritic: e.metacritic ?? null,
        rating: e.rating ?? null,
        platforms: e.platforms ?? [],
        genres: e.genres ?? [],
        rawg_url: e.rawg_url,
      } satisfies FeaturedItem;
    }),
  );

  const enrichedCount = results.filter((x) => typeof x.cover_url === "string" && x.cover_url.length > 0).length;
  console.info(
    JSON.stringify({
      event: "rawg_featured",
      route: "/api/featured",
      total: results.length,
      enriched: enrichedCount,
    }),
  );

  cached = { data: results, expiresAt: now + 24 * 60 * 60 * 1000 };
  return NextResponse.json({ featured: results });
}
