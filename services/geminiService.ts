
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function suggestMetaData(url: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على هذا الرابط ${url}، اقترح عنواناً مناسباً وتصنيفاً منطقياً. 
      رد بصيغة JSON فقط تحتوي على 'title' و 'category'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["title", "category"]
        }
      }
    });
    
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return null;
  }
}
