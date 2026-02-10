
import { GoogleGenAI, Type } from "@google/genai";

// استخدام حماية للتأكد من وجود apiKey قبل البدء
const getAIClient = () => {
  const apiKey = (window as any).process?.env?.API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

export async function suggestMetaData(url: string) {
  try {
    const ai = getAIClient();
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
