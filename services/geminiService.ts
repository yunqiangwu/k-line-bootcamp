import { GoogleGenAI } from "@google/genai";
import { StockData, Trade } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Analyze the user's trading performance using Gemini
export const analyzeTradingPerformance = async (
  stockName: string,
  trades: Trade[],
  finalYield: number,
  stockData: StockData[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "AI 教练正在休息 (请配置 API Key 以获取详细点评)";
  }

  try {
    const tradeSummary = trades.map(t => `${t.date}: ${t.type} at ${t.price}`).join('\n');
    const marketTrend = `Start: ${stockData[0].close}, End: ${stockData[stockData.length - 1].close}`;

    const prompt = `
      You are a professional stock trading coach in a game called "K-Line Bootcamp".
      The user traded stock "${stockName}".
      Market Trend: ${marketTrend}
      User's Final Yield: ${finalYield.toFixed(2)}%
      Trade History:
      ${tradeSummary}

      Please provide a brief, witty, and educational comment (max 50 words) on their performance. 
      If they lost money, be encouraging but sharp. If they won, give them a "pro trader" compliment.
      Use Chinese language.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "交易结束！继续加油！";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "网络波动，教练暂时失联。但你的战绩已经记录！";
  }
};

// Generate a random financial quiz question if needed (Dynamic expansion)
export const generateDailyTip = async (): Promise<string> => {
  if (!process.env.API_KEY) return "记住：顺势而为，止损第一。";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give me a one-sentence profound tip about technical analysis in stock trading. Chinese.",
    });
    return response.text || "顺势而为。";
  } catch (e) {
    return "多看少动，等待机会。";
  }
};
