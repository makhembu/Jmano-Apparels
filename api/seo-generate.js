import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, apiKey: clientApiKey } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

  try {
    let apiKey = process.env.OPENCODE_API_KEY;

    if (!apiKey) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase.from('app_settings').select('opencode_api_key, gemini_api_key').eq('id', 1).single();
        if (data?.opencode_api_key) apiKey = data.opencode_api_key;
      }
    }

    if (!apiKey) apiKey = 'sk-SkLo09nzZD0W8POBIoXZBZ4KRMyE7jZICTVfMegRHR1mF0PvhqKGZRQK4uUcjHV2';

    const response = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'big-pickle',
        messages: [
          { role: 'system', content: 'You are an SEO expert. Generate concise, compelling meta titles and descriptions optimized for search engines. Return ONLY the generated text with no quotes or extra explanation.' },
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
    console.error('SEO Generate Error:', error);
    return res.status(500).json({ error: error.message || 'AI generation failed.' });
  }
}
