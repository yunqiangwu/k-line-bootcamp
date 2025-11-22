import React, { useEffect, useState } from 'react';
import { SimulationResult } from '../types';
import { analyzeTradingPerformance } from '../services/geminiService';
import StockChart from './StockChart';
import { Share2, RefreshCw, Home } from 'lucide-react';

interface ResultScreenProps {
  result: SimulationResult;
  onHome: () => void;
  onReplay: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ result, onHome, onReplay }) => {
  const [aiComment, setAiComment] = useState("AI 教练正在分析你的操作...");
  const isWin = result.yieldRate > 0;

  useEffect(() => {
    // Trigger AI analysis
    analyzeTradingPerformance(result.stockName, result.trades, result.yieldRate, result.data)
      .then(setAiComment);
  }, [result]);

  return (
    <div className="flex flex-col h-full bg-finance-bg overflow-y-auto">
      <div className="p-6 text-center">
        <h2 className="text-gray-400 text-sm tracking-widest uppercase mb-2">本次收益</h2>
        <div className={`text-5xl font-bold mb-2 font-mono ${isWin ? 'text-stock-up' : 'text-stock-down'}`}>
          {isWin ? '+' : ''}{result.yieldRate.toFixed(2)}%
        </div>
        <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${isWin ? 'bg-stock-up/20 text-stock-up' : 'bg-stock-down/20 text-stock-down'}`}>
          {isWin ? 'WIN · 盈利' : 'LOSS · 亏损'}
        </div>
      </div>

      {/* AI Feedback Card */}
      <div className="mx-4 mb-6 p-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-finance-card rounded-xl p-4 h-full">
            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 font-bold mb-2 flex items-center">
                ✨ AI 交易教练点评
            </h3>
            <p className="text-gray-200 text-sm leading-relaxed italic">
                "{aiComment}"
            </p>
        </div>
      </div>

      {/* Replay Chart */}
      <div className="flex-1 min-h-[250px] bg-slate-900/50 border-y border-gray-800 relative mb-4">
        <div className="absolute top-2 left-4 text-xs text-gray-500 z-10">复盘: {result.stockName}</div>
        <StockChart data={result.data} trades={result.trades} />
      </div>

      {/* Actions */}
      <div className="p-4 grid grid-cols-2 gap-4 pb-8">
         <button className="col-span-2 bg-finance-accent text-black font-bold py-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform">
            <Share2 size={20} />
            <span>炫耀一下</span>
         </button>
         
         <button onClick={onReplay} className="bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-600 active:scale-95 transition-transform">
            <RefreshCw size={20} />
            <span>再来一局</span>
         </button>
         
         <button onClick={onHome} className="bg-transparent border border-gray-700 text-gray-400 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-800 active:scale-95 transition-transform">
            <Home size={20} />
            <span>返回首页</span>
         </button>
      </div>
    </div>
  );
};

export default ResultScreen;