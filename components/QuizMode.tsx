import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { getRandomQuizQuestions } from '../services/mockDataService';
import { ArrowLeft, CheckCircle, XCircle, Trophy, RefreshCw, Home, Brain } from 'lucide-react';

interface QuizModeProps {
  onBack: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ onBack }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize game with 3 random questions
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const q = getRandomQuizQuestions(3);
    setQuestions(q);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setIsFinished(false);
  };

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);
    
    const currentQ = questions[currentIndex];
    if (index === currentQ.correctIndex) {
      setIsCorrect(true);
      setScore(prev => prev + 1);
    } else {
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setIsFinished(true);
    }
  };

  if (questions.length === 0) return <div className="text-white p-6">Loading Questions...</div>;

  // --- RESULT VIEW ---
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    let title = "再接再厉";
    let message = "基础知识还需要巩固哦。";
    let colorClass = "text-gray-400";
    
    if (percentage === 100) {
      title = "股市传说";
      message = "全对！你的理论知识非常扎实。";
      colorClass = "text-stock-up"; // Red for winner in China
    } else if (percentage >= 60) {
      title = "合格交易员";
      message = "表现不错，继续加油。";
      colorClass = "text-finance-accent";
    }

    return (
        <div className="flex flex-col h-full bg-finance-bg text-white animate-in fade-in duration-500">
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className={`w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-6 shadow-2xl`}>
                    <Trophy size={48} className={colorClass} />
                </div>
                
                <h2 className={`text-3xl font-bold mb-2 ${colorClass}`}>{title}</h2>
                <div className="text-6xl font-mono font-bold mb-4">{score}/{questions.length}</div>
                <p className="text-gray-400 mb-8">{message}</p>

                <div className="w-full space-y-4">
                    <button 
                        onClick={startNewGame}
                        className="w-full py-4 bg-finance-accent text-black font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
                    >
                        <RefreshCw size={20} />
                        <span>再来一次</span>
                    </button>
                    <button 
                        onClick={onBack}
                        className="w-full py-4 bg-slate-800 text-gray-300 font-bold rounded-xl flex items-center justify-center space-x-2 border border-slate-700 active:scale-95 transition-transform"
                    >
                        <Home size={20} />
                        <span>返回大厅</span>
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // --- GAME VIEW ---
  const question = questions[currentIndex];
  
  return (
    <div className="flex flex-col h-full bg-finance-bg text-white">
      {/* Header */}
      <div className="p-4 flex items-center bg-finance-card border-b border-gray-800">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">知识闯关</h1>
        <div className="w-8" />
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Progress</span>
            <span>{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
                className="h-full bg-finance-accent transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Question Card */}
        <div className="bg-finance-card border border-gray-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Brain size={80} />
            </div>
            
            <span className="inline-block px-3 py-1 bg-slate-800 rounded-full text-xs text-gray-400 border border-slate-700 mb-4">
                Question {currentIndex + 1}
            </span>
            
            <h2 className="text-xl font-bold mb-6 leading-relaxed">
                {question.question}
            </h2>

            <div className="space-y-3">
                {question.options.map((opt, idx) => {
                    let btnClass = "w-full p-4 rounded-xl text-left border border-gray-700 bg-slate-800 hover:bg-slate-700 transition-colors";
                    
                    if (isAnswered) {
                        if (idx === question.correctIndex) {
                            btnClass = "w-full p-4 rounded-xl text-left border border-stock-down bg-stock-down/10 text-stock-down"; // Green for correct (using stock-down var which is green)
                        } else if (idx === selectedOption && idx !== question.correctIndex) {
                            btnClass = "w-full p-4 rounded-xl text-left border border-stock-up bg-stock-up/10 text-stock-up"; // Red for wrong
                        } else {
                            btnClass = "w-full p-4 rounded-xl text-left border border-gray-800 bg-slate-900/50 text-gray-500 opacity-50";
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
                <div className="mt-6 pt-6 border-t border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className={`p-4 rounded-lg mb-4 border-l-4 ${isCorrect ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                        <p className={`font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? '回答正确!' : '回答错误'}
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed">{question.explanation}</p>
                    </div>
                    
                    <button 
                        onClick={handleNext}
                        className="w-full py-3 bg-finance-accent text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors flex items-center justify-center"
                    >
                        {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuizMode;