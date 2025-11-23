import React, { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { GameHistoryItem } from '../types';
import { getGameHistory, getMonthlyStats, clearHistory } from '../services/storageService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface HistoryScreenProps {
  onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [groupedHistory, setGroupedHistory] = useState<Record<string, GameHistoryItem[]>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setHistory(getGameHistory());
    setGroupedHistory(getMonthlyStats());
  };

  const handleClear = () => {
    if (confirm("确定要清空所有历史记录吗？")) {
        clearHistory();
        loadData();
    }
  };

  // Stats Calculation
  const totalGames = history.length;
  const totalProfit = history.reduce((acc, cur) => acc + cur.profit, 0);
  const winCount = history.filter(h => h.yieldRate > 0).length;
  const winRate = totalGames > 0 ? (winCount / totalGames) * 100 : 0;
  
  // Chart Data: Reverse to show oldest to newest
  const chartData = [...history].reverse().map((item, index) => ({
    name: index + 1,
    yield: item.yieldRate,
    date: item.timestamp
  }));

  if (totalGames === 0) {
    return (
        <div className="flex flex-col h-full bg-finance-bg text-white">
            <div className="p-4 flex items-center bg-finance-card border-b border-gray-800">
                <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white">
                <ArrowLeft size={24} />
                </button>
                <h1 className="flex-1 text-center font-bold text-lg">成长记录</h1>
                <div className="w-8" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <Calendar size={48} className="mb-4 opacity-50"/>
                <p>暂无交易记录</p>
                <p className="text-xs mt-2">快去进行模拟训练吧！</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-finance-bg text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center bg-finance-card border-b border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">成长记录</h1>
        <button onClick={handleClear} className="text-gray-600 hover:text-red-500">
            <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Overall Stats */}
        <div className="p-6 grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
                <div className="text-gray-500 text-[10px] mb-1">总场次</div>
                <div className="font-mono text-white font-bold text-lg">{totalGames}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
                <div className="text-gray-500 text-[10px] mb-1">胜率</div>
                <div className="font-mono text-finance-accent font-bold text-lg">{winRate.toFixed(0)}%</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
                <div className="text-gray-500 text-[10px] mb-1">总盈亏</div>
                <div className={`font-mono font-bold text-lg ${totalProfit >= 0 ? 'text-stock-up' : 'text-stock-down'}`}>
                    {(totalProfit / 10000).toFixed(1)}w
                </div>
            </div>
        </div>

        {/* Growth Chart */}
        <div className="px-6 mb-6">
            <h3 className="text-xs text-gray-400 mb-2 flex items-center">
                <TrendingUp size={12} className="mr-1" />
                收益率走势
            </h3>
            <div className="h-40 w-full bg-slate-900/50 rounded-xl border border-slate-800 p-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5}/>
                        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3"/>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: '12px' }}
                            formatter={(value: number) => [`${value.toFixed(2)}%`, '收益率']}
                            labelFormatter={() => ''}
                        />
                        <Area type="monotone" dataKey="yield" stroke="#f59e0b" fillOpacity={1} fill="url(#colorYield)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Monthly List */}
        <div className="px-6 pb-6">
            {Object.keys(groupedHistory).sort().reverse().map(month => (
                <div key={month} className="mb-6">
                    <h3 className="text-sm font-bold text-gray-400 mb-3 sticky top-0 bg-finance-bg py-2 z-10 border-b border-slate-800/50">
                        {month} <span className="text-xs font-normal opacity-50 ml-2">({groupedHistory[month].length} 局)</span>
                    </h3>
                    
                    <div className="space-y-3">
                        {groupedHistory[month].map(game => (
                            <div key={game.id} className="bg-finance-card p-4 rounded-xl border border-slate-700 flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-bold text-white">模拟交易</span>
                                        <span className="text-[10px] text-gray-500 bg-slate-800 px-1.5 py-0.5 rounded">
                                            {game.tradeCount}笔
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-1">
                                        {new Date(game.timestamp).toLocaleString('zh-CN', {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-mono font-bold ${game.yieldRate >= 0 ? 'text-stock-up' : 'text-stock-down'}`}>
                                        {game.yieldRate > 0 ? '+' : ''}{game.yieldRate.toFixed(2)}%
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                        {game.profit > 0 ? '+' : ''}{game.profit.toFixed(0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;