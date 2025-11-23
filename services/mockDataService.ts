
import { StockData, QuizQuestion, IndicatorDef } from '../types';

// Helper to generate random stock data (Random Walk)
export const generateStockData = (days: number = 90): StockData[] => {
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

  // Calculate MACD (12, 26, 9)
  // EMA function
  const calculateEMA = (period: number, values: number[]) => {
    const k = 2 / (period + 1);
    const emaArray: number[] = [];
    let ema = values[0];
    emaArray.push(ema);
    
    for (let i = 1; i < values.length; i++) {
      ema = values[i] * k + ema * (1 - k);
      emaArray.push(ema);
    }
    return emaArray;
  };

  const closes = data.map(d => d.close);
  const ema12 = calculateEMA(12, closes);
  const ema26 = calculateEMA(26, closes);

  for (let i = 0; i < data.length; i++) {
    const dif = ema12[i] - ema26[i];
    data[i].dif = parseFloat(dif.toFixed(3));
  }

  // Calculate DEA (EMA9 of DIF)
  // We need to handle the initial undefined/zero logic carefully, but for mock data simplicity:
  const difs = data.map(d => d.dif || 0);
  const dea = calculateEMA(9, difs);

  for (let i = 0; i < data.length; i++) {
    data[i].dea = parseFloat(dea[i].toFixed(3));
    // MACD = (DIF - DEA) * 2
    data[i].macd = parseFloat(((data[i].dif! - data[i].dea!) * 2).toFixed(3));
  }

  return data;
};

// --- QUIZ DATA ---

const FULL_QUESTION_BANK: QuizQuestion[] = [
  // 基础 K线 & 形态 (Basic K-Line)
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
    question: "“早晨之星”形态通常出现在下跌趋势的末端，它预示着什么？",
    options: ["继续下跌", "行情见底反转", "横盘整理", "成交量萎缩"],
    correctIndex: 1,
    explanation: "早晨之星是经典的底部反转形态，预示着黑暗过去，光明到来，价格可能上涨。"
  },
  {
    id: 3,
    type: 'text',
    question: "K线实体很小，上下影线很长，表示多空双方争夺激烈但势均力敌，这种形态叫？",
    options: ["光头光脚", "大阴线", "十字星", "红三兵"],
    correctIndex: 2,
    explanation: "十字星意味着开盘价和收盘价几乎相同，表明市场多空力量暂时平衡，常是变盘信号。"
  },
  {
    id: 4,
    type: 'text',
    question: "高位出现一根长上影线的K线，状如墓碑，这通常被称为？",
    options: ["射击之星/流星", "锤头线", "倒锤头", "早晨之星"],
    correctIndex: 0,
    explanation: "射击之星（流星）出现在高位，长上影线表明多头进攻受阻，空头反扑，是见顶信号。"
  },
  {
    id: 5,
    type: 'text',
    question: "连续三根阳线，收盘价依次创新高，这种形态被称为？",
    options: ["三只乌鸦", "红三兵", "多方炮", "上升三法"],
    correctIndex: 1,
    explanation: "红三兵是强烈的看涨信号，表明多头力量持续增强。"
  },
  {
    id: 6,
    type: 'text',
    question: "下跌趋势中，出现一根大阴线，次日低开高走收出一根切入大阴线实体一半以上的阳线，这是？",
    options: ["乌云盖顶", "曙光初现", "身怀六甲", "平底"],
    correctIndex: 1,
    explanation: "曙光初现是底部反转形态，阳线深入阴线实体越深，反转信号越强。"
  },
  {
    id: 7,
    type: 'text',
    question: "上涨趋势中，一根大阳线后紧接着一根高开低走的大阴线，且阴线实体覆盖了阳线实体，这是？",
    options: ["穿头破脚/吞没形态", "孕线", "吊颈线", "刺透形态"],
    correctIndex: 0,
    explanation: "阴包阳（看跌吞没）是顶部强烈的反转信号，表明空头完全吞噬了多头力量。"
  },
  
  // 指标 & 量价 (Indicators & Volume)
  {
    id: 8,
    type: 'text',
    question: "MACD指标中，快线（DIF）穿越慢线（DEA）形成的向上交叉被称为？",
    options: ["死叉", "背离", "金叉", "盘整"],
    correctIndex: 2,
    explanation: "快线从下向上突破慢线被称为金叉，通常视为买入信号。"
  },
  {
    id: 9,
    type: 'text',
    question: "关于'量价背离'（如价格创新高，但成交量在减少），通常预示着？",
    options: ["上涨动力十足", "趋势可能反转", "主力在吸筹", "无特殊意义"],
    correctIndex: 1,
    explanation: "量价背离意味着价格上涨缺乏资金支持（买盘衰竭），是见顶的常见信号。"
  },
  {
    id: 10,
    type: 'text',
    question: "布林带（Bollinger Bands）开口急剧变大，通常意味着？",
    options: ["市场进入震荡", "波动率加剧，变盘在即", "成交量萎缩", "主力出货"],
    correctIndex: 1,
    explanation: "布林带开口扩大表示价格波动加剧，通常伴随着单边趋势（暴涨或暴跌）的开始。"
  },

  // 缠论 (Chan Theory)
  {
    id: 11,
    type: 'text',
    question: "在缠论中，构成'笔'的最基本条件是？",
    options: ["至少3根K线", "顶分型+底分型+中间至少一根独立K线", "成交量放大", "均线金叉"],
    correctIndex: 1,
    explanation: "缠论定义：一笔必须由顶分型和底分型构成，且两个分型之间至少有一根不属于这两个分型的独立K线。"
  },
  {
    id: 12,
    type: 'text',
    question: "缠论中，判断走势结束的依据通常是？",
    options: ["MACD死叉", "背驰（背离）", "跌破均线", "巨量长阴"],
    correctIndex: 1,
    explanation: "缠论的核心在于'背驰'（趋势力度的衰竭）。没有背驰，就没有买卖点。"
  },
  {
    id: 13,
    type: 'text',
    question: "缠论中的'中枢'是由什么构成的？",
    options: ["连续三根K线重叠", "连续三笔的重叠部分", "均线的缠绕", "成交量的堆积"],
    correctIndex: 1,
    explanation: "中枢由连续三笔（下-上-下 或 上-下-上）的重叠区间构成，是判断走势级别的基础。"
  },
  {
    id: 14,
    type: 'text',
    question: "缠论中，'第三类买点'通常出现在哪里？",
    options: ["中枢下方背驰处", "中枢内部震荡时", "突破中枢并回踩不进入中枢时", "跌破中枢最低点时"],
    correctIndex: 2,
    explanation: "第三类买点是次级别离开中枢后，次级别回试不回到中枢内部（不重叠），确认趋势破坏。"
  },
  {
    id: 15,
    type: 'text',
    question: "缠论中，K线包含关系处理的目的是什么？",
    options: ["简化K线，方便画笔", "过滤杂波", "计算成交量", "寻找支撑位"],
    correctIndex: 0,
    explanation: "包含处理是为了规范K线，使其成为标准元素，从而准确定义顶分型和底分型。"
  },
  {
    id: 16,
    type: 'text',
    question: "缠论中，顶分型的最高点被称为？",
    options: ["高点", "顶", "极值", "上沿"],
    correctIndex: 1,
    explanation: "顶分型中间K线的高点是该分型的'顶'，是画笔的重要锚点。"
  },
  
  // 综合 / 心理 (General/Psychology)
  {
    id: 17,
    type: 'text',
    question: "交易中常说的 '止损' 是为了？",
    options: ["锁定利润", "截断亏损，保护本金", "预测市场", "增加交易频率"],
    correctIndex: 1,
    explanation: "止损的核心是生存。截断亏损，让利润奔跑。"
  },
  {
    id: 18,
    type: 'text',
    question: "T+1交易制度指的是？",
    options: ["当天买入当天可以卖出", "当天买入第二天才能卖出", "买入后锁定1小时", "资金实时到账"],
    correctIndex: 1,
    explanation: "A股市场实行T+1制度，即当日买入的股票，次日（下一个交易日）才能卖出。"
  },
  {
    id: 19,
    type: 'text',
    question: "移动平均线（MA）主要用于判断？",
    options: ["短期波动", "价格趋势", "具体买卖点", "成交量变化"],
    correctIndex: 1,
    explanation: "移动平均线平滑了价格噪音，主要用于识别和跟踪价格的趋势方向。"
  },
  {
    id: 20,
    type: 'text',
    question: "当RSI指标超过80时，通常被认为市场处于什么状态？",
    options: ["超卖", "超买", "平衡", "低迷"],
    correctIndex: 1,
    explanation: "RSI（相对强弱指标）超过80通常被视为超买区，价格可能回调；低于20为超卖区，可能反弹。"
  }
];

export const getRandomQuizQuestions = (count: number = 3): QuizQuestion[] => {
  const shuffled = [...FULL_QUESTION_BANK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};


// --- INDICATOR ENCYCLOPEDIA DATA ---
export const getIndicators = (): IndicatorDef[] => [
  {
    id: 'ma',
    name: 'MA',
    fullName: 'Moving Average (移动平均线)',
    category: 'Trend',
    description: '最基础的趋势指标，通过计算过去一段时间的平均价格来平滑价格波动，从而显示趋势方向。',
    formulaSimple: 'MA(N) = (P1 + P2 + ... + Pn) / N',
    signals: {
      buy: '金叉：短期均线（如5日）上穿长期均线（如20日）。K线站上均线。',
      sell: '死叉：短期均线下穿长期均线。K线跌破均线。'
    },
    pros: '简单直观，趋势跟踪效果好，适合单边行情。',
    cons: '滞后性强，在震荡市中会频繁发出错误信号（来回打脸）。',
    difficulty: 1
  },
  {
    id: 'macd',
    name: 'MACD',
    fullName: 'Moving Average Convergence Divergence (指数平滑异同移动平均线)',
    category: 'Trend',
    description: '“指标之王”。它利用快慢两条移动平均线的聚合与分离状况，兼顾了趋势追踪和动能研判。',
    formulaSimple: 'DIF = EMA(12) - EMA(26); DEA = EMA(9) of DIF; MACD柱 = 2*(DIF-DEA)',
    signals: {
      buy: '低位金叉（DIF上穿DEA）；底背离（股价新低但MACD没创新低）。',
      sell: '高位死叉（DIF下穿DEA）；顶背离（股价新高但MACD没创新高）。'
    },
    pros: '稳定性高，能有效过滤噪音，背离信号极具参考价值。',
    cons: '买卖点比K线滞后，对急涨急跌反应迟钝。',
    difficulty: 3
  },
  {
    id: 'kdj',
    name: 'KDJ',
    fullName: 'Stochastic Oscillator (随机指标)',
    category: 'Oscillator',
    description: '通过统计一个周期内的最高价、最低价与收盘价之间的比例关系，来研判短期的超买超卖状态。',
    formulaSimple: '基于RSV（未成熟随机值）计算K、D、J三条线。J线最为灵敏。',
    signals: {
      buy: 'J值<0（超卖）；低位金叉。',
      sell: 'J值>100（超买）；高位死叉。'
    },
    pros: '反应灵敏，适合捕捉短线震荡行情的买卖点。',
    cons: '容易钝化（单边行情中长期处于超买/超卖区失效），信号过于频繁。',
    difficulty: 2
  },
  {
    id: 'boll',
    name: 'BOLL',
    fullName: 'Bollinger Bands (布林带)',
    category: 'Trend',
    description: '基于标准差原理设计。由上轨（压力）、中轨（均线）、下轨（支撑）三条线组成，通道宽度随波动率变化。',
    formulaSimple: '中轨=MA(20); 上/下轨=中轨 ± 2*标准差',
    signals: {
      buy: '股价触及下轨反弹；开口扩大且股价沿上轨上涨。',
      sell: '股价触及上轨回落；跌破中轨。'
    },
    pros: '直观显示压力与支撑，能判断波动率变化（开口/收口）。',
    cons: '需要配合其他指标判断突破的有效性。',
    difficulty: 2
  },
  {
    id: 'rsi',
    name: 'RSI',
    fullName: 'Relative Strength Index (相对强弱指标)',
    category: 'Oscillator',
    description: '通过比较一段时间内的平均收盘涨幅和平均收盘跌幅，来评估市场多空力量的强弱。',
    formulaSimple: 'RSI = 100 - 100 / (1 + RS)',
    signals: {
      buy: 'RSI < 20 (超卖)；底背离。',
      sell: 'RSI > 80 (超买)；顶背离。'
    },
    pros: '判断市场情绪（超买/超卖）非常准确，背离信号可靠。',
    cons: '在强势单边行情中会过早发出反向信号。',
    difficulty: 2
  }
];
