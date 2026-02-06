import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 1. Secure the endpoint with a secret token
  const authToken = (req.headers.get('authorization') || '').split('Bearer ').pop();
  if (!process.env.CRON_SECRET || authToken !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // 2. Initialize Supabase Admin Client
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Cron] Server configuration error: Missing Supabase credentials.');
    return res.status(500).json({ error: 'Server configuration error now.' });
  }
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 3. Find and update scheduled posts
    const now = new Date().toISOString();
    
    // First, select the posts to be updated to get their count for the log
    const { data: postsToPublish, error: selectError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title')
      .eq('status', 'draft')
      .not('scheduled_for', 'is', null)
      .lte('scheduled_for', now);

    if (selectError) {
      throw selectError;
    }

    if (!postsToPublish || postsToPublish.length === 0) {
      return res.status(200).json({ success: true, message: 'No posts to publish.' });
    }

    const postIds = postsToPublish.map(p => p.id);

    // Then, perform the update on the identified posts
    const { error: updateError } = await supabaseAdmin
      .from('blog_posts')
      .update({ status: 'published', scheduled_for: null, updated_at: now })
      .in('id', postIds);

    if (updateError) {
      throw updateError;
    }

    console.log(`[Cron] Published ${postsToPublish.length} post(s):`, postsToPublish.map(p => p.title).join(', '));
    
    // 4. Respond with success
    return res.status(200).json({ 
      success: true, 
      publishedCount: postsToPublish.length 
    });

  } catch (error) {
    console.error('[Cron] Error publishing posts:', error.message);
    return res.status(500).json({ error: 'Failed to publish posts.', details: error.message });
  }
}
