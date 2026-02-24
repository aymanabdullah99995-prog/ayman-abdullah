import { GoogleGenAI, Type } from "@google/genai";

export async function suggestMetaData(url: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على هذا الرابط ${url}، اقترح عنواناً مناسباً وتصنيفاً منطقياً. 
      رد بصيغة JSON فقط تحتوي على 'title' و 'category'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'The suggested title for the link.'
            },
            category: {
              type: Type.STRING,
              description: 'The suggested logical category.'
            }
          },
          required: ["title", "category"]
        }
      }
    });
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return null;
  }
}