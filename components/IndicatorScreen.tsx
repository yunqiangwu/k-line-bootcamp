
import React, { useState } from 'react';
import { ArrowLeft, BookOpen, TrendingUp, Activity, BarChart2, Star } from 'lucide-react';
import { getIndicators } from '../services/mockDataService';
import { IndicatorDef } from '../types';

interface IndicatorScreenProps {
  onBack: () => void;
}

const IndicatorScreen: React.FC<IndicatorScreenProps> = ({ onBack }) => {
  const indicators = getIndicators();
  const [selectedId, setSelectedId] = useState<string>(indicators[0].id);

  const activeIndicator = indicators.find(i => i.id === selectedId) || indicators[0];

  return (
    <div className="flex flex-col h-full bg-finance-bg text-white">
      {/* Header */}
      <div className="p-4 flex items-center bg-finance-card border-b border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg flex items-center justify-center gap-2">
            <BookOpen size={18} className="text-finance-accent"/>
            指标百科
        </h1>
        <div className="w-8" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Tabs */}
        <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto shrink-0">
            {indicators.map(ind => (
                <button
                    key={ind.id}
                    onClick={() => setSelectedId(ind.id)}
                    className={`p-3 flex flex-col items-center justify-center border-b border-slate-800 transition-colors ${selectedId === ind.id ? 'bg-slate-800 text-finance-accent' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <div className="font-black text-sm">{ind.name}</div>
                    <div className="text-[10px] mt-1 scale-90 opacity-70">{ind.category}</div>
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-finance-bg">
            <div className="max-w-xl mx-auto space-y-6">
                
                {/* Title Card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            {activeIndicator.name}
                        </h2>
                        <div className="flex space-x-0.5">
                             {[...Array(5)].map((_, i) => (
                                 <Star 
                                    key={i} 
                                    size={12} 
                                    className={i < activeIndicator.difficulty ? "fill-finance-accent text-finance-accent" : "text-slate-700"} 
                                 />
                             ))}
                        </div>
                    </div>
                    <p className="text-sm text-finance-accent font-mono mb-4">{activeIndicator.fullName}</p>
                    <p className="text-gray-300 leading-relaxed text-sm">
                        {activeIndicator.description}
                    </p>
                </div>

                {/* Formula Section */}
                <div className="bg-finance-card border border-slate-700 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity size={14} /> 核心逻辑
                    </h3>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <code className="text-xs text-green-400 font-mono break-words block">
                            {activeIndicator.formulaSimple}
                        </code>
                    </div>
                </div>

                {/* Signals Grid */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-stock-up/10 border border-stock-up/30 p-4 rounded-xl">
                        <h3 className="text-stock-up font-bold text-sm mb-2 flex items-center gap-2">
                            <TrendingUp size={16}/> 买入信号
                        </h3>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            {activeIndicator.signals.buy}
                        </p>
                    </div>
                    
                    <div className="bg-stock-down/10 border border-stock-down/30 p-4 rounded-xl">
                        <h3 className="text-stock-down font-bold text-sm mb-2 flex items-center gap-2">
                            <TrendingUp size={16} className="rotate-180"/> 卖出信号
                        </h3>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            {activeIndicator.signals.sell}
                        </p>
                    </div>
                </div>

                {/* Pros/Cons */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-finance-card p-4 rounded-xl border border-slate-700">
                        <div className="text-xs text-gray-500 mb-2">优势 (Pros)</div>
                        <p className="text-xs text-gray-300">{activeIndicator.pros}</p>
                     </div>
                     <div className="bg-finance-card p-4 rounded-xl border border-slate-700">
                        <div className="text-xs text-gray-500 mb-2">劣势 (Cons)</div>
                        <p className="text-xs text-gray-300">{activeIndicator.cons}</p>
                     </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorScreen;
