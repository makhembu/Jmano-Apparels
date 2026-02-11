import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from './_lib/auth.js';

// Define tools server-side (must match client-side expectations)
const functionDeclarations = [
  {
    name: 'navigate',
    description: 'Navigate to a specific page or record. For detail pages, the path must include the ID (e.g., "/admin/orders/123").',
    parameters: {
      type: 'OBJECT',
      properties: {
        path: { type: 'STRING', description: 'The full destination route starting with /admin.' },
        tab: { type: 'STRING', description: 'The specific tab ID to open.' }
      },
      required: ['path']
    }
  },
  {
    name: 'getDetailedInventoryReport',
    description: 'Get a full breakdown of products, stock levels, and historical sales performance.',
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: 'getLatestOrder',
    description: 'Fetches the most recent order record.',
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: 'getDashboardStats',
    description: 'Retrieve store performance KPIs.',
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: 'getLiveTraffic',
    description: 'Get real-time data about who is currently on the website.',
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: 'highlightElement',
    description: 'Visually pulse a gold ring around a specific UI element.',
    parameters: {
      type: 'OBJECT',
      properties: {
        elementId: { type: 'STRING', description: 'The DOM ID of the target element.' }
      },
      required: ['elementId']
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

  // SECURITY: Ensure only authenticated Admins can access this endpoint
  try {
    await verifyAuth(req, true);
  } catch (e) {
    return res.status(403).json({ error: "Unauthorized: Admin access required for Copilot." });
  }

  const { history, message, pageContext } = req.body;

  try {
    // 1. Get API Key (Env or DB)
    let apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        // Use service role to fetch settings securely
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data } = await supabase.from('app_settings').select('gemini_api_key').eq('id', 1).single();
            if (data?.gemini_api_key) apiKey = data.gemini_api_key;
        }
    }

    if (!apiKey) {
        return res.status(400).json({ error: "Gemini API Key not configured on server." });
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-3-flash-preview';

    // 2. Prepare History for SDK
    // The SDK expects history without the very last user message, which is passed in generateContent
    const validHistory = (history || []).map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // 3. Generate Content
    const response = await ai.models.generateContent({
        model: model,
        contents: [...validHistory, { role: 'user', parts: [{ text: message }] }],
        config: {
            systemInstruction: generateSystemPrompt(pageContext),
            tools: [{ functionDeclarations }],
        }
    });

    const functionCalls = response.functionCalls; 
    const text = response.text;

    return res.status(200).json({ 
        text, 
        functionCalls 
    });

  } catch (error) {
    console.error("AI API Error:", error);
    return res.status(500).json({ error: error.message || "An error occurred processing the request." });
  }
}