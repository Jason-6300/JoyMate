# RAWG 匹配打分规则 v0（Name → Game Entity）

本文档定义 JoyMate 在接入 RAWG 时的“游戏名对齐（entity resolution）”规则：如何把 LLM 提供的候选游戏名（可能是中文/别名/简称）稳定映射到 RAWG 的具体条目，从而避免“卡片做真但做错”的问题。

## 1. 背景与目标

### 目标
- 给定 `query_title`（来自 LLM 的候选游戏名），从 RAWG 搜索结果中选出最匹配的 `rawg_id`。
- 输出同时包含 `match_confidence`（0~100）与 `match_reason`，用于调试与后续迭代。

### 关键原则
- **误匹配成本 > 不匹配成本**：宁可降级展示（用占位图）也不要把 A 游戏贴到 B 游戏上。
- **规则可解释**：每次选择应能说明“为何选它”（便于修规则）。
- **可迭代**：允许引入别名表与用户反馈，不破坏整体框架。

## 2. 输入、候选与输出

### 输入
- `query_title`: string（LLM 输出的游戏名）
- 可选上下文（将来可用，v0 不强依赖）
  - `intent.platform`（PC/主机偏好）
  - `intent.preferences`（类型偏好）
  - 用户语言（中文/英文）

### 候选（RAWG Search）
RAWG 返回 `results[]`，v0 只取前 `N=5` 条候选，记为 `candidates[]`。

### 输出
- `best_id`, `best_slug`, `best_name`
- `match_confidence`: 0~100
- `match_reason`: enum（见第 7 节）
- 当 `match_confidence < threshold` 时视为**未匹配**，进入降级路径。

## 3. 标准化（Normalization）

对 `query_title` 和 `candidate.name` 分别做标准化，得到 `q_norm` 与 `c_norm`。

### 3.1 清洗规则（建议）
- 统一大小写：英文转小写
- 去除多余空白、全半角差异
- 去除常见版本后缀（只从末尾剥离，避免误伤）
  - `game of the year`, `goty`, `ultimate`, `complete`, `definitive`, `deluxe`, `collector`
  - `edition`, `bundle`, `pack`
  - 中文：`年度版/终极版/豪华版/完整版/典藏版/合集/捆绑包`
- 处理重制/重置关键词（保留但做权重控制）
  - `remaster`, `remastered`, `remake`, `definitive`
- 去掉标点：`：:—-()[]【】`（注意保留数字与罗马数字）
- 罗马数字与阿拉伯数字归一（可选）
  - `III`≈`3`，`II`≈`2`（v0 可先不做，作为加分项）

> v0 不做中文翻译；如果 query 是中文名，通常需要依赖 RAWG 的搜索能力或后续别名表。

## 4. 打分模型（v0：规则加权分）

对每个候选 `candidate` 计算总分 `Score`（0~100），由多个子分组成：

### 4.1 子分项与权重（建议初值）

1) **精确匹配分 `S_exact`（权重高）**
- 若 `q_norm == c_norm`：+70
- 若 `q_norm` 与 `c_norm` 只差空格/标点：+65

2) **包含/前缀分 `S_contains`**
- `c_norm` 包含 `q_norm` 或 `q_norm` 包含 `c_norm`：+35
- 若差异仅为版本后缀（如 `xxx ultimate edition`）：+40

3) **相似度分 `S_sim`**
- 计算字符相似度（例如 Jaro-Winkler / Levenshtein 归一化）
- `sim >= 0.92`：+45
- `0.85 <= sim < 0.92`：+30
- `0.78 <= sim < 0.85`：+15
- `< 0.78`：+0

4) **数字一致性分 `S_num`（避免 2/3/4 混淆）**
- `q_norm` 与 `c_norm` 的数字集合一致：+10
- 冲突（如 query 含 2 候选含 3）：-25

5) **版本关键词一致性 `S_edition`**
- query 明确包含 `remake/remaster/definitive`，候选也包含：+8
- query 不包含但候选包含（可能不同版本）：-8（轻惩罚）

