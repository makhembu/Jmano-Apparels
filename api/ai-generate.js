import { createClient } from '@supabase/supabase-js';

const SYSTEM_PROMPTS = {
  seo: 'You are an SEO expert. Generate concise, compelling meta titles and descriptions optimized for search engines. Return ONLY the generated text with no quotes or extra explanation.',
  'blog-title': 'You are a content strategist for Jambo Apparels, a Christian streetwear brand. Generate catchy, engaging blog post titles. Return ONLY the title text with no quotes or extra explanation.',
  'blog-polish': 'You are a professional editor for a Christian streetwear brand called Jambo Apparels. Improve the given text for grammar, flow, engagement, and readability while keeping the original meaning and tone. CRITICAL: Preserve ALL special elements exactly as they appear — this includes video embeds (YouTube/Vimeo URLs or iframe tags), markdown formatting (#, **, *, etc.), product references ( @[product:ID] ), image tags, HTML tags, and any other special syntax. Only improve the regular text around these elements. Return the complete polished text with all special elements intact.',
  'blog-content': 'You are a blog writer for Jambo Apparels, a Christian streetwear brand that threads scripture into modern fashion. Write engaging, warm blog content that connects faith with fashion. Keep paragraphs short. Use a conversational but respectful tone. Return ONLY the content with no quotes or extra explanation.',
  'product-title': 'You are a product naming specialist for Jambo Apparels, a Christian streetwear brand. Generate clear, appealing product names. Return ONLY the product name with no quotes or extra explanation.',
  'product-desc': 'You are a product copywriter for Jambo Apparels, a Christian streetwear brand. Write compelling product descriptions that highlight quality, faith-based inspiration, and style. Return ONLY the description with no quotes or extra explanation.',
  'product-polish': 'You are a product copy editor for a Christian streetwear brand called Jambo Apparels. Improve the given product text for grammar, flow, clarity, and persuasiveness while keeping the original meaning. Return ONLY the polished text with no quotes or extra explanation.',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, type = 'seo' } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

  try {
    let apiKey = process.env.OPENCODE_API_KEY;

    if (!apiKey) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase.from('app_settings').select('opencode_api_key').eq('id', 1).single();
        if (data?.opencode_api_key) apiKey = data.opencode_api_key;
      }
    }

    if (!apiKey) apiKey = 'sk-SkLo09nzZD0W8POBIoXZBZ4KRMyE7jZICTVfMegRHR1mF0PvhqKGZRQK4uUcjHV2';

    const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.seo;

    const response = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'big-pickle',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenCode API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || '';

    return res.status(200).json({ text: text.trim() });
  } catch (error) {
    console.error('AI Generate Error:', error);
    return res.status(500).json({ error: error.message || 'AI generation failed.' });
  }
}
