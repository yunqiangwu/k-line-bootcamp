
import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, StoryEvent, StoryChoice } from '../types';
import { INITIAL_STATS, START_EVENT, getNextEvent } from '../services/storyService';
import { audioService } from '../services/audioService';
import { Heart, DollarSign, Brain, Crown, Clock, ArrowRight, X, Share2, TrendingUp, Skull, Trophy, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

interface LogEntry {
  text: string;
  type: 'narrative' | 'choice' | 'effect';
}

interface StoryModeProps {
  onBack: () => void;
}

const StoryMode: React.FC<StoryModeProps> = ({ onBack }) => {
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [currentEvent, setCurrentEvent] = useState<StoryEvent>(START_EVENT);
  const [logs, setLogs] = useState<LogEntry[]>([{ text: START_EVENT.text, type: 'narrative' }]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleChoice = (choice: StoryChoice) => {
    audioService.playClick();
    
    // 1. Apply Effects
    let newStats = { ...stats };
    
    // Apply cost
    if (choice.cost) newStats.cash -= choice.cost;
    
    // Apply effect function
    const changes = choice.effect(newStats);
    
    // Merge changes
    newStats = { 
        ...newStats, 
        ...changes,
        // Clamp values
        health: Math.min(100, Math.max(0, (newStats.health + (changes.health || 0)))),
        insight: Math.min(100, (newStats.insight + (changes.insight || 0))),
        reputation: Math.min(100, (newStats.reputation + (changes.reputation || 0))),
        turn: newStats.turn + 1 // Advance time
    };

    // Calculate actual delta for feedback
    const cashDelta = newStats.cash - stats.cash;
    if (cashDelta > 0) audioService.playBuy();
    if (cashDelta < 0) audioService.playSell(); 
    if (newStats.health < stats.health) audioService.playWrong(); 

    // 2. Update Logs
    const newLogs: LogEntry[] = [
        ...logs,
        { text: `> ${choice.text}`, type: 'choice' },
        { text: choice.logText, type: 'effect' }
    ];

    if (cashDelta !== 0) {
        newLogs.push({ text: `资金 ${cashDelta > 0 ? '+' : ''}${cashDelta.toFixed(0)}`, type: 'effect' });
    }

    setStats(newStats);

    // 3. Get Next Event
    const nextEvt = getNextEvent(newStats);
    setCurrentEvent(nextEvt);
    
    // Add next event text to log
    newLogs.push({ text: `[第 ${newStats.turn} 月]`, type: 'narrative' });
    newLogs.push({ text: nextEvt.text, type: 'narrative' });
    
    setLogs(newLogs);

    if (nextEvt.isEnding) {
        setIsGameOver(true);
        if (newStats.cash > INITIAL_STATS.cash) audioService.playWin();
        else audioService.playLoss();
    }
  };

  const getHealthColor = (h: number) => {
      if (h > 70) return 'text-green-500';
      if (h > 30) return 'text-yellow-500';
      return 'text-red-500';
  };

  // --- SHARE LOGIC ---
  const getOutcomeTitle = () => {
    if (stats.cash <= 0) return { title: '破产游民', icon: Skull, color: 'text-gray-500', desc: '股市有风险，入市需谨慎。' };
    if (stats.health <= 0) return { title: 'ICU 贵宾', icon: Heart, color: 'text-red-500', desc: '钱没花完，人先没了。' };
    
    const profit = stats.cash - INITIAL_STATS.cash;
    if (profit > 100000) return { title: '传奇游资', icon: Crown, color: 'text-purple-400', desc: '你的名字将成为市场的传说。' };
    if (profit > 50000) return { title: '交易大师', icon: Trophy, color: 'text-amber-400', desc: '稳定盈利是你的代名词。' };
    if (profit > 0) return { title: '幸存者', icon: TrendingUp, color: 'text-green-400', desc: '在残酷的市场中活了下来。' };
    return { title: '韭菜', icon: AlertTriangle, color: 'text-green-600', desc: '被市场狠狠地上了一课。' };
  };

  const handleShare = async () => {
    if (!shareRef.current) return;
    audioService.playClick();
    setIsSharing(true);

    try {
      const currentUrl = window.location.toString();
      const qrUrl = await QRCode.toDataURL(currentUrl, { margin: 2, width: 100, color: { dark: '#000000', light: '#ffffff' } });
      const qrImg = document.getElementById('story-share-qr') as HTMLImageElement;
      if (qrImg) qrImg.src = qrUrl;

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `trader-life-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error("Share failed", error);
      alert("生成图片失败");
    } finally {
      setIsSharing(false);
    }
  };

  const outcome = getOutcomeTitle();
  const OutcomeIcon = outcome.icon;

  return (
    <div className="flex flex-col h-full bg-black text-gray-300 font-mono relative overflow-hidden">
      
      {/* --- HIDDEN SHARE TEMPLATE --- */}
      <div 
        ref={shareRef}
        className="fixed top-0 left-0 w-[375px] bg-slate-900 text-white p-6 flex flex-col z-[-10] pointer-events-none"
        style={{ transform: 'translateX(-9999px)' }}
      >
        <div className="w-full flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-white" />
                </div>
                <span className="font-bold tracking-wide text-lg">交易人生</span>
            </div>
            <span className="text-xs text-gray-400">TRADER'S JOURNEY</span>
        </div>

        <div className="flex flex-col items-center justify-center mb-8 text-center space-y-4">
             <div className={`p-6 rounded-full bg-slate-800 border-4 border-slate-700 shadow-2xl ${outcome.color}`}>
                <OutcomeIcon size={64} />
             </div>
             <div>
                <div className="text-gray-500 text-xs tracking-widest uppercase mb-1">最终结局</div>
                <h1 className={`text-4xl font-black ${outcome.color}`}>{outcome.title}</h1>
             </div>
             <p className="text-gray-400 text-sm px-4">"{outcome.desc}"</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div className="text-xs text-gray-500 mb-1">最终资产</div>
                <div className={`font-mono font-bold text-lg ${stats.cash > INITIAL_STATS.cash ? 'text-red-400' : 'text-green-400'}`}>
                    ¥{stats.cash.toLocaleString()}
                </div>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div className="text-xs text-gray-500 mb-1">存活时间</div>
                <div className="font-mono font-bold text-lg text-white">
                    {stats.turn} <span className="text-xs text-gray-500">个月</span>
                </div>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div className="text-xs text-gray-500 mb-1">市场认知</div>
                <div className="font-mono font-bold text-lg text-blue-400">{stats.insight}</div>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div className="text-xs text-gray-500 mb-1">行业声望</div>
                <div className="font-mono font-bold text-lg text-purple-400">{stats.reputation}</div>
            </div>
        </div>

        <div className="mt-auto bg-white text-black rounded-xl p-4 flex items-center justify-between">
            <div>
                <div className="font-bold text-lg">我的交易生涯</div>
                <div className="text-xs text-gray-600">Scan to play</div>
            </div>
            <img id="story-share-qr" alt="QR" className="w-16 h-16" />
        </div>
      </div>
      {/* --- END SHARE TEMPLATE --- */}

      {/* Top Bar: Stats */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 grid grid-cols-4 gap-2 text-xs shrink-0 z-10">
        <div className="flex flex-col items-center">
             <div className="flex items-center gap-1 text-gray-500 mb-1"><DollarSign size={12}/> 资金</div>
             <div className={`font-bold ${stats.cash < 0 ? 'text-red-500' : 'text-finance-accent'}`}>
                {stats.cash.toLocaleString()}
             </div>
        </div>
        <div className="flex flex-col items-center">
             <div className="flex items-center gap-1 text-gray-500 mb-1"><Heart size={12}/> 健康</div>
             <div className={`font-bold ${getHealthColor(stats.health)}`}>{stats.health}%</div>
        </div>
        <div className="flex flex-col items-center">
             <div className="flex items-center gap-1 text-gray-500 mb-1"><Brain size={12}/> 认知</div>
             <div className="font-bold text-blue-400">{stats.insight}</div>
        </div>
        <div className="flex flex-col items-center">
             <div className="flex items-center gap-1 text-gray-500 mb-1"><Clock size={12}/> 时间</div>
             <div className="font-bold text-white">{stats.turn}/{stats.maxTurn}</div>
        </div>
        
        {/* Reputation Bar (Subtle) */}
        <div className="col-span-4 mt-1 flex items-center gap-2">
            <Crown size={10} className="text-purple-400"/>
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${stats.reputation}%` }}></div>
            </div>
        </div>
      </div>

      {/* Center: Log Area (A Dark Room Style) */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/90 scroll-smooth"
      >
        {logs.map((log, idx) => (
            <div 
                key={idx} 
                className={`
                    ${log.type === 'choice' ? 'text-gray-500 italic text-right text-xs my-2' : ''}
                    ${log.type === 'effect' ? 'text-gray-400 text-xs pl-4 border-l-2 border-slate-800' : ''}
                    ${log.type === 'narrative' ? 'text-gray-100 leading-relaxed py-1 animate-in fade-in duration-500' : ''}
                `}
            >
                {log.text}
            </div>
        ))}
        {/* Spacer for bottom controls */}
        <div className="h-4"></div>
      </div>

      {/* Bottom: Controls */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 shrink-0">
         {isGameOver ? (
             <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                 <div className="text-center mb-4">
                    <h3 className={`text-xl font-bold ${outcome.color} mb-1`}>{outcome.title}</h3>
                    <p className="text-xs text-gray-500">{outcome.desc}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                     <button 
                        onClick={handleShare}
                        disabled={isSharing}
                        className="py-4 bg-finance-accent text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-all active:scale-[0.99] disabled:opacity-50"
                     >
                        {isSharing ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/> : <Share2 size={18} />}
                        <span>保存战绩</span>
                     </button>
                     <button 
                        onClick={onBack}
                        className="py-4 bg-slate-800 text-white border border-slate-600 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all active:scale-[0.99]"
                     >
                        <ArrowRight size={18} /> 返回大厅
                     </button>
                 </div>
             </div>
         ) : (
            <div className="flex flex-col gap-2">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Make a Choice</div>
                {currentEvent.choices.map((choice, idx) => {
                    const canAfford = !choice.reqCash || stats.cash >= choice.reqCash;
                    const hasInsight = !choice.reqInsight || stats.insight >= choice.reqInsight;
                    const hasReputation = !choice.reqReputation || stats.reputation >= (choice.reqReputation || 0);
                    
                    const locked = !canAfford || !hasInsight || !hasReputation;

                    if (choice.reqInsight && !hasInsight) return null; // Hidden option if not enough insight

                    return (
                        <button
                            key={idx}
                            onClick={() => !locked && handleChoice(choice)}
                            disabled={locked}
                            className={`
                                w-full py-3 px-4 text-left border relative group transition-all
                                ${locked 
                                    ? 'border-slate-800 text-slate-600 bg-transparent cursor-not-allowed' 
                                    : 'border-slate-600 text-gray-200 bg-slate-800/50 hover:bg-slate-700 hover:border-finance-accent hover:text-white active:bg-slate-600'}
                            `}
                        >
                            <div className="flex justify-between items-center">
                                <span>{choice.text}</span>
                                {choice.cost && <span className="text-xs text-red-400">-{choice.cost}</span>}
                            </div>
                            
                            {/* Requirements tooltip/text */}
                            {choice.reqCash && (
                                <span className={`text-[10px] block mt-1 ${stats.cash < choice.reqCash ? 'text-red-500' : 'text-gray-500'}`}>
                                    需要资金: {choice.reqCash}
                                </span>
                            )}
                            {choice.reqReputation && (
                                <span className={`text-[10px] block mt-1 ${stats.reputation < choice.reqReputation ? 'text-red-500' : 'text-purple-500'}`}>
                                    需要声望: {choice.reqReputation}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
         )}
         
         {!isGameOver && (
             <button 
                onClick={onBack}
                className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-400"
                title="Exit Story"
             >
                 <X size={16} />
             </button>
         )}
      </div>
    </div>
  );
};

export default StoryMode;
