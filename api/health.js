
export default async function handler(req, res) {
  // Use VITE_ variables if available, or fall back to standard
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ status: 'error', message: 'Missing environment variables' });
  }

  try {
    // Simple fetch to Supabase REST API (lighter than initializing the full client)
    const response = await fetch(`${supabaseUrl}/rest/v1/app_settings?select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (response.ok) {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    } else {
      const text = await response.text();
      return res.status(503).json({ status: 'error', message: 'Database unreachable', details: text });
    }
  } catch (e) {
    return res.status(500).json({ status: 'error', message: e.message });
  }
}
