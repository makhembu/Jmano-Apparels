
import { GoogleGenAI, Chat } from "@google/genai";
import { functionDeclarations } from './tools';

// Using gemini-3-pro-preview for higher reasoning quality and nuance handling
const MODEL_NAME = 'gemini-3-pro-preview';

export class GeminiClient {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.API_KEY) {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
        console.warn('Gemini API Key missing. Copilot disabled.');
    }
  }

  isAvailable(): boolean {
    return !!process.env.API_KEY;
  }

  createChat(systemInstruction: string): Chat | null {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;

    this.ai = new GoogleGenAI({ apiKey });
    
    return this.ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations }],
        // Thinking budget added for gemini-3 series to improve planning
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
  }
}

export const geminiClient = new GeminiClient();
