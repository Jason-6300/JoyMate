import { Gamepad2, Swords, Car, Glasses, Users, Puzzle, HelpCircle } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 border-r border-white/10 flex flex-col justify-between p-6 hidden md:flex bg-[#0a0c10]">
      <div>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Gamepad2 size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-wider">GAMEAI</span>
        </div>

        <div className="text-xs text-gray-500 mb-4 uppercase tracking-widest">核心分类</div>
        <nav className="space-y-2">
          <NavItem icon={<Swords size={18} />} label="动作冒险" count="1,280" active />
          <NavItem icon={<Puzzle size={18} />} label="策略战棋" count="856" />
          <NavItem icon={<Car size={18} />} label="竞速体育" count="642" />
          <NavItem icon={<Glasses size={18} />} label="VR 体验" count="324" />
          <NavItem icon={<Users size={18} />} label="多人联机" count="967" />
          <NavItem icon={<Gamepad2 size={18} />} label="休闲益智" count="1,534" />
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

function NavItem({ icon, label, count, active }: { icon: React.ReactNode, label: string, count: string, active?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-xs opacity-50">{count}</span>
    </div>
  );
}
