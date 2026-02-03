
import { GoogleGenAI, Chat } from "@google/genai";
import { functionDeclarations } from './tools';
import { SECRETS } from '../../src/secrets';

// ============================================================================
// MODEL CONFIGURATION WITH FALLBACK CHAIN
// ============================================================================

interface ModelConfig {
  name: string;
  displayName: string;
  description: string;
  priority: number;
  supportsThinking?: boolean;
}

const MODEL_FALLBACK_CHAIN: ModelConfig[] = [
  {
    name: 'gemini-3-flash-preview',
    displayName: 'Gemini 3 Flash',
    description: 'Most balanced model for speed, scale, and frontier intelligence',
    priority: 1,
    supportsThinking: true
  },
  {
    name: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    description: 'Best price-performance for agentic tasks and thinking',
    priority: 2,
    supportsThinking: true
  },
  {
    name: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    description: 'Advanced thinking model for complex reasoning',
    priority: 3,
    supportsThinking: true
  },
  {
    name: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash-Lite',
    description: 'Ultra-fast model optimized for cost-efficiency',
    priority: 4,
    supportsThinking: true
  }
];

// ============================================================================
// GEMINI CLIENT WITH SMART FALLBACK
// ============================================================================

/**
 * Safely retrieves environment variables in both browser and node contexts.
 */
const getSafeEnvApiKey = (): string | undefined => {
  try {
    // 1. Check Process Env
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // 2. Check Vite Env
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
      return (import.meta as any).env.VITE_API_KEY;
    }
    // 3. Check Local Secrets
    if (SECRETS && SECRETS.GEMINI_API_KEY) {
      return SECRETS.GEMINI_API_KEY;
    }
  } catch (e) {
    return undefined;
  }
  return undefined;
};

export class GeminiClient {
  private currentModel: ModelConfig | null = null;
  private failedModels: Set<string> = new Set();
  private lastError: string | null = null;

  constructor() {
    // Auto-detect best model on first use
  }

  /**
   * Checks if an API key is available either from settings, env, or secrets
   */
  isAvailable(settingsKey?: string): boolean {
    return !!(settingsKey || getSafeEnvApiKey());
  }

  /**
   * Get current model information
   */
  getCurrentModel(): ModelConfig | null {
    return this.currentModel;
  }

  /**
   * Get last error message
   */
  getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Create a chat instance with automatic fallback
   */
  createChat(systemInstruction: string, customApiKey?: string): Chat | null {
    const apiKey = customApiKey || getSafeEnvApiKey();
    if (!apiKey) {
      this.lastError = 'API_KEY not configured';
      console.error('❌ Gemini API key missing. Set process.env.API_KEY, src/secrets.ts, or configure in App Settings.');
      return null;
    }

    // Try current model first if already established
    if (this.currentModel) {
      try {
        return this.createChatWithModel(apiKey, this.currentModel, systemInstruction);
      } catch (error) {
        console.warn(`⚠️ ${this.currentModel.displayName} failed, trying fallback...`);
        this.failedModels.add(this.currentModel.name);
        this.currentModel = null;
        this.lastError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Try each model in fallback chain
    for (const model of MODEL_FALLBACK_CHAIN) {
      if (this.failedModels.has(model.name)) continue;

      try {
        const chat = this.createChatWithModel(apiKey, model, systemInstruction);
        this.currentModel = model;
        console.log(`✓ Jambo Copilot using: ${model.displayName}`);
        this.lastError = null;
        return chat;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`✗ ${model.displayName} unavailable: ${errorMsg}`);
        this.failedModels.add(model.name);
        this.lastError = errorMsg;
      }
    }

    // All models failed
    console.error('❌ All Gemini models unavailable. Check your API key and quota.');
    this.lastError = 'All Gemini models exhausted. Possible reasons: Invalid API key, quota exceeded, or service outage.';
    return null;
  }

  /**
   * Create chat with specific model
   */
  private createChatWithModel(
    apiKey: string,
    model: ModelConfig,
    systemInstruction: string
  ): Chat {
    // Instantiate fresh AI instance to pick up latest API key
    const ai = new GoogleGenAI({ apiKey });

    const config: any = {
      systemInstruction,
      tools: [{ functionDeclarations }]
    };

    // Add thinking config for models that support it
    if (model.supportsThinking) {
      config.thinkingConfig = { 
        thinkingBudget: model.name === 'gemini-2.5-pro' ? 8000 : 4000 
      };
    }

    return ai.chats.create({
      model: model.name,
      config
    });
  }

  /**
   * Reset failed models list (useful after fixing API key or connectivity)
   */
  resetFallbacks(): void {
    this.failedModels.clear();
    this.currentModel = null;
    this.lastError = null;
    console.log('🔄 Gemini fallback chain reset');
  }

  /**
   * Get status information for debugging
   */
  getStatus(): {
    isAvailable: boolean;
    currentModel: string | null;
    modelCode: string | null;
    failedModels: string[];
    lastError: string | null;
  } {
    return {
      isAvailable: this.isAvailable(),
      currentModel: this.currentModel?.displayName || null,
      modelCode: this.currentModel?.name || null,
      failedModels: Array.from(this.failedModels),
      lastError: this.lastError
    };
  }

  /**
   * Manually set preferred model (bypasses auto-detection)
   */
  setPreferredModel(modelName: string): boolean {
    const model = MODEL_FALLBACK_CHAIN.find(m => m.name === modelName);
    if (!model) {
      console.error(`❌ Model "${modelName}" not found in fallback chain`);
      return false;
    }

    this.currentModel = model;
    this.failedModels.delete(modelName); // Clear any previous failure
    console.log(`✓ Manually set model to: ${model.displayName}`);
    return true;
  }
}

export const geminiClient = new GeminiClient();

export function getAvailableModels(): ModelConfig[] {
  return MODEL_FALLBACK_CHAIN;
}

export function getModelByName(name: string): ModelConfig | undefined {
  return MODEL_FALLBACK_CHAIN.find(m => m.name === name);
}
