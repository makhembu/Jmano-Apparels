
import { GoogleGenAI, Chat } from "@google/genai";
import { functionDeclarations } from './tools';

const MODEL_NAME = 'gemini-2.5-pro';

export class GeminiClient {
  constructor() {}

  isAvailable(apiKey?: string): boolean {
    return !!(apiKey || process.env.API_KEY);
  }

  createChat(systemInstruction: string, apiKey?: string): Chat | null {
    const key = apiKey || process.env.API_KEY;
    if (!key) {
      console.warn("Gemini API Key is missing. Copilot will be disabled.");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey: key });
    
    return ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations }],
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
  }
}

export const geminiClient = new GeminiClient();
