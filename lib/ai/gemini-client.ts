import { GoogleGenAI, Chat, Content } from "@google/genai";
import { functionDeclarations } from './tools';

export const AVAILABLE_MODELS = [
  'gemini-2.5-pro',
  'gemini-3-flash-preview',
  'gemini-2.5-flash'
];

export class GeminiClient {
  constructor() {}

  isAvailable(apiKey?: string): boolean {
    return !!(apiKey || process.env.API_KEY);
  }

  getFallbackModel(currentModel: string): string | null {
    const index = AVAILABLE_MODELS.indexOf(currentModel);
    if (index === -1 || index === AVAILABLE_MODELS.length - 1) {
      return null;
    }
    return AVAILABLE_MODELS[index + 1];
  }

  createChat(
    systemInstruction: string, 
    apiKey?: string, 
    model: string = AVAILABLE_MODELS[0],
    history: Content[] = []
  ): Chat | null {
    const key = apiKey || process.env.API_KEY;
    if (!key) {
      console.warn("Gemini API Key is missing. Copilot will be disabled.");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey: key });
    
    // Thinking config is primarily for 2.0/2.5 Pro models
    let thinkingConfig = undefined;
    if (model.includes('pro') && !model.includes('1.5')) {
        thinkingConfig = { thinkingBudget: 2048 };
    }

    return ai.chats.create({
      model: model,
      history: history,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations }],
        thinkingConfig
      }
    });
  }
}

export const geminiClient = new GeminiClient();