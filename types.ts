
export interface StockData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  ma5?: number;
  ma10?: number;
  ma20?: number;
  // MACD Indicators
  dif?: number;
  dea?: number;
  macd?: number;
}

export enum GameState {
  HOME = 'HOME',
  SIMULATION = 'SIMULATION',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY',
  INDICATOR = 'INDICATOR',
  STORY = 'STORY',
}

export interface Trade {
  type: 'BUY' | 'SELL';
  price: number;
  date: string;
  amount: number; // Percentage of portfolio or fixed lots
}

export interface SimulationResult {
  initialCapital: number;
  finalCapital: number;
  yieldRate: number;
  trades: Trade[];
  stockName: string;
  stockCode: string;
  data: StockData[];
}

export interface GameHistoryItem {
  id: number;
  timestamp: string; // ISO date
  yieldRate: number;
  profit: number;
  stockName: string;
  tradeCount: number;
}

export interface QuizQuestion {
  id: number;
  type: 'image' | 'text';
  question: string;
  imageUrl?: string; // URL placeholder
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
}

export interface IndicatorDef {
  id: string;
  name: string;
  fullName: string;
  category: 'Trend' | 'Oscillator' | 'Volume' | 'Other';
  description: string;
  formulaSimple: string;
  signals: {
    buy: string;
    sell: string;
  };
  pros: string;
  cons: string;
  difficulty: number; // 1-5
}

// --- STORY MODE TYPES ---

export interface PlayerStats {
  cash: number;
  health: number;    // 0-100
  insight: number;   // 0-100 (Knowledge)
  reputation: number;// 0-100
  turn: number;      // Month/Turn count
  maxTurn: number;
}

export interface StoryChoice {
  text: string;
  reqInsight?: number; 
  reqCash?: number;
  reqReputation?: number; // Added this
  cost?: number; 
  effect: (currentStats: PlayerStats) => Partial<PlayerStats>;
  logText: string; 
  nextEventId?: string; 
}

export interface StoryEvent {
  id: string;
  text: string;
  choices: StoryChoice[];
  isEnding?: boolean;
}
