// api/invite-user.js - Send org invite, handles both new and existing users

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, orgId, role, teamRole } = req.body;

  if (!email || !orgId) {
    return res.status(400).json({ error: 'Email and orgId are required' });
  }

  // Service role client — server-side only, never expose to client
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Check if user already exists
    const { data: existingUser, error: lookupError } = await supabase.auth.admin.getUserByEmail(email);

    if (existingUser?.user) {
      // User exists — check if already in this org
      const { data: existingMembership } = await supabase
        .from('user_organizations')
        .select('id')
        .eq('user_id', existingUser.user.id)
        .eq('org_id', orgId)
        .single();

      if (existingMembership) {
        return res.status(409).json({ error: 'This user is already a member of your organization.' });
      }

      // Add them to the org directly
      const { error: insertError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: existingUser.user.id,
          org_id: orgId,
          role: role || 'member',
          team_role: teamRole || 'member',
          is_current: true
        });

      if (insertError) throw insertError;

      console.log('Existing user added to org:', email, orgId);
      return res.status(200).json({ success: true, existing: true });

    } else {
      // New user — send magic link invite with org metadata
      const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          org_id: orgId,
          role: role || 'member',
          team_role: teamRole || 'member'
        }
      });

      if (inviteError) throw inviteError;

      console.log('Invite sent to new user:', email, orgId);
      return res.status(200).json({ success: true, existing: false });
    }

  } catch (error) {
    console.error('Invite error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send invite' });
  }
}
