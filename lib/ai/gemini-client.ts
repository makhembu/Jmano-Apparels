
import { GoogleGenAI, Chat } from "@google/genai";
import { functionDeclarations } from './tools';

// Using gemini-3-pro-preview for higher reasoning quality and nuance handling in admin tasks
const MODEL_NAME = 'gemini-3-pro-preview';

/**
 * Safely retrieves environment variables in both browser and node contexts.
 */
const getSafeEnvApiKey = (): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
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

  /**
   * Checks if an API key is available either from settings or env
   */
  isAvailable(settingsKey?: string): boolean {
    return !!(settingsKey || getSafeEnvApiKey());
  }

  /**
   * Creates a new chat session using the provided API key.
   * If no key is provided, it falls back to environment variables.
   */
  createChat(systemInstruction: string, customApiKey?: string): Chat | null {
    const apiKey = customApiKey || getSafeEnvApiKey();
    
    if (!apiKey) {
      console.warn("Gemini API Key is missing. Please configure it in App Settings or environment.");
      return null;
    }

    // Instantiate GoogleGenAI with the provided key
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
