import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from './_lib/auth.js';

// OpenAI-compatible tool definitions
const functionDeclarations = [
  {
    type: 'function',
    function: {
      name: 'navigate',
      description: 'Navigate to a specific page or record. For detail pages, the path must include the ID (e.g., "/admin/orders/123").',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The full destination route starting with /admin.' },
          tab: { type: 'string', description: 'The specific tab ID to open.' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getDetailedInventoryReport',
      description: 'Get a full breakdown of products, stock levels, and historical sales performance.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getLatestOrder',
      description: 'Fetches the most recent order record.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getDashboardStats',
      description: 'Retrieve store performance KPIs.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getLiveTraffic',
      description: 'Get real-time data about who is currently on the website.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'highlightElement',
      description: 'Visually pulse a gold ring around a specific UI element.',
      parameters: {
        type: 'object',
        properties: {
          elementId: { type: 'string', description: 'The DOM ID of the target element.' }
        },
        required: ['elementId']
      }
    }
  }
];

// System Prompt Generator
function generateSystemPrompt(context) {
  return `You are a high-nuance administrative partner for Jambo Apparels. You don't just "show" pages; you anticipate needs and execute deep navigation.

Current Context:
Page: ${context?.pageName || 'Unknown'}
Route: ${context?.route || '/'}

## Critical Nuance Rules
1. **The "Latest Invoice" Rule**: If a user asks for their latest invoice, last sale, or to print the recent order:
   - Call \`getLatestOrder()\` to find the ID.
   - Call \`navigate({ path: '/admin/orders/' + orderId })\` immediately.
   - Call \`highlightElement({ elementId: 'btn-print-invoice' })\`.

2. **Tool Chaining**: You can and should call multiple tools in sequence to satisfy a single user request.

3. **Tone**: Nuanced, professional, results-oriented.
`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await verifyAuth(req, true);
  } catch (e) {
    return res.status(403).json({ error: "Unauthorized: Admin access required for Copilot." });
  }

  const { history, message, pageContext } = req.body;

  try {
    let apiKey = process.env.OPENCODE_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data } = await supabase.from('app_settings').select('opencode_api_key, gemini_api_key').eq('id', 1).single();
            if (data?.opencode_api_key) apiKey = data.opencode_api_key;
            else if (data?.gemini_api_key) apiKey = data.gemini_api_key;
        }
    }

    if (!apiKey) {
        return res.status(400).json({ error: "OpenCode API Key not configured on server." });
    }

    const model = 'Big Pickle';
    const baseUrl = 'https://opencode.ai/zen/v1';

    const validHistory = (history || []).map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
    }));

    const messages = [
        { role: 'system', content: generateSystemPrompt(pageContext) },
        ...validHistory,
        { role: 'user', content: message }
    ];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        tools: functionDeclarations,
        tool_choice: 'auto',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenCode API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message;

    return res.status(200).json({ 
        text: assistantMessage?.content || null, 
        functionCalls: assistantMessage?.tool_calls?.map(tc => ({
            name: tc.function.name,
            args: JSON.parse(tc.function.arguments),
            id: tc.id
        })) || null
    });

  } catch (error) {
    console.error("AI API Error:", error);
    return res.status(500).json({ error: error.message || "An error occurred processing the request." });
  }
}
