
import { StoryEvent, PlayerStats, StoryChoice } from '../types';

// --- INITIAL STATE ---
export const INITIAL_STATS: PlayerStats = {
  cash: 50000,
  health: 100,
  insight: 0,
  reputation: 0,
  turn: 1,
  maxTurn: 36 // 3 Years career
};

// --- EVENTS DATABASE ---

const ENDING_EVENTS: Record<string, StoryEvent> = {
  BANKRUPTCY: {
    id: 'BANKRUPTCY',
    text: '你的账户余额已不足以支付网费。证券公司强平了你的仓位。你破产了。',
    isEnding: true,
    choices: [{
      text: '黯然离场',
      effect: (s) => ({}),
      logText: '游戏结束：破产。'
    }]
  },
  HOSPITAL: {
    id: 'HOSPITAL',
    text: '长期的熬夜复盘和巨大的精神压力击垮了你。你在看盘时突然晕倒，醒来时已在ICU。医生勒令你远离股市。',
    isEnding: true,
    choices: [{
      text: '保命要紧',
      effect: (s) => ({}),
      logText: '游戏结束：健康崩溃。'
    }]
  },
  RETIREMENT: {
    id: 'RETIREMENT',
    text: '三年期满。你看着账户里的数字，回顾这跌宕起伏的交易生涯。你是市场的幸存者。',
    isEnding: true,
    choices: [{
      text: '查看最终身价',
      effect: (s) => ({}),
      logText: '游戏通关。'
    }]
  }
};

const RANDOM_EVENTS: StoryEvent[] = [
  {
    id: 'evt_news_leak',
    text: '深夜，你在一个隐秘的各种群里看到关于某龙头股的小道消息。尚未证实，但传得有鼻子有眼。',
    choices: [
      {
        text: '全仓杀入 (高风险)',
        reqCash: 10000,
        effect: (s) => {
          const win = Math.random() > 0.6; // 40% win rate
          return win 
            ? { cash: s.cash * 1.5, reputation: s.reputation + 5, health: s.health - 5 }
            : { cash: s.cash * 0.6, health: s.health - 10 };
        },
        logText: '你决定赌一把消息票...'
      },
      {
        text: '轻仓试错',
        reqCash: 5000,
        effect: (s) => {
          const win = Math.random() > 0.5;
          return win 
             ? { cash: s.cash + 5000, insight: s.insight + 2 }
             : { cash: s.cash - 2000, insight: s.insight + 1 };
        },
        logText: '你小心翼翼地买了一点。'
      },
      {
        text: '无视噪音，专注K线',
        effect: (s) => ({ insight: s.insight + 3, health: s.health + 2 }),
        logText: '你关掉了聊天软件，继续研究均线系统。'
      }
    ]
  },
  {
    id: 'evt_market_crash',
    text: '大盘遭遇黑色星期四，千股跌停。恐慌情绪在蔓延，你的持仓正在快速缩水。',
    choices: [
      {
        text: '割肉止损，现金为王',
        effect: (s) => ({ cash: s.cash * 0.85, health: s.health - 5 }),
        logText: '你忍痛砍掉了仓位，保住了大部分本金。'
      },
      {
        text: '躺平装死',
        effect: (s) => ({ cash: s.cash * 0.7, health: s.health - 2 }),
        logText: '你关掉账户，祈祷明天会反弹。结果并没有。'
      },
      {
        text: '逆势抄底 (需高认知)',
        reqInsight: 30,
        reqCash: 20000,
        effect: (s) => ({ cash: s.cash * 1.3, reputation: s.reputation + 10 }),
        logText: '凭借对情绪周期的理解，你在恐慌盘涌出时果断接货，吃到了地天板。'
      }
    ]
  },
  {
    id: 'evt_study',
    text: '周末到了。朋友约你去喝酒，但你刚买了一本《缠论》还没拆封。',
    choices: [
      {
        text: '去喝酒放松',
        cost: 1000,
        effect: (s) => ({ health: s.health + 10, reputation: s.reputation + 2 }),
        logText: '你选择了社交和放松，心态得到了恢复。'
      },
      {
        text: '闭关修炼',
        effect: (s) => ({ insight: s.insight + 8, health: s.health - 3 }),
        logText: '你苦读了一整天，感觉对笔和线段的理解加深了。'
      }
    ]
  },
  {
    id: 'evt_guru',
    text: '你在论坛上发表的复盘文章火了，一家私募的操盘手私信你，想和你交流。',
    choices: [
      {
        text: '虚心请教',
        effect: (s) => ({ insight: s.insight + 5, reputation: s.reputation + 5 }),
        logText: '大佬点拨了你几句，你受益匪浅。'
      },
      {
        text: '借机募资 (需高声望)',
        reqReputation: 30,
        effect: (s) => ({ cash: s.cash + 100000, reputation: s.reputation + 10 }),
        logText: '凭借你的名气，大佬决定给你一笔资金操作！'
      }
    ]
  },
  {
    id: 'evt_bull_market',
    text: '一波主升浪行情来了！周围连卖菜大妈都在谈论股票。',
    choices: [
      {
        text: '加杠杆猛干',
        reqCash: 10000,
        effect: (s) => ({ cash: s.cash * 1.8, health: s.health - 15 }),
        logText: '虽然心惊胆战，但满仓融资让你赚得盆满钵满。'
      },
      {
        text: '稳健持股',
        effect: (s) => ({ cash: s.cash * 1.2, health: s.health + 2 }),
        logText: '你享受着资产的稳步增值。'
      },
      {
        text: '分批止盈',
        effect: (s) => ({ cash: s.cash * 1.1, insight: s.insight + 2 }),
        logText: '你并不贪婪，把利润落袋为安。'
      }
    ]
  }
];

export const START_EVENT: StoryEvent = {
  id: 'START',
  text: '你辞去了枯燥的工作，带着仅有的积蓄，租下了一间廉价的公寓。看着面前闪烁的显示器，你的职业交易员生涯开始了。这是第1个月。',
  choices: [
    {
      text: '先买几本经典教材学习',
      cost: 500,
      effect: (s) => ({ insight: s.insight + 10, cash: s.cash - 500 }),
      logText: '磨刀不误砍柴工，你决定先充实大脑。'
    },
    {
      text: '直接实盘，在战争中学习',
      effect: (s) => ({ cash: s.cash * 0.95, insight: s.insight + 5, health: s.health - 5 }), // Lose money initially
      logText: '市场给了你一个下马威，交了点学费，但你学到了经验。'
    }
  ]
};

// --- LOGIC ENGINE ---

export const getNextEvent = (currentStats: PlayerStats): StoryEvent => {
  // 1. Check Death Conditions
  if (currentStats.cash <= 0) return ENDING_EVENTS.BANKRUPTCY;
  if (currentStats.health <= 0) return ENDING_EVENTS.HOSPITAL;
  
  // 2. Check Victory Conditions
  if (currentStats.turn > currentStats.maxTurn) return ENDING_EVENTS.RETIREMENT;

  // 3. Random Event Logic
  // Simple random for now, could be improved with weights based on stats
  const pool = RANDOM_EVENTS;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return { ...pool[randomIndex], id: pool[randomIndex].id + '_' + Date.now() }; // Ensure unique ID for React keys
};
