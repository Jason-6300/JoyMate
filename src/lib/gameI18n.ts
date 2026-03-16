const map: Record<string, string> = {
  Action: "动作",
  Adventure: "冒险",
  RPG: "角色扮演",
  "Role-Playing": "角色扮演",
  "Action RPG": "动作RPG",
  "Action-Adventure": "动作冒险",
  Strategy: "策略",
  Simulation: "模拟",
  Indie: "独立",
  Casual: "休闲",
  Puzzle: "解谜",
  Shooter: "射击",
  "First-Person Shooter": "第一人称射击",
  "Third-Person Shooter": "第三人称射击",
  Platformer: "平台跳跃",
  Fighting: "格斗",
  Racing: "竞速",
  Sports: "体育",
  Horror: "恐怖",
  Survival: "生存",
  "Survival Horror": "生存恐怖",
  "Open World": "开放世界",
  "Story Rich": "剧情向",
  "Singleplayer": "单人",
  Multiplayer: "多人",
  "Co-op": "合作",
  "Online Co-Op": "联机合作",
  "Local Co-Op": "本地合作",
  "Turn-Based": "回合制",
  "Turn-Based Strategy": "回合策略",
  Roguelike: "肉鸽",
  Roguelite: "类肉鸽",
  "Card Game": "卡牌",
  "Deckbuilding": "构筑",
  "Visual Novel": "视觉小说",
  "Stealth": "潜行",
  "Point & Click": "点击解谜",
  "Hack and Slash": "砍杀",
  Sandbox: "沙盒",
  "City Builder": "城市建造",
  "Base Building": "基地建造",
  "Farming Sim": "种田",
  "Life Sim": "生活模拟",
  "Narrative": "叙事",
  Atmospheric: "氛围",
  "Great Soundtrack": "音乐优秀",
  "Beautiful": "画面精美",
  Difficult: "高难度",
  "Full controller support": "完整手柄支持",
  "Partial Controller Support": "部分手柄支持",
  "Full Controller Support": "完整手柄支持",
  "Controller Support": "手柄支持",
  "Controller": "手柄友好",
  "Early Access": "抢先体验",
  PC: "PC",
  "PlayStation 5": "PS5",
  "PlayStation 4": "PS4",
  PlayStation: "PlayStation",
  "Xbox One": "Xbox One",
  "Xbox Series S/X": "Xbox Series",
  Xbox: "Xbox",
  "Nintendo Switch": "Switch",
  "macOS": "macOS",
  Linux: "Linux",
  iOS: "iOS",
  Android: "Android",
};

export function toZhLabel(label?: string) {
  if (!label) return "";
  const key = label.trim();
  if (!key) return "";
  return map[key] ?? key;
}

export function toZhLabels(labels?: string[], limit?: number) {
  const arr = Array.isArray(labels) ? labels : [];
  const out = arr.map((x) => toZhLabel(x)).filter((x) => x.length > 0);
  return typeof limit === "number" ? out.slice(0, limit) : out;
}

export function isMostlyCjkText(s?: string) {
  const t = (s ?? "").trim();
  if (!t) return false;
  const cjk = t.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  return cjk / t.length >= 0.2;
}
