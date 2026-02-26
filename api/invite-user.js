// api/invite-user.js - Send org invite via Supabase magic link

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, orgId, role, teamRole } = req.body;

  if (!email || !orgId) {
    return res.status(400).json({ error: 'Email and orgId are required' });
  }

  // Service role client — never expose this key client-side
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        org_id: orgId,
        role: role || 'member',
        team_role: teamRole || 'member'
      }
    });

    if (error) throw error;

    console.log('Invite sent to:', email, 'for org:', orgId);
    return res.status(200).json({ success: true, user: data.user });

  } catch (error) {
    console.error('Invite error:', error);

    // Handle already-invited or already-registered users gracefully
    if (error.message?.includes('already registered')) {
      return res.status(409).json({ error: 'A user with this email already exists. They can log in directly.' });
    }

    return res.status(500).json({ error: error.message || 'Failed to send invite' });
  }
}
