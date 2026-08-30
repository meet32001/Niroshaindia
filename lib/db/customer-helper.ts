import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function getAuthenticatedCustomer() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('[CUSTOMER HELPER ERROR]: Missing Supabase credentials');
    return null;
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  const { data: customer, error } = await supabaseAdmin
    .from('customers')
    .select('id, clerk_user_id, email, first_name, last_name, phone')
    .eq('clerk_user_id', userId)
    .single();

  if (error || !customer) {
    console.warn('[CUSTOMER HELPER NOTICE]: Customer record not found for userId:', userId);
    return null;
  }

  return { customer, supabaseAdmin };
}
