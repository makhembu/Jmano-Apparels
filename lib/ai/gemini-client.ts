
import { GoogleGenAI, Chat } from "@google/genai";
import { functionDeclarations } from './tools';

// Using gemini-3-pro-preview for higher reasoning quality and nuance handling in admin tasks
const MODEL_NAME = 'gemini-3-pro-preview';

/**
 * Safely retrieves environment variables in both browser and node contexts.
 * This adheres to the requirement of using process.env.API_KEY while
 * preventing ReferenceErrors in production browser environments.
 */
const getSafeApiKey = (): string | undefined => {
  try {
    // 1. Check for process.env (mapped by bundlers like Vite/Webpack at build time)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // 2. Fallback to Vite-specific env if available (common in Vercel/Vite setups)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
      return (import.meta as any).env.VITE_API_KEY;
    }
  } catch (e) {
    return undefined;
  }
  return undefined;
};

export class GeminiClient {
  constructor() {}

  isAvailable(): boolean {
    return !!getSafeApiKey();
  }

  createChat(systemInstruction: string): Chat | null {
    const apiKey = getSafeApiKey();
    if (!apiKey) {
      console.warn("Gemini API Key is missing. Please configure API_KEY in your environment.");
      return null;
    }

    // Instantiate GoogleGenAI right before making an API call to ensure it always uses the most up-to-date API key
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
