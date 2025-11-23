import { SimulationResult, GameHistoryItem } from '../types';

const STORAGE_KEY = 'kline_bootcamp_history_v1';

export const saveGameResult = (result: SimulationResult) => {
  try {
    const historyItem: GameHistoryItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      yieldRate: result.yieldRate,
      profit: result.finalCapital - result.initialCapital,
      stockName: result.stockName,
      tradeCount: result.trades.length,
    };

    const existingData = getGameHistory();
    const newData = [historyItem, ...existingData]; // Prepend new game

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  } catch (error) {
    console.error("Failed to save game history", error);
  }
};

export const getGameHistory = (): GameHistoryItem[] => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Failed to load game history", error);
    return [];
  }
};

export const getMonthlyStats = () => {
  const history = getGameHistory();
  
  // Group by Month (YYYY-MM)
  const grouped = history.reduce((acc, item) => {
    const month = item.timestamp.slice(0, 7); // "2023-10"
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<string, GameHistoryItem[]>);

  return grouped;
};

export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};