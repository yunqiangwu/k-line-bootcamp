import React, { useState, useEffect, useRef } from 'react';
import { StockData, Trade, SimulationResult } from '../types';
import StockChart from './StockChart';
import { generateStockData } from '../services/mockDataService';
import { Play, Pause, TrendingUp, TrendingDown, FastForward } from 'lucide-react';

interface SimulationModeProps {
  onEnd: (result: SimulationResult) => void;
  onExit: () => void;
}

const SimulationMode: React.FC<SimulationModeProps> = ({ onEnd, onExit }) => {
  const [fullData, setFullData] = useState<StockData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(30); // Start with 30 days of history
  const [isPlaying, setIsPlaying] = useState(false);
  const [holdings, setHoldings] = useState(0); // Number of shares
  const [balance, setBalance] = useState(100000); // Initial cash
  const [trades, setTrades] = useState<Trade[]>([]);
  
  const speedRef = useRef(500); // ms per tick

  useEffect(() => {
    // Init Game
    const data = generateStockData(120); // 120 days total
    setFullData(data);
    setCurrentIndex(30);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentIndex < fullData.length - 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => prev + 1);
      }, speedRef.current);
    } else if (fullData.length > 0 && currentIndex >= fullData.length - 1) {
      setIsPlaying(false);
      handleFinish();
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, fullData]);

  const dummyData: StockData = { date: '', open: 0, close: 0, high: 0, low: 0, volume: 0 };
  const currentDataSlice = fullData.slice(0, currentIndex + 1);
  const currentDay = fullData[currentIndex] || dummyData;
  
  // Calculate P&L
  const marketValue = holdings * (currentDay.close || 0);
  const totalAssets = balance + marketValue;
  const initialCapital = 100000;
  const yieldRate = ((totalAssets - initialCapital) / initialCapital) * 100;
  const dailyChange = currentDay.close && fullData[currentIndex - 1] 
    ? ((currentDay.close - fullData[currentIndex - 1].close) / fullData[currentIndex - 1].close * 100) 
    : 0;

  const handleBuy = () => {
    if (balance < currentDay.close * 100) return; // Min 1 lot (100 shares)
    const maxAffordable = Math.floor(balance / currentDay.close);
    // Buy 50% of buying power for simplicity or all in
    const sharesToBuy = Math.floor(maxAffordable * 0.5) || 100; 
    
    setBalance(prev => prev - (sharesToBuy * currentDay.close));
    setHoldings(prev => prev + sharesToBuy);
    setTrades([...trades, { type: 'BUY', price: currentDay.close, date: currentDay.date, amount: sharesToBuy }]);
  };

  const handleSell = () => {
    if (holdings <= 0) return;
    setBalance(prev => prev + (holdings * currentDay.close));
    setTrades([...trades, { type: 'SELL', price: currentDay.close, date: currentDay.date, amount: holdings }]);
    setHoldings(0);
  };

  const handleFinish = () => {
    // Sell remaining at end
    const finalVal = balance + (holdings * (fullData[currentIndex]?.close || 0));
    const finalYield = ((finalVal - initialCapital) / initialCapital) * 100;
    
    onEnd({
      initialCapital,
      finalCapital: finalVal,
      yieldRate: finalYield,
      trades,
      stockName: "虚拟科技 (600XXX)",
      stockCode: "600XXX",
      data: fullData
    });
  };

  if (fullData.length === 0) return <div className="text-white p-10">Loading Market Data...</div>;

  return (
    <div className="flex flex-col h-full bg-finance-bg">
      {/* Header Info */}
      <div className="p-4 bg-finance-card border-b border-gray-800 flex justify-between items-center shadow-md z-10">
        <div>
          <h2 className="text-gray-400 text-xs">总资产</h2>
          <div className={`text-xl font-mono font-bold ${yieldRate >= 0 ? 'text-stock-up' : 'text-stock-down'}`}>
            {totalAssets.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-gray-400 text-xs">收益率</h2>
          <div className={`text-xl font-mono font-bold ${yieldRate >= 0 ? 'text-stock-up' : 'text-stock-down'}`}>
            {yieldRate > 0 ? '+' : ''}{yieldRate.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Sub Header - Stock Info */}
      <div className="px-4 py-2 bg-slate-900 flex justify-between text-xs font-mono border-b border-gray-800">
        <span className="text-white">虚拟科技 <span className="text-gray-500">600888</span></span>
        <span className={dailyChange >= 0 ? 'text-stock-up' : 'text-stock-down'}>
          现价: {currentDay.close?.toFixed(2)} ({dailyChange > 0 ? '+' : ''}{dailyChange.toFixed(2)}%)
        </span>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full relative">
        <StockChart data={currentDataSlice} trades={trades} />
        
        {/* Playback Controls Overlay */}
        <div className="absolute top-2 right-2 flex space-x-2">
           <button 
             onClick={() => setIsPlaying(!isPlaying)}
             className="bg-slate-700/80 p-2 rounded-full text-white hover:bg-slate-600 backdrop-blur-sm"
           >
             {isPlaying ? <Pause size={16} /> : <Play size={16} />}
           </button>
           <button 
             onClick={() => {
                 speedRef.current = speedRef.current === 500 ? 100 : 500;
             }}
             className="bg-slate-700/80 p-2 rounded-full text-white hover:bg-slate-600 backdrop-blur-sm"
           >
             <FastForward size={16} className={speedRef.current === 100 ? 'text-finance-accent' : ''}/>
           </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-finance-card p-4 pb-8 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={handleBuy}
            disabled={balance < currentDay.close * 100}
            className="flex flex-col items-center justify-center bg-stock-up/10 border border-stock-up/50 text-stock-up py-4 rounded-xl active:scale-95 transition-all disabled:opacity-50"
          >
            <TrendingUp size={24} className="mb-1" />
            <span className="font-bold">买入 / 做多</span>
          </button>

          <button 
            onClick={() => {
                if (!isPlaying) setCurrentIndex(prev => Math.min(prev + 1, fullData.length - 1));
            }}
            className="flex flex-col items-center justify-center bg-slate-700 text-white py-4 rounded-xl active:scale-95 transition-all"
          >
            <span className="text-sm text-gray-400 mb-1">{isPlaying ? '播放中...' : '下一根K线'}</span>
            <span className="font-bold text-xs">{currentDay.date?.slice(5)}</span>
          </button>

          <button 
            onClick={handleSell}
            disabled={holdings === 0}
            className="flex flex-col items-center justify-center bg-stock-down/10 border border-stock-down/50 text-stock-down py-4 rounded-xl active:scale-95 transition-all disabled:opacity-50"
          >
            <TrendingDown size={24} className="mb-1" />
            <span className="font-bold">卖出 / 平仓</span>
          </button>
        </div>
        
        <div className="mt-4 flex justify-between text-gray-500 text-xs px-2">
           <span>持仓: {holdings} 股</span>
           <span>可用: {balance.toFixed(0)}</span>
        </div>
        
        <button onClick={handleFinish} className="w-full mt-4 text-xs text-gray-600 underline">
            结束训练并结算
        </button>
      </div>
    </div>
  );
};

export default SimulationMode;