const OPENCODE_BASE_URL = 'https://opencode.ai/zen/v1';

export const AVAILABLE_MODELS = [
  'big-pickle',
  'deepseek-v4-flash-free',
  'mimo-v2.5-free',
  'north-mini-code-free',
];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: string;
  }>;
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export class OpenCodeClient {
  private baseUrl = OPENCODE_BASE_URL;

  isAvailable(apiKey?: string): boolean {
    return !!(apiKey);
  }

  getFallbackModel(currentModel: string): string | null {
    const index = AVAILABLE_MODELS.indexOf(currentModel);
    if (index === -1 || index === AVAILABLE_MODELS.length - 1) {
      return null;
    }
    return AVAILABLE_MODELS[index + 1];
  }

  async chat(
    messages: ChatMessage[],
    tools: ToolDefinition[],
    apiKey: string,
    model: string = AVAILABLE_MODELS[0],
  ): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenCode API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async generateContent(
    prompt: string,
    apiKey: string,
    model: string = AVAILABLE_MODELS[0],
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenCode API error: ${response.status} - ${error}`);
    }

    const data: ChatCompletionResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

export const openCodeClient = new OpenCodeClient();
