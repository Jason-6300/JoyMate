import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Send, Image as ImageIcon, Sparkles, Bot, ShieldAlert, Palette, Coins } from 'lucide-react';
import { getGameRecommendation } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import GameDetailsModal from './GameDetailsModal';
import { toZhLabel, toZhLabels } from '../lib/gameI18n';

// Typewriter component for smoother text reveal
const TypewriterText = memo(({ text, speed = 25, onComplete, onCharTyped }: { text: string; speed?: number; onComplete?: () => void; onCharTyped?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);

  // Keep ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (!text) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        onCharTyped?.();
      }, speed);
      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && text.length > 0) {
      // Use a small delay to ensure rendering is stable before triggering next stage
      const timeout = setTimeout(() => {
        onCompleteRef.current?.();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed, onCharTyped]);

  return (
    <div className="markdown-body">
      <ReactMarkdown>{displayedText}</ReactMarkdown>
    </div>
  );
});

TypewriterText.displayName = 'TypewriterText';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content?: string;
  data?: any;
  isLoading?: boolean;
  typingStage?: 'personas' | 'host' | 'games';
}

type SessionMemory = {
  liked: string[];
  disliked: string[];
  seen: string[];
  style: 'balanced' | 'hardcore' | 'aesthetic' | 'budget';
};

