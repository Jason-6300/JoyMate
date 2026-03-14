export async function getGameRecommendation(prompt: string) {
  const res = await fetch("/api/recommend", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to get recommendation");
  }

  return await res.json();
}

export async function generateGameArt(prompt: string, size: "1K" | "2K" | "4K") {
  const res = await fetch("/api/generate-art", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt, size }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to generate image");
  }

  const data = (await res.json()) as { imageUrl: string };
  if (!data.imageUrl) throw new Error("No image generated");
  return data.imageUrl;
}
