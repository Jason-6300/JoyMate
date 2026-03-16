type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const searchCache = new Map<string, CacheEntry<any>>();
const detailCache = new Map<string, CacheEntry<any>>();
const missCache = new Map<string, CacheEntry<true>>();

function now() {
  return Date.now();
}

function getCache<T>(m: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = m.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now()) {
    m.delete(key);
    return null;
  }
  return entry.value;
}

function setCache<T>(m: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number) {
  m.set(key, { value, expiresAt: now() + ttlMs });
}

function normalizeTitle(input: string) {
  return input
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[：:—–\-()[\]【】{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /\b(game of the year|goty|ultimate|complete|definitive|deluxe|collector|edition|bundle|pack)\b$/g,
      "",
    )
    .replace(/(年度版|终极版|豪华版|完整版|典藏版|合集|捆绑包)\s*$/g, "")
    .trim();
}

function extractEnglishQuery(input: string) {
  const t = input.trim();
  if (!t) return "";
  const paren = t.match(/\(([^)]+)\)/);
  if (paren && paren[1]) {
    const inside = paren[1].trim();
    if (/[a-z]/i.test(inside)) return inside;
  }
  const tokens = t.match(/[A-Za-z0-9][A-Za-z0-9\s:'\-]{2,}/g);
  if (!tokens) return "";
  const joined = tokens.join(" ").replace(/\s+/g, " ").trim();
  return /[a-z]/i.test(joined) ? joined : "";
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const aLen = a.length;
  const bLen = b.length;
  const dp = new Array(bLen + 1).fill(0);
  for (let j = 0; j <= bLen; j++) dp[j] = j;

  for (let i = 1; i <= aLen; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= bLen; j++) {
      const tmp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[bLen];
}

function similarity(a: string, b: string) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
}

function extractNums(s: string) {
  const nums = s.match(/\d+/g);
  return nums ? nums.join(",") : "";
}

function extractYears(s: string) {
  const yrs = s.match(/\b(19|20)\d{2}\b/g);
  return yrs ? yrs.map(Number) : [];
}

function isDlcOrBundleName(name: string) {
  const n = name.toLowerCase();
  return (
    n.includes("dlc") ||
    n.includes("season pass") ||
    n.includes("soundtrack") ||
    n.includes("expansion") ||
    n.includes("bundle") ||
    n.includes("pack") ||
    n.includes("add-on") ||
    n.includes("addon") ||
    n.includes("artbook") ||
    n.includes("bonus") ||
    n.includes("skins") ||
    n.includes("cosmetic") ||
    n.includes("mooncrash")
  );
}

function scoreCandidate(query: string, candName: string) {
  const q = normalizeTitle(query);
  const c = normalizeTitle(candName);
  if (!q || !c) return { score: 0, reason: "no_match" as const };

  const qYears = extractYears(q);
  const qNoYear = qYears.length > 0 ? q.replace(/\b(19|20)\d{2}\b/g, "").replace(/\s+/g, " ").trim() : q;

  if (q === c || qNoYear === c) return { score: 95, reason: "exact_name" as const };

  const sim = similarity(qNoYear, c);
  const qNums = extractNums(q);
  const cNums = extractNums(c);
  const hasNumConflict = qNums && cNums && qNums !== cNums;
  const cYears = extractYears(c);
  const hasYearConflict = qYears.length > 0 && cYears.length > 0 && qYears.some((y) => !cYears.includes(y));

  let score = 0;
  let reason: string = "no_match";

  if (c.includes(qNoYear) || qNoYear.includes(c)) {
    score += 40;
    reason = "contains";
  }

  if (sim >= 0.92) {
    score += 45;
    reason = "fuzzy_high";
  } else if (sim >= 0.85) {
    score += 30;
    reason = "fuzzy_medium";
  } else if (sim >= 0.78) {
    score += 15;
    reason = "fuzzy_low";
  }

  if (!hasNumConflict && qNums && cNums && qNums === cNums) score += 10;
  if (hasNumConflict) score -= 25;
  if (hasYearConflict) score -= 30;

  score = Math.max(0, Math.min(100, score));
  return { score, reason: reason as any };
}

async function rawgJson(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`RAWG ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function searchRawg(query: string, apiKey: string, pageSize: number, timeoutMs: number) {
  const q = normalizeTitle(query);
  if (!q) return null;
  if (getCache(missCache, `miss:${q}`)) return null;

  const cacheKey = `search:${q}`;
  const cached = getCache<any>(searchCache, cacheKey);
  if (cached) return cached;

  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("search", q);
  url.searchParams.set("page_size", String(pageSize));

  const data = await rawgJson(url.toString(), timeoutMs).catch(() => null);
  const results = Array.isArray(data?.results) ? data.results : [];
  if (!results.length) {
    setCache(missCache, `miss:${q}`, true, 24 * 60 * 60 * 1000);
    return null;
  }

  setCache(searchCache, cacheKey, results, 7 * 24 * 60 * 60 * 1000);
  return results;
}

async function getRawgDetail(rawgId: number, apiKey: string, timeoutMs: number) {
  const cacheKey = `detail:${rawgId}`;
  const cached = getCache<any>(detailCache, cacheKey);
  if (cached) return cached;

  const url = new URL(`https://api.rawg.io/api/games/${rawgId}`);
  url.searchParams.set("key", apiKey);

  const data = await rawgJson(url.toString(), timeoutMs).catch(() => null);
  if (!data) return null;

  setCache(detailCache, cacheKey, data, 3 * 24 * 60 * 60 * 1000);
  return data;
}

function pickTopNames(arr: any[], limit: number) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x) => x?.name)
    .filter((x) => typeof x === "string" && x.trim().length > 0)
    .slice(0, limit);
}

