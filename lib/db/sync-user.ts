import { supabaseAdmin } from '@/lib/supabase/admin';
import { redactEmail } from '@/lib/utils';

export async function syncUserToSupabase(user: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}) {

  const { data, error } = await supabaseAdmin
    .from('customers')
    .upsert(
      {
        clerk_user_id: user.id,
        email: user.email,
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        phone: user.phone || null,
        is_active: true,
      },
      { onConflict: 'clerk_user_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('[DATABASE SYNC ERROR]:', error);
    throw error;
  }

  console.log('[DATABASE SYNC SUCCESS]: Customer saved ->', redactEmail(data.email), `(${data.clerk_user_id})`);
  return data;
}
