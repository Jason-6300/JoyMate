import React, { useState } from 'react';
import { X, Image as ImageIcon, Loader2, Download } from 'lucide-react';
import { generateGameArt } from '../services/gemini';

export default function ImageGeneratorModal({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateGameArt(prompt, size);
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#151820] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-purple-400" size={20} />
            <h2 className="font-bold text-lg text-white">Nano Banana Pro 概念图生成</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">画面描述 (Prompt)</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：一个赛博朋克风格的农场模拟游戏，霓虹灯下的麦田，高分辨率..."
                className="w-full h-24 bg-[#0a0c10] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">分辨率 (Size)</label>
              <div className="flex gap-3">
                {(["1K", "2K", "4K"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${size === s ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-[#0a0c10] border-white/10 text-gray-400 hover:border-white/30'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
              {isGenerating ? '生成中...' : '生成概念图'}
            </button>
            
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                {error}
              </div>
            )}
          </div>

          {/* Result Area */}
          <div className="bg-[#0a0c10] rounded-xl border border-white/5 aspect-video flex items-center justify-center overflow-hidden relative">
            {imageUrl ? (
              <>
                <img src={imageUrl} alt="Generated Art" className="w-full h-full object-contain" />
                <a 
                  href={imageUrl} 
                  download="game-concept-art.png"
                  className="absolute bottom-4 right-4 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-lg border border-white/10 transition-colors"
                >
                  <Download size={18} />
                </a>
              </>
            ) : (
              <div className="text-gray-600 flex flex-col items-center gap-2">
                <ImageIcon size={32} className="opacity-50" />
                <span className="text-sm">生成的图片将显示在这里</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
