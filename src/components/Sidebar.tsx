import { Gamepad2, Swords, Car, Glasses, Users, Puzzle, HelpCircle } from 'lucide-react';

export default function Sidebar({ onPresetQuestion }: { onPresetQuestion?: (text: string) => void }) {
  return (
    <div className="w-64 border-r border-white/10 flex flex-col justify-between p-6 hidden md:flex bg-[#0a0c10]">
      <div>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Gamepad2 size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-wider">JoyMate</span>
        </div>

        <div className="text-xs text-gray-500 mb-4 uppercase tracking-widest">伙伴精选</div>
        <nav className="space-y-2">
          <NavItem
            icon={<Gamepad2 size={18} />}
            label="按心情推荐"
            count="Mood"
            active
            onClick={() => onPresetQuestion?.("我现在需要一款能让我放松、治愈、解压的游戏，给我 4 款推荐，并说明理由。")}
          />
          <NavItem
            icon={<Puzzle size={18} />}
            label="耐玩神作"
            count="Depth"
            onClick={() => onPresetQuestion?.("我想要耐玩、系统深、可反复玩很久的游戏，给我 4 款推荐（不要太大众）。")}
          />
          <NavItem
            icon={<Swords size={18} />}
            label="手感爽快"
            count="Action"
            onClick={() => onPresetQuestion?.("推荐几款手感爽快、打击感强、节奏紧凑的动作游戏，给我 4 款并说清楚差异。")}
          />
          <NavItem
            icon={<Users size={18} />}
            label="好友开黑"
            count="Co-op"
            onClick={() => onPresetQuestion?.("我想找 2-4 人一起玩的合作/联机游戏，偏轻松不劝退，给我 4 款推荐。")}
          />
          <NavItem
            icon={<Glasses size={18} />}
            label="剧情沉浸"
            count="Story"
            onClick={() => onPresetQuestion?.("推荐几款剧情沉浸、氛围强、让人停不下来的叙事向游戏，给我 4 款。")}
          />
          <NavItem
            icon={<Car size={18} />}
            label="轻松解压"
            count="Chill"
            onClick={() => onPresetQuestion?.("我只想轻松解压，不想动脑也不想紧张，推荐 4 款适合随时开玩的游戏。")}
          />
        </nav>
      </div>

      <div className="space-y-2">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-sm mb-2">
            <HelpCircle size={16} className="text-gray-400" />
            <span className="text-gray-300">调教你的 AI</span>
          </div>
          <p className="text-xs text-gray-500">提供更多游戏历史，让推荐系统更懂你的独特品味。</p>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, count, active, onClick }: { icon: React.ReactNode, label: string, count: string, active?: boolean, onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-xs opacity-50">{count}</span>
    </div>
  );
}
