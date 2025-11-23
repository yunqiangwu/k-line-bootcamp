
import React, { useState, useEffect, useRef } from 'react';
import { StockData, Trade, SimulationResult } from '../types';
import StockChart from './StockChart';
import { fetchGameData } from '../services/mockDataService';
import { Play, Pause, TrendingUp, TrendingDown, FastForward, X, Loader2 } from 'lucide-react';
import { audioService } from '../services/audioService';

interface SimulationModeProps {
  onEnd: (result: SimulationResult) => void;
  onExit: () => void;
}

const SimulationMode: React.FC<SimulationModeProps> = ({ onEnd, onExit }) => {
  const [fullData, setFullData] = useState<StockData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [holdings, setHoldings] = useState(0); // Number of shares
  const [balance, setBalance] = useState(100000); // Initial cash
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockInfo, setStockInfo] = useState({ name: '', code: '' });
  
  const speedRef = useRef(500); // ms per tick

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        const { data, name, code } = await fetchGameData();
        setFullData(data);
        setStockInfo({ name, code });
        // We typically want 60 days of history before the game starts for indicators
        // If we got 90 days, start at 60. If less, adjust accordingly.
        const startIdx = Math.max(0, data.length - 30);
        setCurrentIndex(startIdx);
        setLoading(false);
    };
    init();
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
  const daysLeft = Math.max(0, fullData.length - 1 - currentIndex);
  
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
    
    audioService.playBuy(); // SFX

    const maxAffordable = Math.floor(balance / currentDay.close);
    // Buy 50% of buying power for simplicity or all in
    const sharesToBuy = Math.floor(maxAffordable * 0.5) || 100; 
    
    setBalance(prev => prev - (sharesToBuy * currentDay.close));
    setHoldings(prev => prev + sharesToBuy);
    setTrades([...trades, { type: 'BUY', price: currentDay.close, date: currentDay.date, amount: sharesToBuy }]);
  };

  const handleSell = () => {
    if (holdings <= 0) return;
    
    audioService.playSell(); // SFX
    
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
      stockName: stockInfo.name,
      stockCode: stockInfo.code,
      data: fullData
    });
  };

  const handleQuit = () => {
    audioService.playClick();
    onExit();
  };

  const togglePlay = () => {
    audioService.playClick();
    setIsPlaying(!isPlaying);
  };

  const handleManualNext = () => {
    if (!isPlaying) {
        audioService.playClick();
        setCurrentIndex(prev => Math.min(prev + 1, fullData.length - 1));
    }
  };

  if (loading) {
      return (
        <div className="flex flex-col h-full items-center justify-center bg-finance-bg text-white space-y-4">
            <Loader2 size={48} className="animate-spin text-finance-accent" />
            <div className="text-center">
                <p className="text-lg font-bold">加载真实行情中...</p>
                <p className="text-xs text-gray-500">Initializing Market Data</p>
            </div>
        </div>
      );
  }

  if (fullData.length === 0) return <div className="text-white p-10">Data Load Error</div>;

  return (
    <div className="flex flex-col h-full bg-finance-bg">
      {/* Header Info */}
      <div className="p-3 bg-finance-card border-b border-gray-800 flex items-center shadow-md z-10">
        <button 
            onClick={handleQuit} 
            className="p-2 -ml-2 mr-2 text-gray-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            title="退出训练"
        >
            <X size={20} />
        </button>

        <div className="flex-1 flex justify-between items-center">
            <div>
            <h2 className="text-gray-500 text-[10px] uppercase tracking-wider">总资产</h2>
            <div className={`text-lg font-mono font-bold ${yieldRate >= 0 ? 'text-stock-up' : 'text-stock-down'}`}>
                {totalAssets.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 })}
            </div>
            </div>
            <div className="text-right">
            <h2 className="text-gray-500 text-[10px] uppercase tracking-wider">收益率</h2>
            <div className={`text-lg font-mono font-bold ${yieldRate >= 0 ? 'text-stock-up' : 'text-stock-down'}`}>
                {yieldRate > 0 ? '+' : ''}{yieldRate.toFixed(2)}%
            </div>
            </div>
        </div>
      </div>

      {/* Sub Header - Stock Info */}
      <div className="px-4 py-2 bg-slate-900 flex justify-between text-xs font-mono border-b border-gray-800">
        <span className="text-white">{stockInfo.name} <span className="text-gray-500">{stockInfo.code}</span></span>
        <div className="flex space-x-4">
             <span className={dailyChange >= 0 ? 'text-stock-up' : 'text-stock-down'}>
              现价: {currentDay.close?.toFixed(2)} ({dailyChange > 0 ? '+' : ''}{dailyChange.toFixed(2)}%)
            </span>
            <span className="text-finance-accent">剩余: {daysLeft}天</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full relative min-h-0 flex flex-col">
        <StockChart data={currentDataSlice} trades={trades} />
        
        {/* Playback Controls Overlay */}
        <div className="absolute top-2 right-12 flex space-x-2 z-20">
           <button 
             onClick={togglePlay}
             className="bg-slate-700/80 p-2 rounded-full text-white hover:bg-slate-600 backdrop-blur-sm shadow-lg border border-slate-600"
           >
             {isPlaying ? <Pause size={16} /> : <Play size={16} />}
           </button>
           <button 
             onClick={() => {
                 audioService.playClick();
                 speedRef.current = speedRef.current === 500 ? 100 : 500;
             }}
             className="bg-slate-700/80 p-2 rounded-full text-white hover:bg-slate-600 backdrop-blur-sm shadow-lg border border-slate-600"
           >
             <FastForward size={16} className={speedRef.current === 100 ? 'text-finance-accent' : ''}/>
           </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-finance-card p-4 pb-8 border-t border-gray-800 shrink-0">
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
            onClick={handleManualNext}
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
