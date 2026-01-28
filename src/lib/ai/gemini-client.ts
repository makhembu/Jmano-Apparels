
import { GoogleGenAI, Chat } from "@google/genai";
import { functionDeclarations } from './tools';

// Using gemini-3-pro-preview for higher reasoning quality and nuance handling in admin tasks
const MODEL_NAME = 'gemini-3-pro-preview';

export class GeminiClient {
  constructor() {}

  isAvailable(): boolean {
    return !!process.env.API_KEY;
  }

  createChat(systemInstruction: string): Chat | null {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;

    // FIX: Instantiate GoogleGenAI right before making an API call to ensure it always uses the most up-to-date API key
    const ai = new GoogleGenAI({ apiKey });
    
    return ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations }],
        // Thinking budget added for gemini-3 series to improve planning and reasoning
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
  }
}

export const geminiClient = new GeminiClient();