function mapPlatforms(platforms: any[]) {
  if (!Array.isArray(platforms)) return [];
  const names = platforms
    .map((p) => p?.platform?.name)
    .filter((n) => typeof n === "string" && n.trim().length > 0);
  return Array.from(new Set(names)).slice(0, 6);
}

function truncateText(s: string, maxLen: number) {
  const t = s.trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen).trimEnd() + "…";
}

export type RawgEnrichment = {
  rawg_id: number;
  rawg_slug?: string;
  rawg_url?: string;
  title: string;
  cover_url?: string;
  rating?: number | null;
  ratings_count?: number | null;
  metacritic?: number | null;
  released?: string | null;
  platforms?: string[];
  genres?: string[];
  tags?: string[];
  description_short?: string | null;
  match_confidence: number;
  match_reason: string;
};

export async function enrichTitleWithRawg(
  title: string,
  apiKey: string,
  opts?: { pageSize?: number; timeoutMs?: number },
): Promise<RawgEnrichment | null> {
  const pageSize = opts?.pageSize ?? 5;
  const timeoutMs = opts?.timeoutMs ?? 4500;

  const results = await searchRawg(title, apiKey, pageSize, timeoutMs);
  if (!results?.length) return null;

  const filtered = results.filter((r: any) => !isDlcOrBundleName(String(r?.name ?? "")));
  if (!filtered.length) return null;

  let best: any = null;
  let bestScore = -1;
  let bestReason = "no_match";
  let bestCount = 0;
  let second: any = null;
  let secondScore = -1;
  let secondCount = 0;
  const qYears = extractYears(normalizeTitle(title));

  for (const r of filtered) {
    const { score, reason } = scoreCandidate(title, String(r?.name ?? ""));
    const count = typeof r?.ratings_count === "number" ? r.ratings_count : 0;
    let adjusted = score;
    if (qYears.length > 0 && typeof r?.released === "string" && r.released.length >= 4) {
      const year = Number(r.released.slice(0, 4));
      if (Number.isFinite(year)) {
        if (qYears.includes(year)) adjusted += 20;
        else adjusted -= 10;
      }
    }
    adjusted = Math.max(0, Math.min(100, adjusted));
    if (adjusted > bestScore) {
      second = best;
      secondScore = bestScore;
      secondCount = bestCount;
      bestScore = adjusted;
      best = r;
      bestCount = count;
      bestReason = reason;
    } else if (adjusted > secondScore) {
      second = r;
      secondScore = adjusted;
      secondCount = count;
    }
  }

  if (!best || bestScore < 70) return null;
  const bestNorm = normalizeTitle(String(best?.name ?? ""));
  const secondNorm = second ? normalizeTitle(String(second?.name ?? "")) : "";
  const veryClose = bestScore >= 90 && secondScore >= 90 && bestScore - secondScore < 3;
  const sameNorm = bestNorm && secondNorm && bestNorm === secondNorm;
  if ((bestScore < 75 && bestScore - secondScore < 5) || (veryClose && sameNorm && bestCount <= secondCount * 1.2)) {
    return null;
  }

  const rawgId = Number(best?.id);
  if (!Number.isFinite(rawgId)) return null;

  const detail = (await getRawgDetail(rawgId, apiKey, timeoutMs)) ?? best;

  const titleCanonical = String(detail?.name ?? best?.name ?? title).trim();
  const slug = typeof detail?.slug === "string" ? detail.slug : undefined;
  const rawgUrl = slug ? `https://rawg.io/games/${slug}` : undefined;

  const desc =
    typeof detail?.description_raw === "string" && detail.description_raw.trim().length
      ? truncateText(detail.description_raw, 220)
      : null;

  return {
    rawg_id: rawgId,
    rawg_slug: slug,
    rawg_url: rawgUrl,
    title: titleCanonical,
    cover_url: typeof detail?.background_image === "string" ? detail.background_image : undefined,
    rating: typeof detail?.rating === "number" ? detail.rating : null,
    ratings_count: typeof detail?.ratings_count === "number" ? detail.ratings_count : null,
    metacritic: typeof detail?.metacritic === "number" ? detail.metacritic : null,
    released: typeof detail?.released === "string" ? detail.released : null,
    platforms: mapPlatforms(detail?.platforms),
    genres: pickTopNames(detail?.genres, 6),
    tags: pickTopNames(detail?.tags, 8),
    description_short: desc,
    match_confidence: bestScore,
    match_reason: String(bestReason),
  };
}