6) **平台偏好加成 `S_platform`（可选）**
- 如果 intent 表示 PC 偏好，候选 platforms 含 PC：+5
- 不满足：+0（不扣分，避免误伤）

7) **热度/评分弱特征 `S_popularity`（弱权重）**
- 用于同分时 tie-break：
  - `ratings_count` 更高优先
  - `metacritic` 更高优先（若有）

### 4.2 总分计算

`Score = clamp(S_exact + S_contains + S_sim + S_num + S_edition + S_platform, 0, 100)`

并输出：
- `match_confidence = Score`
- `match_reason` 由最高贡献项决定（见第 7 节）

## 5. 阈值与决策（Match / No-Match）

### 5.1 置信度阈值（建议）
- `Score >= 70`：强匹配，直接采用
- `55 <= Score < 70`：弱匹配，需额外检查：
  - 若数字冲突则拒绝（降级）
  - 若候选为明显 DLC/Bundle（RAWG 有时可从名称识别），则拒绝
  - 若存在另一个候选分差 < 5，且都在弱匹配区间：拒绝（降级，避免误选）
- `Score < 55`：不匹配，降级

### 5.2 同分/近似同分处理（Tie-break）
当最高分与第二名分差很小（如 < 5）：
1. 数字一致性优先
2. 非版本条目优先（优先本体）
3. `ratings_count` 更高优先
4. `released` 更接近“主版本”的优先（若能判断）

## 6. 降级策略（必须）

当判定为“不匹配”时：
- 卡片仍显示 `title_ai` 与 `reason`
- 不显示真实封面与评分（或用占位图）
- `match_confidence` = 0 / null
- `match_reason` = `no_match` 或 `ambiguous`

并将 `query_title` 写入负缓存（参见 [RAWG_DATA_CACHE.md](file:///d:/JoyMate/RAWG_DATA_CACHE.md)）。

## 7. match_reason 枚举（建议）

- `exact_name`：标准化后完全一致
- `near_exact`：仅空格/标点差异
- `edition_suffix`：差异主要来自版本后缀
- `fuzzy_high`：高相似度（sim >= 0.92）
- `fuzzy_medium`：中相似度（0.85~0.92）
- `platform_hint`：平台偏好带来的关键加分（通常仅作 tie-break，不应单独成为原因）
- `ambiguous`：多候选近似同分，拒绝匹配
- `no_match`：整体置信度低

## 8. 别名表（v0 预留，v1 强烈建议）

### 8.1 为什么需要别名表
中文名、国内常用译名、简称非常常见，例如：
- “只狼” vs “Sekiro: Shadows Die Twice”
- “黑神话” vs “Black Myth: Wukong”

### 8.2 别名表形态（建议）
- Key：`alias_norm`
- Value：`canonical_query`（用于替换查询）或直接绑定 `rawg_id`

优先级：
1) 如果 alias 表命中 → 直接使用绑定 id（最高可信）
2) 否则走搜索打分流程

## 9. 测试集建议（用于验规则）

### 9.1 覆盖场景
- 中英文：`Hades` / `哈迪斯`
- 系列编号：`DOOM` vs `DOOM Eternal`，`The Witcher 3`
- 版本：`Persona 5` vs `Persona 5 Royal`
- 重制：`The Last of Us` vs `The Last of Us Part I`
- 同名/近名：`Prey (2006)` vs `Prey (2017)`
- 冷门：搜索返回少且相似度低（应降级）

### 9.2 评估指标
- **误匹配率（最重要）**：错贴条目的比例
- 匹配成功率：能补齐真实卡片的比例
- 平均延迟：search+detail 端到端耗时

## 10. 迭代路线（v0 → v1）

- v0：规则加权分 + 阈值 + 降级
- v1：
  - 引入别名表（手工维护 + 用户反馈）
  - 增加罗马数字归一与年份识别
  - 引入“疑似 DLC/Bundle”识别规则
  - 将 `intent.preferences` 与 `genres/tags` 做轻量一致性加分（仅 tie-break）

