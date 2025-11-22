import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../services/mockDataService';
import { ArrowLeft, CheckCircle, XCircle, Lock, Trophy } from 'lucide-react';

interface QuizModeProps {
  onBack: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState(0); // Level corresponds to question index for simplicity
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const question = QUIZ_QUESTIONS[currentLevel];
  const totalLevels = QUIZ_QUESTIONS.length;

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (index === question.correctIndex) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const nextLevel = () => {
    if (currentLevel < totalLevels - 1) {
      setCurrentLevel(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      // Finished all levels
      alert("恭喜通关！");
      onBack();
    }
  };

  return (
    <div className="flex flex-col h-full bg-finance-bg text-white">
      {/* Header */}
      <div className="p-4 flex items-center bg-finance-card border-b border-gray-800">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">K线闯关</h1>
        <div className="w-8" />
      </div>

      {/* Map / Progress Indicator */}
      <div className="p-6 overflow-y-auto flex-1">
        <div className="mb-8 flex justify-center space-x-2">
            {QUIZ_QUESTIONS.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`h-2 flex-1 rounded-full ${idx <= currentLevel ? 'bg-finance-accent' : 'bg-gray-700'}`}
                />
            ))}
        </div>

        {/* Question Card */}
        <div className="bg-finance-card border border-gray-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={64} />
            </div>
            
            <span className="text-finance-accent text-sm font-bold tracking-wider uppercase mb-2 block">
                关卡 {currentLevel + 1}
            </span>
            
            <h2 className="text-xl font-bold mb-6 leading-relaxed">
                {question.question}
            </h2>

            <div className="space-y-3">
                {question.options.map((opt, idx) => {
                    let btnClass = "w-full p-4 rounded-xl text-left border border-gray-700 bg-slate-800 hover:bg-slate-700 transition-colors";
                    
                    if (isAnswered) {
                        if (idx === question.correctIndex) {
                            btnClass = "w-full p-4 rounded-xl text-left border border-green-500 bg-green-500/20 text-green-400";
                        } else if (idx === selectedOption && idx !== question.correctIndex) {
                            btnClass = "w-full p-4 rounded-xl text-left border border-red-500 bg-red-500/20 text-red-400";
                        } else {
                            btnClass = "w-full p-4 rounded-xl text-left border border-gray-800 bg-slate-900/50 text-gray-500";
                        }
                    }

                    return (
                        <button 
                            key={idx} 
                            onClick={() => handleOptionClick(idx)}
                            className={btnClass}
                            disabled={isAnswered}
                        >
                            <div className="flex items-center justify-between">
                                <span>{opt}</span>
                                {isAnswered && idx === question.correctIndex && <CheckCircle size={20} />}
                                {isAnswered && idx === selectedOption && idx !== question.correctIndex && <XCircle size={20} />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Explanation / Next Button */}
            {isAnswered && (
                <div className="mt-6 pt-6 border-t border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`p-4 rounded-lg mb-4 ${isCorrect ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                        <p className="font-bold mb-1">{isCorrect ? '回答正确!' : '回答错误'}</p>
                        <p className="text-sm text-gray-300">{question.explanation}</p>
                    </div>
                    
                    <button 
                        onClick={nextLevel}
                        className="w-full py-3 bg-finance-accent text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors"
                    >
                        {currentLevel < totalLevels - 1 ? '下一关' : '领取奖励'}
                    </button>
                </div>
            )}
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
            答错没关系，这就是训练的意义。
        </div>
      </div>
    </div>
  );
};

export default QuizMode;