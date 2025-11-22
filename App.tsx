import React, { useState } from 'react';
import Home from './components/Home';
import SimulationMode from './components/SimulationMode';
import QuizMode from './components/QuizMode';
import ResultScreen from './components/ResultScreen';
import { GameState, SimulationResult } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  const handleSimulationEnd = (result: SimulationResult) => {
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
      case GameState.RESULT:
        return (
          <ResultScreen 
            result={simResult!} 
            onHome={() => setGameState(GameState.HOME)}
            onReplay={() => setGameState(GameState.SIMULATION)}
          />
        );
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