import React from "react";
import { X, ExternalLink } from "lucide-react";
import { isMostlyCjkText, toZhLabel, toZhLabels } from "../lib/gameI18n";

type GameDetails = {
  title?: string;
  title_ai?: string;
  cover_url?: string;
  rawg_url?: string;
  released?: string | null;
  metacritic?: number | null;
  rating?: number | null;
  platforms?: string[];
  genres?: string[];
  tags?: string[];
  description_short?: string | null;
  reason?: string;
  match_confidence?: number;
  match_reason?: string;
};

export default function GameDetailsModal({ game, onClose }: { game: GameDetails; onClose: () => void }) {
  const title = game.title ?? game.title_ai ?? "Game";
  const subtitle = game.title_ai && game.title_ai !== game.title ? game.title_ai : undefined;
  const platformsZh = toZhLabels(game.platforms, 8);
  const genresZh = toZhLabels(game.genres, 8);
  const tagsZh = toZhLabels(game.tags, 10);

  const intro =
    game.description_short && isMostlyCjkText(game.description_short)
      ? game.description_short
      : (() => {
          const parts: string[] = [];
          if (genresZh.length > 0) parts.push(`${genresZh.slice(0, 3).join("、")}游戏`);
          if (game.released) parts.push(`发行于 ${game.released}`);
          if (platformsZh.length > 0) parts.push(`支持 ${platformsZh.slice(0, 4).join(" / ")}`);
          if (parts.length === 0) return "暂无简介信息。";
          return parts.join("，") + "。";
        })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#151820] w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="min-w-0">
            <div className="font-bold text-lg text-white truncate">{title}</div>
            {subtitle && <div className="text-xs text-gray-500 truncate">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-2">
            {game.rawg_url && (
              <a
                href={game.rawg_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-gray-200 hover:bg-white/5 transition-colors inline-flex items-center gap-2"
              >
                <ExternalLink size={14} />
                打开 RAWG
              </a>
            )}
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-[#0a0c10] rounded-xl border border-white/5 overflow-hidden aspect-[4/5]">
                <img
                  src={game.cover_url || `https://picsum.photos/seed/${encodeURIComponent(title)}/600/800`}
                  alt={title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {typeof game.metacritic === "number" && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20">
                    MC {game.metacritic}
                  </span>
                )}
                {typeof game.metacritic !== "number" && typeof game.rating === "number" && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20">
                    ★ {game.rating.toFixed(1)}
                  </span>
                )}
                {game.released && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 text-[11px] border border-white/10">
                    {game.released}
                  </span>
                )}
                {typeof game.match_confidence === "number" && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 text-[11px] border border-white/10">
                    匹配 {game.match_confidence}
                  </span>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-xs font-bold text-gray-400 mb-2">一句话简介</div>
                <div className="text-sm text-gray-200 leading-relaxed">{intro}</div>
              </div>

              {game.reason && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs font-bold text-blue-400 mb-2">伙伴点评</div>
                  <div className="text-sm text-gray-200 leading-relaxed">{game.reason}</div>
                </div>
              )}

              {(Array.isArray(game.platforms) && game.platforms.length > 0) && (
                <div>
                  <div className="text-xs font-bold text-gray-400 mb-2">平台</div>
                  <div className="flex flex-wrap gap-2">
                    {platformsZh.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 text-[11px] border border-white/10">
                        {toZhLabel(p)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(Array.isArray(game.genres) && game.genres.length > 0) && (
                <div>
                  <div className="text-xs font-bold text-gray-400 mb-2">类型</div>
                  <div className="flex flex-wrap gap-2">
                    {genresZh.map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 text-[11px] border border-white/10">
                        {toZhLabel(g)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(Array.isArray(game.tags) && game.tags.length > 0) && (
                <div>
                  <div className="text-xs font-bold text-gray-400 mb-2">标签</div>
                  <div className="flex flex-wrap gap-2">
                    {tagsZh.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 text-[11px] border border-white/10">
                        {toZhLabel(t)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {game.match_reason && (
                <div className="text-[11px] text-gray-600">
                  {game.match_reason}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