function isMostlyCjk(s: string) {
  const t = s.trim();
  if (!t) return false;
  const cjk = t.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  return cjk / t.length >= 0.3;
}

export async function enrichRecommendedGamesWithRawg<T extends { title: string }>(
  games: T[],
  apiKey: string,
  opts?: { maxGames?: number; concurrency?: number; pageSize?: number; timeoutMs?: number },
): Promise<(T & { title_ai?: string } & Partial<RawgEnrichment>)[]> {
  const maxGames = opts?.maxGames ?? 6;
  const concurrency = Math.max(1, Math.min(3, opts?.concurrency ?? 2));
  const slice = games.slice(0, maxGames);
  const out: (T & { title_ai?: string } & Partial<RawgEnrichment>)[] = new Array(slice.length);

  let idx = 0;
  async function worker() {
    while (idx < slice.length) {
      const cur = idx++;
      const g = slice[cur];
      const englishFromTitle = extractEnglishQuery(g.title);
      const imageKeyword = typeof (g as any).image_keyword === "string" ? (g as any).image_keyword : "";
      const queries = [englishFromTitle, imageKeyword, g.title].filter(
        (x) => typeof x === "string" && x.trim().length > 0,
      );

      let enrichment: RawgEnrichment | null = null;
      for (const q of queries) {
        enrichment =
          (await enrichTitleWithRawg(q, apiKey, {
            pageSize: opts?.pageSize,
            timeoutMs: opts?.timeoutMs,
          }).catch(() => null)) ?? null;
        if (enrichment) break;
      }

      if (!enrichment && queries.length && isMostlyCjk(queries[0])) {
        const results = await searchRawg(queries[0], apiKey, opts?.pageSize ?? 5, opts?.timeoutMs ?? 4500).catch(
          () => null,
        );
        const top =
          Array.isArray(results) && results.length
            ? (results.filter((r: any) => !isDlcOrBundleName(String(r?.name ?? "")))[0] ?? results[0])
            : null;
        const rawgId = top ? Number(top.id) : NaN;
        if (top && Number.isFinite(rawgId)) {
          const detail = (await getRawgDetail(rawgId, apiKey, opts?.timeoutMs ?? 4500).catch(() => null)) ?? top;
          const titleCanonical = String(detail?.name ?? top?.name ?? g.title).trim();
          const slug = typeof detail?.slug === "string" ? detail.slug : undefined;
          const rawgUrl = slug ? `https://rawg.io/games/${slug}` : undefined;
          enrichment = {
            rawg_id: rawgId,
            rawg_slug: slug,
            rawg_url: rawgUrl,
            title: titleCanonical,
            cover_url: typeof detail?.background_image === "string" ? detail.background_image : undefined,
            rating: typeof detail?.rating === "number" ? detail.rating : null,
            ratings_count: typeof detail?.ratings_count === "number" ? detail.ratings_count : null,
            metacritic: typeof detail?.metacritic === "number" ? detail.metacritic : null,
            released: typeof detail?.released === "string" ? detail.released : null,
            platforms: mapPlatforms(detail?.platforms),
            genres: pickTopNames(detail?.genres, 6),
            tags: pickTopNames(detail?.tags, 8),
            description_short:
              typeof detail?.description_raw === "string" && detail.description_raw.trim().length
                ? truncateText(detail.description_raw, 220)
                : null,
            match_confidence: 55,
            match_reason: "cjk_top_result",
          };
        }
      }

      if (enrichment) {
        out[cur] = {
          ...g,
          title_ai: g.title,
          ...enrichment,
        } as any;
      } else {
        out[cur] = { ...g, title_ai: g.title } as any;
      }
    }
  }

  await Promise.all(new Array(concurrency).fill(0).map(() => worker()));
  return out;
}
