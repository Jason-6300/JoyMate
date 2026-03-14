import { TrendingUp, Activity } from 'lucide-react';

export default function RightSidebar() {
  return (
    <div className="w-80 border-l border-white/10 p-6 hidden lg:flex flex-col overflow-y-auto bg-[#0a0c10]">
      <div className="flex items-center justify-end gap-3 mb-8">
        <div className="text-right">
          <div className="text-sm font-bold">NeonWalker</div>
          <div className="text-xs text-gray-500">Pro Member</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px]">
          <img src="https://picsum.photos/seed/avatar/100/100" alt="Avatar" className="w-full h-full rounded-full border-2 border-[#0a0c10]" />
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10 flex flex-col items-center">
        <div className="relative w-24 h-24 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="283" strokeDashoffset="70" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">42</span>
            <span className="text-[10px] text-gray-400">LV</span>
          </div>
        </div>
        <div className="text-sm font-medium mb-1">经验进度</div>
        <div className="text-xs text-gray-500 mb-6">距离下一等级还需 420 XP</div>
        
        <div className="flex w-full justify-between text-center">
          <div>
            <div className="text-lg font-bold">156</div>
            <div className="text-xs text-gray-500">Games</div>
          </div>
          <div>
            <div className="text-lg font-bold">89h</div>
            <div className="text-xs text-gray-500">Weekly</div>
          </div>
          <div>
            <div className="text-lg font-bold">12</div>
            <div className="text-xs text-gray-500">Trophies</div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold">全网热度趋势</span>
          <TrendingUp size={14} className="text-gray-500" />
        </div>
        <div className="space-y-3">
          <TrendItem rank="01" name="黑神话：悟空" score="98.5w" />
          <TrendItem rank="02" name="星空 Starfield" score="86.2w" />
          <TrendItem rank="03" name="装甲核心 6" score="72.8w" />
          <TrendItem rank="04" name="遗迹 2" score="54.1w" />
        </div>
      </div>

      <div className="bg-gradient-to-b from-blue-900/20 to-transparent rounded-2xl p-5 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-blue-400" />
          <span className="text-sm font-bold text-blue-100">基于风格图谱的深度见解</span>
        </div>
        <p className="text-xs text-blue-200/70 leading-relaxed mb-4">
          系统检测到您对<strong className="text-blue-300">碎片化叙事</strong>和<strong className="text-blue-300">硬核战斗</strong>的偏好权重提升了 24%。<br/><br/>
          AI 建议关注下个月发布的独立游戏《深空迷航》，该作在机制上与您的历史收藏有 88% 的相似度。
        </p>
        <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
          获取完整报告
        </button>
      </div>
    </div>
  );
}

function TrendItem({ rank, name, score }: { rank: string, name: string, score: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 font-mono text-xs">{rank}</span>
        <span className="text-gray-200">{name}</span>
      </div>
      <span className="text-xs font-bold text-white">{score}</span>
    </div>
  );
}