export default function MainContent({ onOpenImageModal, quickPrompt }: { onOpenImageModal: () => void; quickPrompt?: { id: number; text: string } | null }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      data: {
        host_message: "嘿！我是你的超级游戏搭子 **JoyMate 游戏小伙**！🎮 \n\n想找点新鲜感？还是想在虚拟世界里来场大冒险？快告诉我你现在的心情，或者你想玩哪种类型的游戏，我这就去翻遍全球游戏库，为你精准安利！✨",
      },
      typingStage: 'host' // Welcome message has only host message
    }
  ]);
  const [input, setInput] = useState('');
  const [featured, setFeatured] = useState<any[] | null>(null);
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [sessionMemory, setSessionMemory] = useState<SessionMemory>(() => {
    try {
      const raw = sessionStorage.getItem('joymate_session_memory');
      if (!raw) throw new Error('missing');
      const parsed = JSON.parse(raw) as Partial<SessionMemory>;
      return {
        liked: Array.isArray(parsed.liked) ? parsed.liked : [],
        disliked: Array.isArray(parsed.disliked) ? parsed.disliked : [],
        seen: Array.isArray(parsed.seen) ? parsed.seen : [],
        style: parsed.style ?? 'balanced',
      };
    } catch {
      return { liked: [], disliked: [], seen: [], style: 'balanced' };
    }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const finishedPersonasRef = useRef<Record<string, number>>({});
  const sessionMemoryRef = useRef<SessionMemory>({ liked: [], disliked: [], seen: [], style: 'balanced' });
  const lastUserIntentRef = useRef<string>('');
  const isBusy = messages.some((m) => Boolean(m.isLoading));

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/featured")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (Array.isArray(j?.featured)) setFeatured(j.featured);
      })
      .catch(() => {
        if (cancelled) return;
        setFeatured([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('joymate_session_memory', JSON.stringify(sessionMemory));
    } catch {}
    sessionMemoryRef.current = sessionMemory;
  }, [sessionMemory]);

  useEffect(() => {
    if (!quickPrompt?.text) return;
    setInput(quickPrompt.text);
  }, [quickPrompt?.id, quickPrompt?.text]);

  const buildPrompt = useCallback((userText: string, actionHint?: string) => {
    const mem = sessionMemoryRef.current;
    const liked = mem.liked.slice(-8);
    const disliked = mem.disliked.slice(-8);
    const seen = mem.seen.slice(-20);
    const style =
      mem.style === 'hardcore'
        ? '更偏硬核深度'
        : mem.style === 'aesthetic'
          ? '更偏艺术氛围'
          : mem.style === 'budget'
            ? '更偏性价比'
            : '均衡';

    const lines = [
      '你是 JoyMate 游戏伙伴。请结合用户当前需求进行推荐，并尽量避免重复。',
      `输出风格偏好：${style}。`,
      liked.length ? `用户喜欢过的游戏/方向：${liked.join('、')}。` : '',
      disliked.length ? `用户不喜欢的游戏/方向：${disliked.join('、')}。` : '',
      seen.length ? `请尽量不要重复推荐这些游戏：${seen.join('、')}。` : '',
      actionHint ? `额外指令：${actionHint}` : '',
      `用户原话：${userText}`,
    ].filter(Boolean);

    return lines.join('\n');
  }, []);

  const handleSend = async (
    arg?: string | { displayText: string; promptText: string; updateIntent?: boolean; actionHint?: string },
  ) => {
    const isObj = typeof arg === 'object' && arg !== null;
    const displayText = isObj ? arg.displayText : (arg ?? input).trim();
    const promptText = isObj ? arg.promptText : displayText;
    const updateIntent = isObj ? Boolean(arg.updateIntent) : true;
    const actionHint = isObj ? arg.actionHint : undefined;

    const rawDisplay = (displayText ?? '').trim();
    const rawPrompt = (promptText ?? '').trim();
    if (!rawDisplay || !rawPrompt) return;

    if (updateIntent) lastUserIntentRef.current = rawPrompt;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: rawDisplay };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Scroll immediately after user sends message
    setTimeout(() => scrollToBottom("smooth"), 100);

    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: loadingId, role: 'ai', isLoading: true }]);
    setTimeout(() => scrollToBottom("smooth"), 100);

    try {
      const data = await getGameRecommendation(buildPrompt(rawPrompt, actionHint));
      const titles = Array.isArray(data?.recommended_games)
        ? data.recommended_games
            .map((g: any) => (typeof g?.title_ai === 'string' ? g.title_ai : g?.title))
            .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
        : [];

      if (titles.length) {
        setSessionMemory(prev => {
          const merged = Array.from(new Set([...prev.seen, ...titles]));
          return { ...prev, seen: merged.slice(-40) };
        });
      }
      // Reset state for animations if needed, though TypewriterText handles text changes
      setMessages(prev => prev.map(msg => msg.id === loadingId ? { 
        id: loadingId, 
        role: 'ai', 
        data, 
        isLoading: false,
        typingStage: (data.aesthetic_critic || data.hardcore_strategist || data.budget_expert) ? 'personas' : 'host'
      } : msg));
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => msg.id === loadingId ? { 
        id: loadingId, 
        role: 'ai', 
        data: { host_message: "抱歉，我的分析引擎遇到了一点问题。请稍后再试。" }, 
        isLoading: false,
        typingStage: 'host'
      } : msg));
    }
  };

  const rememberLikedFromMsg = useCallback((games: any[]) => {
    const picks = (Array.isArray(games) ? games : [])
      .map((g: any) => (typeof g?.title_ai === 'string' ? g.title_ai : g?.title))
      .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
      .slice(0, 2);
    if (!picks.length) return;
    setSessionMemory(prev => {
      const merged = Array.from(new Set([...prev.liked, ...picks]));
      return { ...prev, liked: merged.slice(-30) };
    });
  }, []);

  const pushQuickAiMessage = useCallback((text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      role: 'ai',
      data: { host_message: text },
      typingStage: 'host',
    };
    setMessages(prev => [...prev, msg]);
    setTimeout(() => scrollToBottom("smooth"), 100);
  }, [scrollToBottom]);

  const cycleStyle = useCallback(() => {
    let nextStyle: SessionMemory['style'] = 'balanced';
    setSessionMemory(prev => {
      const order: SessionMemory['style'][] = ['balanced', 'hardcore', 'aesthetic', 'budget'];
      const idx = order.indexOf(prev.style);
      nextStyle = order[(idx + 1) % order.length];
      const next = { ...prev, style: nextStyle };
      sessionMemoryRef.current = next;
      return next;
    });
    return nextStyle;
  }, []);

  const handlePersonaComplete = useCallback((msgId: string, totalPersonas: number) => {
    const count = (finishedPersonasRef.current[msgId] || 0) + 1;
    finishedPersonasRef.current[msgId] = count;
    if (count === totalPersonas) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, typingStage: 'host' } : m));
    }
  }, []);

  const handleHostComplete = useCallback((msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, typingStage: 'games' } : m));
  }, []);

  const handleCharTyped = useCallback(() => {
    scrollToBottom("auto");
  }, [scrollToBottom]);

  const openGame = useCallback((game: any) => {
    setSelectedGame(game);
  }, []);

  const closeGame = useCallback(() => {
    setSelectedGame(null);
  }, []);

  // Staggered animation variants for game cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#0a0c10]">
      {/* Top Nav */}
      <div className="h-16 border-b border-white/5 flex items-center justify-center px-8 shrink-0">
        <nav className="flex gap-8 text-sm font-medium">
          <a href="#" className="text-white">智能推荐</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">探索发现</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">游戏库</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">社区活动</a>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium mb-4 border border-blue-500/20">
              <Sparkles size={12} />
              AI Analysis Active
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 text-transparent bg-clip-text">
              发现你的下一款挚爱游戏
            </h1>
            <p className="text-gray-400 text-sm">基于深度学习算法，分析你的游戏DNA，精准匹配最适合你的沉浸式体验</p>
          </div>

          {/* Chat Container */}
          <div className="bg-[#151820] rounded-2xl border border-white/5 shadow-2xl overflow-hidden flex flex-col mb-12">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold">JoyMate 游戏小伙</div>
                  <div className="text-xs text-gray-500">随时为你解答游戏相关问题</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs text-emerald-500 font-medium">在线</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.role === 'user' ? (
                      <div className="bg-blue-600/20 border border-blue-500/30 text-blue-100 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="w-full space-y-4">
                        {msg.isLoading ? (
                          <div className="flex items-center gap-3 text-gray-500 text-sm p-4">
                            <Sparkles size={16} className="animate-spin" />
                            <div className="flex flex-col">
                              <span className="text-gray-300">JoyMate 正在为你认真挑选下一款游戏…</span>
                              <span className="text-xs text-gray-500 mt-1">预计 20–40 秒出结果（视网络与模型负载波动）</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Intent Summary (Step 1 from Design Doc) */}
                            {msg.data?.intent && (
                              <div className="flex flex-wrap gap-2 pl-4 mb-2">
                                {msg.data.intent.game_name && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">
                                    🎮 {msg.data.intent.game_name}
                                  </span>
                                )}
                                {msg.data.intent.emotion && (
                                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] border border-purple-500/20">
                                    ✨ {msg.data.intent.emotion}
                                  </span>
                                )}
                                {msg.data.intent.scenario && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                                    🏠 {msg.data.intent.scenario}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Expert Opinions */}
                            {(msg.data?.aesthetic_critic || msg.data?.hardcore_strategist || msg.data?.budget_expert) && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="space-y-3 pl-4 border-l-2 border-white/10"
                              >
                                {msg.data.aesthetic_critic && (
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 text-purple-400"><Palette size={16} /></div>
                                    <div>
                                      <div className="text-xs font-bold text-purple-400 mb-1">视觉专家</div>
                                      <div className="text-sm text-gray-300 bg-white/5 px-4 py-2 rounded-xl rounded-tl-sm inline-block">
                                        <TypewriterText 
                                          text={msg.data.aesthetic_critic} 
                                          speed={25} 
                                          onCharTyped={handleCharTyped}
                                          onComplete={() => handlePersonaComplete(msg.id, [msg.data.aesthetic_critic, msg.data.hardcore_strategist, msg.data.budget_expert].filter(Boolean).length)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {msg.data.hardcore_strategist && (
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 text-orange-400"><ShieldAlert size={16} /></div>
                                    <div>
                                      <div className="text-xs font-bold text-orange-400 mb-1">硬核导师</div>
                                      <div className="text-sm text-gray-300 bg-white/5 px-4 py-2 rounded-xl rounded-tl-sm inline-block">
                                        <TypewriterText 
                                          text={msg.data.hardcore_strategist} 
                                          speed={25} 
                                          onCharTyped={handleCharTyped}
                                          onComplete={() => handlePersonaComplete(msg.id, [msg.data.aesthetic_critic, msg.data.hardcore_strategist, msg.data.budget_expert].filter(Boolean).length)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {msg.data.budget_expert && (
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 text-emerald-400"><Coins size={16} /></div>
                                    <div>
                                      <div className="text-xs font-bold text-emerald-400 mb-1">预算专家</div>
                                      <div className="text-sm text-gray-300 bg-white/5 px-4 py-2 rounded-xl rounded-tl-sm inline-block">
                                        <TypewriterText 
                                          text={msg.data.budget_expert} 
                                          speed={25} 
                                          onCharTyped={handleCharTyped}
                                          onComplete={() => handlePersonaComplete(msg.id, [msg.data.aesthetic_critic, msg.data.hardcore_strategist, msg.data.budget_expert].filter(Boolean).length)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}

                            {/* Host Message */}
                            {(msg.typingStage === 'host' || msg.typingStage === 'games') && msg.data?.host_message && (
                              <div className="flex items-start gap-3 mt-4">
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
                                  <Bot size={12} className="text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="text-xs font-bold text-blue-400">JoyMate 游戏小伙</div>
                                    {msg.data.thinking_time && (
                                      <div className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                        思考用时: {msg.data.thinking_time}s
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-200 leading-relaxed">
                                    <TypewriterText 
                                      text={msg.data.host_message} 
                                      speed={30} 
                                      onCharTyped={handleCharTyped} 
                                      onComplete={() => handleHostComplete(msg.id)}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Recommended Games */}
                            {msg.typingStage === 'games' && msg.data?.recommended_games && msg.data.recommended_games.length > 0 && (
                              <>
                                {(msg.data?.rawg?.enabled === false || msg.data.recommended_games.some((g: any) => !g?.rawg_url)) && (
                                  <div className="pl-9 text-xs text-gray-500">
                                    部分卡片暂时无法获取真实数据，已使用备用信息展示。
                                  </div>
                                )}
                              <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pl-9"
                              >
                                {msg.data.recommended_games.map((game: any, idx: number) => (
                                  <motion.div 
                                    key={idx} 
                                    variants={itemVariants}
                                    className="bg-[#1a1d24] rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-colors group"
                                  >
                                    <button type="button" onClick={() => openGame(game)} className="block w-full text-left">
                                        <div className="h-32 overflow-hidden relative">
                                          <img 
                                            src={game.cover_url || `https://picsum.photos/seed/${game.image_keyword || game.title}/400/300`} 
                                            alt={game.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d24] to-transparent"></div>
                                          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                                            {game.match_percentage}% Match
                                          </div>
                                          {typeof game.match_confidence === 'number' && game.match_confidence < 70 && (
                                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-yellow-400 border border-yellow-500/30">
                                              需确认
                                            </div>
                                          )}
                                        </div>
                                        <div className="p-4">
                                          <h3 className="font-bold text-sm truncate">{game.title}</h3>
                                          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                                            {typeof game.metacritic === 'number' && (
                                              <span className="text-emerald-400 font-bold">MC {game.metacritic}</span>
                                            )}
                                            {typeof game.metacritic !== 'number' && typeof game.rating === 'number' && (
                                              <span className="text-emerald-400 font-bold">★ {game.rating.toFixed(1)}</span>
                                            )}
                                            {typeof game.released === 'string' && game.released.length > 0 && (
                                              <span className="truncate">{game.released}</span>
                                            )}
                                            {Array.isArray(game.platforms) && game.platforms.length > 0 && (
                                              <span className="truncate">{game.platforms.slice(0, 2).join(' · ')}</span>
                                            )}
                                          </div>
                                          {(Array.isArray(game.genres) || Array.isArray(game.tags)) && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                              {(Array.isArray(game.genres) ? toZhLabels(game.genres, 2) : []).slice(0, 2).map((t: string) => (
                                                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                                                  {toZhLabel(t)}
                                                </span>
                                              ))}
                                              {(Array.isArray(game.tags) ? toZhLabels(game.tags, 1) : []).slice(0, 1).map((t: string) => (
                                                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                                                  {toZhLabel(t)}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                          <p className="text-xs text-gray-400 line-clamp-2 mt-2">{game.reason}</p>
                                        </div>
                                    </button>
                                  </motion.div>
                                ))}
                              </motion.div>
                              <div className="pl-9 mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    rememberLikedFromMsg(msg.data.recommended_games);
                                    pushQuickAiMessage("太好了！你喜欢这波我就放心了～我已经记下你的口味了，下次推荐会更贴你。");
                                  }}
                                  disabled={isBusy}
                                  className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-gray-200 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  喜欢这波
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSend({
                                    displayText: "再推荐一波",
                                    promptText: lastUserIntentRef.current || "按刚刚的需求",
                                    updateIntent: false,
                                    actionHint: "请再推荐 4 款不同的游戏，尽量避开刚才那一批，并保持同样的情绪/场景匹配。",
                                  })}
                                  disabled={isBusy}
                                  className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-gray-200 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  再推荐
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    cycleStyle();
                                    handleSend({
                                      displayText: "换一种风格",
                                      promptText: lastUserIntentRef.current || "按刚刚的需求",
                                      updateIntent: false,
                                      actionHint: "请用不同于上一轮的表达与角度来推荐（比如更硬核/更艺术/更性价比），但仍满足用户的原始需求。",
                                    });
                                  }}
                                  disabled={isBusy}
                                  className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-gray-200 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  换一种风格
                                </button>
                              </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white/[0.02] border-t border-white/5 sticky bottom-0 bg-[#151820] z-10">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="最近想玩一点画风唯美的平台跳跃，有什么推荐吗？"
                  className="w-full bg-[#0a0c10] border border-white/10 rounded-xl py-3 pl-4 pr-24 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <div className="absolute right-2 flex items-center gap-2">
                  <button 
                    onClick={onOpenImageModal}
                    className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors"
                    title="Generate Concept Art"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
              <div className="flex gap-4 mt-3 px-2">
                <span className="text-xs text-gray-500">热门搜索：</span>
                <button className="text-xs text-gray-400 hover:text-white transition-colors" onClick={() => setInput("类似艾尔登法环")}>类似艾尔登法环</button>
                <button className="text-xs text-gray-400 hover:text-white transition-colors" onClick={() => setInput("多人合作")}>多人合作</button>
                <button className="text-xs text-gray-400 hover:text-white transition-colors" onClick={() => setInput("剧情向")}>剧情向</button>
                <button className="text-xs text-gray-400 hover:text-white transition-colors" onClick={() => setInput("独立游戏")}>独立游戏</button>
              </div>
            </div>
          </div>

          {/* Static Recommendations Section (from UI mockup) */}
          <div className="mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">为你推荐</h2>
                <p className="text-xs text-gray-500">基于《黑神话：悟空》与《只狼》的游戏数据匹配</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex -space-x-2">
                  <img alt="" src="https://picsum.photos/seed/u1/30/30" className="w-6 h-6 rounded-full border border-[#0a0c10]" />
                  <img alt="" src="https://picsum.photos/seed/u2/30/30" className="w-6 h-6 rounded-full border border-[#0a0c10]" />
                  <img alt="" src="https://picsum.photos/seed/u3/30/30" className="w-6 h-6 rounded-full border border-[#0a0c10]" />
                </div>
                <span className="bg-white/10 px-2 py-1 rounded-full text-gray-300">+12k</span>
                <span className="text-gray-500 ml-2">在线玩家<br/>正在与 AI 互动</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured?.length === 0 && (
                <div className="md:col-span-2 lg:col-span-4 text-xs text-gray-500">
                  精选数据暂时不可用，已显示默认推荐。
                </div>
              )}
              {(featured ?? [
                { title: "Cyberpunk 2077" },
                { title: "Elden Ring" },
                { title: "Baldur's Gate 3" },
                { title: "The Legend of Zelda: Tears of the Kingdom" },
              ]).slice(0, 4).map((g: any, i: number) => (
                <RecCard
                  key={g.rawg_url ?? g.title ?? i}
                  title={g.title}
                  subtitle={g.title_en}
                  tags={Array.isArray(g.genres) ? toZhLabels(g.genres, 3) : []}
                  score={typeof g.metacritic === "number" ? `MC ${g.metacritic}` : (typeof g.rating === "number" ? `★ ${g.rating.toFixed(1)}` : "")}
                  img={g.cover_url}
                  onClick={() => openGame(g)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
      {selectedGame && <GameDetailsModal game={selectedGame} onClose={closeGame} />}
    </div>
  );
}

function RecCard({ title, subtitle, tags, score, img, onClick }: any) {
  return (
    <button type="button" onClick={onClick} className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer block text-left">
      <img
        src={img || `https://picsum.photos/seed/${encodeURIComponent(title)}/400/600`}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

      {score && (
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-center">
          <div className="text-sm font-bold text-emerald-400">{score}</div>
          <div className="text-[9px] text-gray-400 uppercase">Score</div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex gap-2 mb-2">
          {(tags ?? []).map((tag: string, i: number) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 backdrop-blur-sm border border-white/5">{tag}</span>
          ))}
        </div>
        <h3 className="font-bold text-lg leading-tight">{title}</h3>
        {subtitle && <div className="text-xs text-gray-400 mt-1 truncate">{subtitle}</div>}
      </div>
    </button>
  );
}
