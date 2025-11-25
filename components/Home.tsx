
import React, { useEffect, useState } from 'react';
import { GameState } from '../types';
import { TrendingUp, Award, BookOpen, PieChart, PlayCircle, Zap, Activity, Volume2, VolumeX, Coffee } from 'lucide-react';
import { getGameHistory } from '../services/storageService';
import { audioService } from '../services/audioService';

interface HomeProps {
  setGameState: (state: GameState) => void;
}

const Home: React.FC<HomeProps> = ({ setGameState }) => {
  const [stats, setStats] = useState({ monthlyWinRate: 0, totalProfit: 0, hasData: false });
  const [isMuted, setIsMuted] = useState(audioService.getMuteState());

  useEffect(() => {
    const history = getGameHistory();
    if (history.length > 0) {
        // 1. Total Profit
        const totalProfit = history.reduce((acc, item) => acc + item.profit, 0);

        // 2. Monthly Win Rate
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const monthlyGames = history.filter(item => item.timestamp.startsWith(currentMonthStr));
        let winRate = 0;
        
        if (monthlyGames.length > 0) {
            const wins = monthlyGames.filter(item => item.yieldRate > 0).length;
            winRate = Math.round((wins / monthlyGames.length) * 100);
        }

        setStats({
            monthlyWinRate: winRate,
            totalProfit: totalProfit,
            hasData: true
        });
    }
  }, []);

  const handleNav = (state: GameState) => {
    audioService.playClick();
    setGameState(state);
  };

  const toggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    if (!muted) audioService.playClick();
  };

  return (
    <div className="flex flex-col h-full bg-finance-bg text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center z-10">
        <div>
           <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-finance-accent rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
               <TrendingUp size={20} className="text-black" />
             </div>
             <h1 className="text-xl font-black tracking-tight">欢心K线训练营</h1>
           </div>
           <p className="text-gray-500 text-[10px] mt-1 font-mono tracking-wider ml-1">ALPHA TRADER SIMULATION</p>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={toggleMute}
                className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all backdrop-blur-md"
            >
                {isMuted ? <VolumeX size={20} className="text-gray-400"/> : <Volume2 size={20} className="text-finance-accent"/>}
            </button>
            <button 
            onClick={() => handleNav(GameState.HISTORY)}
            className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all backdrop-blur-md"
            >
            <PieChart size={20} className="text-gray-300 hover:text-finance-accent transition-colors"/>
            </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-8 z-10 flex flex-col gap-6">
        
        {/* Main Hero Card */}
        <div className="relative group mt-4">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-finance-accent to-purple-600 rounded-[2.2rem] opacity-50 blur group-hover:opacity-80 transition duration-500"></div>
            <button 
                onClick={() => handleNav(GameState.SIMULATION)}
                className="relative w-full h-64 rounded-[2rem] bg-slate-900 p-6 flex flex-col justify-between overflow-hidden active:scale-[0.99] transition-transform border border-slate-800 shadow-2xl"
            >
                {/* Decoration */}
                <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay mask-image-gradient"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
                
                {/* Top Badge */}
                <div className="w-full flex justify-end z-10">
                    <span className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-1.5 shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        LIVE MARKET
                    </span>
                </div>

                {/* Center Content */}
                <div className="z-10 text-left mt-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-finance-accent to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20 border border-white/10">
                        <PlayCircle className="text-white" size={32} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <h2 className="text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">
                        实战演练
                    </h2>
                    <span className="text-lg text-gray-400 font-medium block mt-1">Simulation Mode</span>
                </div>
                
                {/* Footer Info */}
                <div className="flex items-center justify-between z-10 mt-auto pt-4 border-t border-white/5 w-full">
                     <div className="flex flex-col text-left">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Starting Cap</span>
                        <span className="font-mono font-bold text-xl text-finance-accent">¥100,000</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-lg">T+0 训练</span>
                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                            <Activity size={20} />
                        </div>
                     </div>
                </div>
            </button>
        </div>

        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-1">Training Modules</h3>

        <div className="grid grid-cols-2 gap-4">
             {/* Quiz Mode */}
            <button 
                onClick={() => handleNav(GameState.QUIZ)}
                className="relative h-48 rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5 flex flex-col justify-between hover:bg-slate-800 hover:border-purple-500/50 active:scale-[0.98] transition-all backdrop-blur-sm group shadow-lg"
            >
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Award size={60} />
                </div>
                <div className="bg-purple-500/20 w-12 h-12 rounded-2xl flex items-center justify-center border border-purple-500/20">
                    <Zap className="text-purple-400" size={24} fill="currentColor" fillOpacity={0.3} />
                </div>
                <div className="text-left z-10">
                    <h3 className="text-lg font-bold text-white">知识闯关</h3>
                    <p className="text-xs text-gray-400 mt-1">Daily Challenge</p>
                </div>
                <div className="flex items-center text-[10px] text-purple-400 font-bold">
                    <span>START NOW</span>
                    <div className="w-4 h-4 ml-1 rounded-full border border-purple-500/30 flex items-center justify-center">
                        <span className="block w-1 h-1 bg-purple-500 rounded-full"></span>
                    </div>
                </div>
            </button>

             {/* Story Mode (New) */}
             <button 
                onClick={() => handleNav(GameState.STORY)}
                className="relative h-48 rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5 flex flex-col justify-between hover:bg-slate-800 hover:border-blue-500/50 active:scale-[0.98] transition-all backdrop-blur-sm group shadow-lg"
            >
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Coffee size={60} />
                </div>
                <div className="bg-blue-500/20 w-12 h-12 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <Coffee className="text-blue-400" size={24} />
                </div>
                <div className="text-left z-10">
                    <h3 className="text-lg font-bold text-white">交易人生</h3>
                    <p className="text-xs text-gray-400 mt-1">Trader's Journey</p>
                </div>
                <div className="flex items-center text-[10px] text-blue-400 font-bold">
                    <span>PLAY STORY</span>
                    <div className="w-4 h-4 ml-1 rounded-full border border-blue-500/30 flex items-center justify-center">
                         <span className="block w-1 h-1 bg-blue-500 rounded-full"></span>
                    </div>
                </div>
            </button>

            {/* Indicator Encyclopedia */}
            <button 
                onClick={() => handleNav(GameState.INDICATOR)}
                className="relative h-40 rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5 flex flex-col justify-between hover:bg-slate-800 hover:border-emerald-500/50 active:scale-[0.98] transition-all backdrop-blur-sm group shadow-lg col-span-2"
            >
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookOpen size={60} />
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/20 w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <BookOpen className="text-emerald-400" size={24} />
                    </div>
                    <div className="text-left z-10">
                        <h3 className="text-lg font-bold text-white">指标百科</h3>
                        <p className="text-xs text-gray-400 mt-1">Wiki & Guides</p>
                    </div>
                </div>
                
                <div className="flex items-center text-[10px] text-emerald-400 font-bold mt-2">
                    <span>READ MORE</span>
                    <div className="w-4 h-4 ml-1 rounded-full border border-emerald-500/30 flex items-center justify-center">
                         <span className="block w-1 h-1 bg-emerald-500 rounded-full"></span>
                    </div>
                </div>
            </button>
        </div>

        {/* Footer Stats preview */}
        <div className="mt-2 p-4 rounded-2xl bg-slate-900/50 border border-white/5 flex justify-between items-center backdrop-blur-md">
            <div className="text-xs text-gray-500">
                <p>本月胜率</p>
                <p className={`text-sm font-bold mt-1 tracking-wide ${stats.hasData ? 'text-white' : 'text-gray-600'}`}>
                    {stats.hasData ? `${stats.monthlyWinRate}%` : '--%'}
                </p>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="text-xs text-gray-500 text-right">
                <p>总盈利</p>
                <p className={`text-sm font-bold mt-1 tracking-wide ${stats.totalProfit >= 0 ? 'text-finance-accent' : 'text-stock-down'}`}>
                     {stats.hasData ? stats.totalProfit.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }) : '¥0'}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
