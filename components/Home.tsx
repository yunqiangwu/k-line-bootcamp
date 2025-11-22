import React, { useEffect, useState } from 'react';
import { GameState } from '../types';
import { TrendingUp, Award, Zap, BookOpen, Users, Lock } from 'lucide-react';
import { generateDailyTip } from '../services/geminiService';

interface HomeProps {
  setGameState: (state: GameState) => void;
}

const Home: React.FC<HomeProps> = ({ setGameState }) => {
  const [tip, setTip] = useState<string>("加载今日交易锦囊...");

  useEffect(() => {
    generateDailyTip().then(setTip);
  }, []);

  return (
    <div className="flex flex-col h-full bg-finance-bg text-white p-6 overflow-y-auto">
      <header className="mb-8 mt-4 flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-finance-accent to-yellow-200 italic">
             K线训练营
           </h1>
           <p className="text-gray-500 text-xs mt-1">BOOTCAMP FOR TRADERS</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
           <Users size={20} className="text-gray-400"/>
        </div>
      </header>

      {/* Daily Tip Card */}
      <div className="mb-8 bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex items-start space-x-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
                <Zap size={20} className="text-blue-400" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-blue-200 mb-1">今日锦囊</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                    {tip}
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Simulation Mode */}
        <button 
            onClick={() => setGameState(GameState.SIMULATION)}
            className="group relative h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 shadow-2xl shadow-indigo-900/20 active:scale-[0.98] transition-all"
        >
            <div className="absolute inset-0 bg-[url('https://picsum.photos/400/200')] opacity-20 bg-cover bg-center group-hover:scale-105 transition-transform duration-500 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-left">
                <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="text-finance-accent" />
                    <span className="text-finance-accent text-xs font-bold tracking-wider">CORE TRAINING</span>
                </div>
                <h2 className="text-2xl font-bold">K线模拟训练</h2>
                <p className="text-gray-400 text-sm mt-1">实盘回放 · 快速复盘</p>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <div className="w-12 h-12 rounded-full bg-finance-accent text-black flex items-center justify-center font-bold shadow-lg shadow-amber-500/50 group-hover:bg-white transition-colors">
                    GO
                </div>
            </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
             {/* Quiz Mode */}
            <button 
                onClick={() => setGameState(GameState.QUIZ)}
                className="relative h-48 rounded-3xl bg-slate-800 border border-slate-700 p-5 flex flex-col justify-between hover:bg-slate-750 active:scale-[0.98] transition-all"
            >
                <div className="bg-purple-500/20 w-10 h-10 rounded-xl flex items-center justify-center">
                    <Award className="text-purple-400" size={24} />
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-bold">知识闯关</h3>
                    <p className="text-xs text-gray-500 mt-1">解锁图鉴</p>
                    <div className="mt-3 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 w-1/3 h-full"></div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 text-right">3/10</p>
                </div>
            </button>

            {/* Indicator Training (Placeholder) */}
            <button 
                className="relative h-48 rounded-3xl bg-slate-800 border border-slate-700 p-5 flex flex-col justify-between hover:bg-slate-750 active:scale-[0.98] transition-all"
            >
                <div className="bg-emerald-500/20 w-10 h-10 rounded-xl flex items-center justify-center">
                    <BookOpen className="text-emerald-400" size={24} />
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-bold">指标百科</h3>
                    <p className="text-xs text-gray-500 mt-1">MACD / KDJ</p>
                    <div className="mt-3 flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-600 border border-slate-800"></div>
                        <div className="w-6 h-6 rounded-full bg-slate-500 border border-slate-800"></div>
                    </div>
                </div>
                <div className="absolute top-5 right-5">
                    <Lock size={16} className="text-gray-600" />
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Home;