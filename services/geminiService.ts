import { GoogleGenAI, Type } from "@google/genai";

// Guideline: Always use a named parameter for the API key and process.env.API_KEY directly.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export async function suggestMetaData(url: string) {
  try {
    // Guideline: Call generateContent with the model name and contents in one step.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على هذا الرابط ${url}، اقترح عنواناً مناسباً وتصنيفاً منطقياً. رد بصيغة JSON فقط تحتوي على 'title' و 'category'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'عنوان مقترح للرابط.',
            },
            category: {
              type: Type.STRING,
              description: 'تصنيف منطقي مقترح.',
            },
          },
          required: ["title", "category"],
          propertyOrdering: ["title", "category"],
        },
      },
    });
    
    // Guideline: Access text via .text property, not .text().
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return null;
  }
}