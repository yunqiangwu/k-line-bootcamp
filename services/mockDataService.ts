import { StockData } from '../types';

// Helper to generate random stock data (Random Walk)
export const generateStockData = (days: number = 100): StockData[] => {
  const data: StockData[] = [];
  let price = 10 + Math.random() * 5; // Start price ~10-15
  let vol = 10000;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const dateStr = date.toISOString().split('T')[0];

    const change = (Math.random() - 0.48) * 0.8; // Slight upward bias
    const open = price;
    const close = price + change;
    
    // Wicks
    const high = Math.max(open, close) + Math.random() * 0.5;
    const low = Math.min(open, close) - Math.random() * 0.5;
    
    // Volume noise
    vol = Math.max(5000, vol + (Math.random() - 0.5) * 2000);

    data.push({
      date: dateStr,
      open: parseFloat(open.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      volume: Math.floor(vol),
    });

    price = close;
  }

  // Calculate MAs
  const calculateMA = (dayCount: number) => {
    for (let i = dayCount - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < dayCount; j++) {
        sum += data[i - j].close;
      }
      if (dayCount === 5) data[i].ma5 = parseFloat((sum / dayCount).toFixed(2));
      if (dayCount === 10) data[i].ma10 = parseFloat((sum / dayCount).toFixed(2));
      if (dayCount === 20) data[i].ma20 = parseFloat((sum / dayCount).toFixed(2));
    }
  };

  calculateMA(5);
  calculateMA(10);
  calculateMA(20);

  return data;
};

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    type: 'text',
    question: "在K线图中，当收盘价高于开盘价时，通常显示为红色，这被称为？",
    options: ["阴线", "阳线", "十字星", "墓碑线"],
    correctIndex: 1,
    explanation: "收盘价高于开盘价表示当日价格上涨，称为阳线（红柱）。"
  },
  {
    id: 2,
    type: 'text',
    question: "MACD指标中，快线穿越慢线形成的向上交叉被称为？",
    options: ["死叉", "背离", "金叉", "盘整"],
    correctIndex: 2,
    explanation: "快线（DIF）从下向上突破慢线（DEA）被称为金叉，通常视为买入信号。"
  },
  {
    id: 3,
    type: 'text',
    question: "关于'成交量'，以下说法正确的是？",
    options: ["价格上涨成交量一定放大", "量价背离通常预示趋势反转", "成交量与价格无关", "阴线成交量一定比阳线小"],
    correctIndex: 1,
    explanation: "量价背离（如价升量缩）通常意味着当前趋势动力不足，可能即将反转。"
  }
];