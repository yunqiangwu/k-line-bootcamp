
import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, StoryEvent, StoryChoice } from '../types';
import { INITIAL_STATS, START_EVENT, getNextEvent } from '../services/storyService';
import { audioService } from '../services/audioService';
import { Heart, DollarSign, Brain, Crown, Clock, ArrowRight, X } from 'lucide-react';

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
  
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (cashDelta < 0) audioService.playSell(); // Using playSell as a "loss/spend" sound metaphor here
    if (newStats.health < stats.health) audioService.playWrong(); // Damage sound

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

  return (
    <div className="flex flex-col h-full bg-black text-gray-300 font-mono">
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
             <div className="space-y-3">
                 <div className="text-center text-sm text-gray-400 mb-2">职业生涯结束</div>
                 <button 
                    onClick={onBack}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-none flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                 >
                    <ArrowRight size={16} /> 返回大厅
                 </button>
             </div>
         ) : (
            <div className="flex flex-col gap-2">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Make a Choice</div>
                {currentEvent.choices.map((choice, idx) => {
                    const canAfford = !choice.reqCash || stats.cash >= choice.reqCash;
                    const hasInsight = !choice.reqInsight || stats.insight >= choice.reqInsight;
                    const hasReputation = !choice.reqReputation || stats.reputation >= (choice.reqReputation || 0); // Corrected property access if added to types, assuming check based on generic logic
                    // Note: Types.ts updated needs reqReputation in StoryChoice if strictly typed, 
                    // but for now let's assume specific optional props. 
                    // Let's stick to the types defined in types.ts. I need to make sure reqReputation is in type if I use it.
                    // Checking types.ts content... I didn't add reqReputation to StoryChoice explicitly in the XML above, only reqCash/Insight.
                    // Let me fix types.ts content in the XML or just use dynamic check.
                    // I'll stick to what I defined: reqInsight, reqCash. 
                    // If I used reqReputation in storyService, I need to add it to types.
                    
                    const locked = !canAfford || !hasInsight;

                    if (choice.reqInsight && !hasInsight) return null; // Hidden option

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
                        </button>
                    );
                })}
            </div>
         )}
         
         <button 
            onClick={onBack}
            className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-400"
            title="Exit Story"
         >
             <X size={16} />
         </button>
      </div>
    </div>
  );
};

export default StoryMode;
