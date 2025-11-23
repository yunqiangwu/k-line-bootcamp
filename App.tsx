
import React, { useState } from 'react';
import Home from './components/Home';
import SimulationMode from './components/SimulationMode';
import QuizMode from './components/QuizMode';
import ResultScreen from './components/ResultScreen';
import HistoryScreen from './components/HistoryScreen';
import IndicatorScreen from './components/IndicatorScreen';
import { GameState, SimulationResult } from './types';
import { saveGameResult } from './services/storageService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  const handleSimulationEnd = (result: SimulationResult) => {
    // Save to localStorage immediately upon finishing
    saveGameResult(result);
    setSimResult(result);
    setGameState(GameState.RESULT);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.SIMULATION:
        return (
          <SimulationMode 
            onEnd={handleSimulationEnd} 
            onExit={() => setGameState(GameState.HOME)} 
          />
        );
      case GameState.QUIZ:
        return <QuizMode onBack={() => setGameState(GameState.HOME)} />;
      case GameState.INDICATOR:
        return <IndicatorScreen onBack={() => setGameState(GameState.HOME)} />;
      case GameState.RESULT:
        return (
          <ResultScreen 
            result={simResult!} 
            onHome={() => setGameState(GameState.HOME)}
            onReplay={() => setGameState(GameState.SIMULATION)}
          />
        );
      case GameState.HISTORY:
        return <HistoryScreen onBack={() => setGameState(GameState.HOME)} />;
      case GameState.HOME:
      default:
        return <Home setGameState={setGameState} />;
    }
  };

  return (
    <div className="w-full h-screen bg-finance-bg flex justify-center overflow-hidden">
      <div className="w-full max-w-md h-full bg-finance-bg shadow-2xl relative overflow-hidden flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
