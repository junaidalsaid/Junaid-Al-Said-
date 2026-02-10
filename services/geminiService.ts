
import { GoogleGenAI, Type } from "@google/genai";
import { DailyInsight, HijriDate } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDailyInsight(hijri: HijriDate): Promise<DailyInsight> {
  const prompt = `Provide a cute, short daily reflection or fun fact for the Arabic month of ${hijri.monthName}, Hijri Day ${hijri.day}. 
  The theme should be positive, educational, and English language. Keep it under 50 words. 
  Include a relevant emoji.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, description: "A catchy short title" },
            content: { type: Type.STRING, description: "The reflection text" },
            emoji: { type: Type.STRING, description: "A cute single emoji" },
          },
          required: ["topic", "content", "emoji"],
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      topic: "Luna Reflection",
      content: `Wishing you a peaceful ${hijri.monthName} day. Every moon cycle brings new beginnings.`,
      emoji: "🌙"
    };
  }
}
