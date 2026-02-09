
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
       console.error("Guest Auth: Missing Service Role Key");
       return res.status(500).json({ error: "Server configuration error" });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // 1. Check if user exists
    const { data: { users }, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    // Efficient lookup - in production with many users, getting by ID/Email specific API is better 
    // but listUsers doesn't support filter by email directly in older versions, 
    // newer versions allow supabaseAdmin.auth.admin.getUserByEmail(email)
    
    let existingUser = null;
    try {
        const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email);
        if (!error && data.user) {
            existingUser = data.user;
        }
    } catch (e) {
        // Fallback or ignore if not supported
    }

    if (existingUser) {
        // User exists, link order to them but don't send password
        return res.status(200).json({ 
            success: true, 
            userId: existingUser.id,
            isNew: false 
        });
    }

    // 2. Create new user
    const password = crypto.randomBytes(8).toString('hex'); // 16 char secure password
    
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm for immediate access
        user_metadata: { name: name || 'Valued Customer' }
    });

    if (createError) {
        throw createError;
    }

    // 3. Ensure profile exists in public table (Trigger usually handles this, but robust to do here)
    const { error: profileError } = await supabaseAdmin
        .from('users')
        .upsert({
            id: newUser.user.id,
            email: email,
            name: name || 'Valued Customer',
            role: 'user'
        });

    if (profileError) {
        console.warn("Profile creation warning:", profileError);
    }

    return res.status(200).json({
        success: true,
        userId: newUser.user.id,
        password: password,
        isNew: true
    });

  } catch (error) {
    console.error("Guest Auth Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
