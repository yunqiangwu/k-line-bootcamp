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
}

export enum GameState {
  HOME = 'HOME',
  SIMULATION = 'SIMULATION',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
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