
import React, { useRef, useState, useEffect } from 'react';
import { SimulationResult } from '../types';
import StockChart from './StockChart';
import { Share2, RefreshCw, Home, Trophy, Skull, Zap, TrendingUp, Activity, AlertCircle, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { audioService } from '../services/audioService';

interface ResultScreenProps {
  result: SimulationResult;
  onHome: () => void;
  onReplay: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ result, onHome, onReplay }) => {
  const { yieldRate, initialCapital, finalCapital, trades, stockName, data } = result;
  const isWin = yieldRate > 0;
  const profitLoss = finalCapital - initialCapital;
  const shareRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (yieldRate > 0) {
        audioService.playWin();
    } else {
        audioService.playLoss();
    }
  }, [yieldRate]);

  // Determine Rank based on Yield Rate
  const getRank = (rate: number) => {
    if (rate >= 30) return { 
        title: '股神降临', 
        desc: '你的交易直觉令人战栗，主力都要避让三分！', 
        icon: Trophy, 
        color: 'text-amber-400', 
        bg: 'bg-amber-400/10', 
        border: 'border-amber-400/50',
        shareBg: 'bg-gradient-to-br from-amber-900 to-black'
    };
    if (rate >= 15) return { 
        title: '超级游资', 
        desc: '精准出击，收割果断，市场是你的提款机。', 
        icon: Zap, 
        color: 'text-purple-400', 
        bg: 'bg-purple-400/10', 
        border: 'border-purple-400/50',
        shareBg: 'bg-gradient-to-br from-purple-900 to-black'
    };
    if (rate > 0) return { 
        title: '稳健赢家', 
        desc: '积小胜为大胜，复利的力量在你手中觉醒。', 
        icon: TrendingUp, 
        color: 'text-stock-up', 
        bg: 'bg-stock-up/10', 
        border: 'border-stock-up/50',
        shareBg: 'bg-gradient-to-br from-red-900 to-black'
    };
    if (rate === 0) return { 
        title: '保本大师', 
        desc: '在凶险的市场中全身而退，本身就是一种胜利。', 
        icon: Activity, 
        color: 'text-blue-400', 
        bg: 'bg-blue-400/10', 
        border: 'border-blue-400/50',
        shareBg: 'bg-gradient-to-br from-blue-900 to-black'
    };
    if (rate > -10) return { 
        title: '韭菜初现', 
        desc: '市场给你上了一课，好在学费不算太贵。', 
        icon: AlertCircle, 
        color: 'text-stock-down', 
        bg: 'bg-stock-down/10', 
        border: 'border-stock-down/50',
        shareBg: 'bg-gradient-to-br from-green-900 to-black'
    };
    return { 
        title: '慈善赌王', 
        desc: '感谢你为股市流动性做出的卓越贡献。', 
        icon: Skull, 
        color: 'text-gray-400', 
        bg: 'bg-gray-400/10', 
        border: 'border-gray-400/50',
        shareBg: 'bg-gradient-to-br from-gray-800 to-black'
    };
  };

  const rank = getRank(yieldRate);
  const RankIcon = rank.icon;

  const handleShare = async () => {
    if (!shareRef.current) return;
    
    audioService.playClick();
    setIsSharing(true);

    try {
      // 1. Generate QR Code
      const currentUrl = window.location.toString();
      const qrUrl = await QRCode.toDataURL(currentUrl, { margin: 2, width: 100, color: { dark: '#000000', light: '#ffffff' } });
      
      // Insert QR code into the hidden share div
      const qrImg = document.getElementById('share-qr-img') as HTMLImageElement;
      if (qrImg) qrImg.src = qrUrl;

      // Wait a tick for image to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // 2. Capture Image
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: '#0f172a', // Ensure background is captured
        scale: 2, // High res
        useCORS: true,
      });

      // 3. Download
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `k-line-result-${Date.now()}.png`;
      link.click();

    } catch (error) {
      console.error("Share failed:", error);
      alert("生成图片失败，请重试");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-finance-bg overflow-y-auto animate-in fade-in duration-500 relative">
      
      {/* --- HIDDEN SHARE TEMPLATE (Rendered off-screen) --- */}
      <div 
        ref={shareRef}
        className={`fixed top-0 left-0 w-[375px] bg-finance-bg text-white p-6 flex flex-col items-center z-[-10] pointer-events-none`}
        style={{ transform: 'translateX(-9999px)' }} // Hide it but keep it renderable
      >
        {/* Share Header */}
        <div className="w-full flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-finance-accent rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-black" />
                </div>
                <span className="font-bold tracking-wide text-lg">K-Line Bootcamp</span>
            </div>
            <span className="text-xs text-gray-400 font-mono">BATTLE REPORT</span>
        </div>

        {/* Rank Visual */}
        <div className={`w-full aspect-square rounded-2xl ${rank.shareBg} flex flex-col items-center justify-center p-6 mb-6 relative overflow-hidden border border-white/10`}>
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}></div>
             <RankIcon size={80} className="text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
             <h2 className="text-3xl font-black text-white mb-2 tracking-wider">{rank.title}</h2>
             <p className="text-white/80 text-center text-sm px-4">{rank.desc}</p>
        </div>

        {/* Big Stats */}
        <div className="w-full mb-8">
             <div className="text-center mb-6">
                <div className="text-sm text-gray-400 mb-1 uppercase tracking-widest">Yield Rate</div>
                <div className={`text-6xl font-black font-mono ${yieldRate >= 0 ? 'text-stock-up' : 'text-stock-down'}`}>
                    {yieldRate > 0 ? '+' : ''}{yieldRate.toFixed(2)}%
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-slate-800 p-4 rounded-xl text-center">
                    <div className="text-gray-400 text-xs mb-1">Final Assets</div>
                    <div className="font-mono font-bold text-xl">{finalCapital.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl text-center">
                    <div className="text-gray-400 text-xs mb-1">Trades</div>
                    <div className="font-mono font-bold text-xl">{trades.length}</div>
                </div>
             </div>
        </div>

        {/* Footer with QR */}
        <div className="w-full bg-white text-black rounded-xl p-4 flex items-center justify-between">
            <div>
                <div className="font-bold text-lg">挑战我的战绩</div>
                <div className="text-xs text-gray-600">Scan code to play</div>
            </div>
            {/* QR Image Placeholder */}
            <img id="share-qr-img" alt="QR" className="w-16 h-16" />
        </div>
      </div>
      {/* --- END HIDDEN TEMPLATE --- */}


      {/* Header Section */}
      <div className="pt-8 pb-6 px-6 text-center shrink-0 bg-gradient-to-b from-slate-900 to-finance-bg border-b border-slate-800">
        <h2 className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-4">本次交易战绩</h2>
        
        {/* Main Score */}
        <div className={`text-6xl font-black mb-2 font-mono tracking-tighter drop-shadow-2xl ${yieldRate >= 0 ? 'text-stock-up' : 'text-stock-down'}`}>
          {yieldRate > 0 ? '+' : ''}{yieldRate.toFixed(2)}%
        </div>
        
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold border ${yieldRate >= 0 ? 'bg-stock-up/10 border-stock-up/30 text-stock-up' : 'bg-stock-down/10 border-stock-down/30 text-stock-down'}`}>
           <span>{yieldRate >= 0 ? 'PROFIT' : 'LOSS'}</span>
           <span className="opacity-50">|</span>
           <span>{Math.abs(profitLoss).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        
        {/* Rank Card */}
        <div className={`relative p-5 rounded-2xl border ${rank.border} ${rank.bg} flex flex-col items-center text-center overflow-hidden`}>
            <div className={`absolute -right-4 -top-4 opacity-10 ${rank.color}`}>
                <RankIcon size={100} />
            </div>
            
            <div className={`p-3 rounded-full mb-3 border-2 ${rank.border} bg-finance-bg z-10`}>
                <RankIcon size={32} className={rank.color} />
            </div>
            
            <h3 className={`text-2xl font-bold mb-2 ${rank.color} z-10`}>{rank.title}</h3>
            <p className="text-sm text-gray-300 leading-relaxed z-10 opacity-90">
                "{rank.desc}"
            </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <div className="text-gray-500 text-xs mb-1">初始资金</div>
                <div className="font-mono text-gray-300 font-bold">{initialCapital.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <div className="text-gray-500 text-xs mb-1">最终资产</div>
                <div className="font-mono text-white font-bold">{finalCapital.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <div className="text-gray-500 text-xs mb-1">交易次数</div>
                <div className="font-mono text-white font-bold">{trades.length} <span className="text-xs font-normal text-gray-500">笔</span></div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <div className="text-gray-500 text-xs mb-1">个股名称</div>
                <div className="font-mono text-white font-bold text-sm truncate">{stockName}</div>
            </div>
        </div>

        {/* Replay Chart Preview */}
        <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-500 px-1">
                <span>盘面复盘</span>
                <span>30日走势</span>
            </div>
            <div className="h-48 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden shadow-inner relative">
                <div className="absolute inset-0 opacity-80 pointer-events-none">
                     <StockChart data={data} trades={trades} />
                </div>
                {/* Overlay to indicate it's just a preview */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
            <button 
                onClick={() => {
                    audioService.playClick();
                    onReplay();
                }} 
                className="w-full bg-finance-accent text-black font-bold py-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all hover:bg-amber-400"
            >
                <RefreshCw size={20} />
                <span>再来一局</span>
            </button>
            
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handleShare}
                    disabled={isSharing}
                    className="bg-slate-800 border border-slate-700 text-gray-300 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all hover:bg-slate-700 disabled:opacity-50"
                >
                    {isSharing ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Share2 size={18} />}
                    <span>{isSharing ? '生成中...' : '保存战绩'}</span>
                </button>
                <button 
                    onClick={() => {
                        audioService.playClick();
                        onHome();
                    }} 
                    className="bg-slate-800 border border-slate-700 text-gray-300 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all hover:bg-slate-700"
                >
                    <Home size={18} />
                    <span>返回首页</span>
                </button>
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default ResultScreen;
