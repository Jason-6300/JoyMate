# RAWG 数据字段与缓存策略说明（v0）

本文档用于指导 JoyMate “真实游戏卡片（RAWG）”接入的后端数据增强层设计：明确字段映射、缓存结构、TTL、并发与降级规则。目标是先把推荐卡片做真（封面/评分/平台/简介/链接），不涉及价格与史低。

## 1. 范围与原则

- **范围**：仅接入 RAWG 游戏元数据（search + detail），用于增强推荐卡片。
- **不做**：价格、史低、折扣历史；跨平台价格比价。
- **原则**
  - **宁缺毋滥**：匹配不确定时降级，不要补错。
  - **缓存优先**：避免频繁请求导致限流；提升响应速度。
  - **部分成功可用**：某些卡片增强失败不影响整体响应。

## 2. RAWG API Key 与配置

- 环境变量：`RAWG_API_KEY`
- 统一配置参数（建议默认值）
  - `RAWG_BASE_URL`: `https://api.rawg.io/api`
  - `RAWG_PAGE_SIZE`: 5（每次搜索返回候选数量）
  - `RAWG_TIMEOUT_MS`: 3000~5000
  - `RAWG_MAX_ENRICH_GAMES`: 6（每次推荐最多增强条数）

## 3. 数据增强层输入/输出

### 3.1 输入（来自 LLM）

推荐接口当前输出的核心是 `recommended_games[]`，每项包含：
- `title`（候选游戏名）
- `reason`（买手点评）
- `match_percentage`
- `image_keyword`（现阶段可弃用或作为备用）

### 3.2 输出（返回前端的“真实卡片字段”）

对每个推荐游戏项，增强为以下结构（字段名可在实现阶段统一规范）：

- **AI 字段**
  - `title_ai`: string（原始 LLM 输出，便于调试/回退）
  - `reason`: string
  - `match_percentage`: number
- **RAWG 主键/链接**
  - `rawg_id`: number
  - `rawg_slug`: string
  - `rawg_url`: string（RAWG 站内页 URL 或 API 推导 URL）
- **展示字段**
  - `title`: string（RAWG canonical name）
  - `cover_url`: string（`background_image`）
  - `rating`: number | null
  - `ratings_count`: number | null
  - `metacritic`: number | null
  - `released`: string | null
  - `platforms`: string[]（如 `["PC","PlayStation 5","Nintendo Switch"]`）
  - `genres`: string[]（如 `["RPG","Action"]`）
  - `tags`: string[]（可选，数量需限制）
  - `description_short`: string | null（建议优先短摘要，避免返回过长）
- **匹配诊断（可选，但强烈建议）**
  - `match_confidence`: number（0~100）
  - `match_reason`: string（例如 `exact_name`, `alias_match`, `fuzzy_high`）

> 前端只需依赖展示字段 + `reason`，诊断字段用于后续调优与 A/B。

## 4. 字段映射建议（RAWG → JoyMate）

以 RAWG 常见字段为参考（具体字段名以实际返回为准）：

- `id` → `rawg_id`
- `slug` → `rawg_slug`
- `name` → `title`
- `background_image` → `cover_url`
- `rating` → `rating`
- `ratings_count` → `ratings_count`
- `metacritic` → `metacritic`
- `released` → `released`
- `platforms[].platform.name` → `platforms[]`
- `genres[].name` → `genres[]`
- `tags[].name` → `tags[]`（限制 5~10 个）
- `description_raw` → `description_short`（建议截断 180~240 字）

## 5. 缓存设计

### 5.1 为什么要缓存

- RAWG 有访问频率限制；且推荐一次会触发多次搜索与详情请求。
- 推荐接口对交互体验要求高（秒级响应），缓存能显著降低时延与失败率。

### 5.2 缓存层级（两级缓存）

**Cache A：搜索对齐缓存（Name → RAWG id）**
- Key：`rawg:search:{normalized_query}`
- Value：
  - `best_id`, `best_slug`, `match_confidence`, `best_name`
  - `candidates`: 仅保留前 3 条（id/name/slug/score），用于调试
- TTL：7 天（建议 7~30 天，视更新频率与命名误差而定）

**Cache B：详情缓存（RAWG id → 详情）**
- Key：`rawg:detail:{rawg_id}`
- Value：`title/cover_url/rating/platforms/genres/...`（前端展示所需最小集）
- TTL：1~7 天（建议 3 天起步）

### 5.3 缓存存储形态（MVP）

按开发成本从低到高：
- 方案 0：内存 LRU（进程内）——开发最快，但重启丢失
- 方案 1：SQLite（本地持久化）——适合单机/小规模
- 方案 2：Redis ——生产环境更稳

MVP 建议：本地开发可先用内存 LRU；上线后切 SQLite 或 Redis。

### 5.4 负缓存（Negative Cache）

避免反复请求“搜不到”的游戏名：
- Key：`rawg:miss:{normalized_query}`
- TTL：24 小时
- 触发条件：搜索 0 结果或最高分低于阈值

## 6. 并发、限流与超时策略

- 每次请求最多增强 `RAWG_MAX_ENRICH_GAMES` 条（建议 6）
- 并发控制：同时最多 2~3 个 RAWG 请求（搜索/详情合并考虑）
- 超时：单请求 3~5 秒；整体增强层设置硬超时（例如 6~8 秒）
- 失败重试：默认不重试或只重试 1 次（避免雪崩）

## 7. 降级与回退策略（必须明确）

### 7.1 单卡片降级

当某个 `title` 增强失败：
- 保留 AI 的 `title_ai`/`reason`/`match_percentage`
- `cover_url` 使用占位图
- 不展示评分/平台/简介
- `match_confidence` 设为 0 或 null

### 7.2 全局降级

当 RAWG 整体不可用（超时/限流/无 key）：
- 推荐接口仍返回 AI 的结构化结果
- 前端稳定渲染，不显示真实字段

## 8. 数据质量与可观测性（建议）

建议在日志/监控里记录以下指标（不含用户隐私内容）：
- 增强成功率：`enriched_count / requested_count`
- 平均 RAWG 延迟：search/detail 分开统计
- 误匹配反馈：通过后续用户“喜欢/不喜欢/再推荐”按钮反推
- Top miss queries：用于补充别名表/规则

## 9. 未来扩展（非 MVP）

- 别名与中文名映射表：`alias -> canonical`（手工维护 + 用户反馈迭代）
- 多平台深链：Steam/Epic/PSN/Switch 的商店链接映射
- 价格链路：在获取到 Steam appid 后再接价格源

