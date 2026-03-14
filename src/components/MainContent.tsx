import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Send, Image as ImageIcon, Sparkles, Bot, ShieldAlert, Palette, Coins } from 'lucide-react';
import { getGameRecommendation } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

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

export default function MainContent({ onOpenImageModal }: { onOpenImageModal: () => void }) {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const finishedPersonasRef = useRef<Record<string, number>>({});

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Scroll immediately after user sends message
    setTimeout(() => scrollToBottom("smooth"), 100);

    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: loadingId, role: 'ai', isLoading: true }]);
    setTimeout(() => scrollToBottom("smooth"), 100);

    try {
      const data = await getGameRecommendation(userMsg.content!);
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
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
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
                            <span>AI 正在深度分析你的需求...</span>
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
                                    <div className="h-32 overflow-hidden relative">
                                      <img 
                                        src={`https://picsum.photos/seed/${game.image_keyword || game.title}/400/300`} 
                                        alt={game.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d24] to-transparent"></div>
                                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                                        {game.match_percentage}% Match
                                      </div>
                                    </div>
                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-sm truncate">{game.title}</h3>
                                        {game.price_estimate && (
                                          <span className="text-[10px] font-bold text-emerald-400">
                                            {game.price_estimate}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-400 line-clamp-2">{game.reason}</p>
                                    </div>
                                  </motion.div>
                                ))}
                              </motion.div>
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
                    onClick={handleSend}
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
                  <img src="https://picsum.photos/seed/u1/30/30" className="w-6 h-6 rounded-full border border-[#0a0c10]" />
                  <img src="https://picsum.photos/seed/u2/30/30" className="w-6 h-6 rounded-full border border-[#0a0c10]" />
                  <img src="https://picsum.photos/seed/u3/30/30" className="w-6 h-6 rounded-full border border-[#0a0c10]" />
                </div>
                <span className="bg-white/10 px-2 py-1 rounded-full text-gray-300">+12k</span>
                <span className="text-gray-500 ml-2">在线玩家<br/>正在与 AI 互动</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <RecCard title="赛博朋克 2077" subtitle="Cyberpunk 2077" tags={["开放世界", "RPG", "科幻"]} match="98%" score="9.2" img="cyberpunk" />
              <RecCard title="艾尔登法环" subtitle="Elden Ring" tags={["魂系", "动作", "奇幻"]} match="95%" score="9.6" img="eldenring" />
              <RecCard title="博德之门 3" subtitle="Baldur's Gate 3" tags={["CRPG", "剧情", "策略"]} match="92%" score="9.8" img="bg3" />
              <RecCard title="塞尔达传说：王国之泪" subtitle="Zelda: TOTK" tags={["冒险", "解谜", "自由度"]} match="89%" score="9.7" img="zelda" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function RecCard({ title, subtitle, tags, match, score, img }: any) {
  return (
    <div className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer">
      <img src={`https://picsum.photos/seed/${img}/400/600`} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-center">
        <div className="text-sm font-bold text-emerald-400">{match}</div>
        <div className="text-[9px] text-gray-400 uppercase">Match</div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex gap-2 mb-2">
          {tags.map((tag: string, i: number) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 backdrop-blur-sm border border-white/5">{tag}</span>
          ))}
        </div>
        <h3 className="font-bold text-lg leading-tight">{title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">{subtitle}</span>
          <span className="text-sm font-bold text-yellow-500 flex items-center gap-1">★ {score}</span>
        </div>
      </div>
    </div>
  );
}
