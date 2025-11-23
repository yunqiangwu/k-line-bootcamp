import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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