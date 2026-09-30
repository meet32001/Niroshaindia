import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function getAuthenticatedCustomer() {
  const { userId } = await auth();
  if (!userId) return null;

  // 1. Try finding customer by clerk_user_id
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id, clerk_user_id, email, first_name, last_name, phone')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (customer) {
    return { customer, supabaseAdmin };
  }

  // 2. If not found by clerk_user_id, resolve details via Clerk currentUser() and link/upsert
  try {
    const user = await currentUser();
    if (!user) return null;

    const email =
      user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress;

    if (!email) return null;

    const normalizedEmail = email.trim().toLowerCase();

    // Check if customer exists by email
    const { data: existingByEmail } = await supabaseAdmin
      .from('customers')
      .select('id, clerk_user_id, email, first_name, last_name, phone')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingByEmail) {
      await supabaseAdmin
        .from('customers')
        .update({ clerk_user_id: userId })
        .eq('id', existingByEmail.id);
      return { customer: { ...existingByEmail, clerk_user_id: userId }, supabaseAdmin };
    }

    // Auto-create customer row for authenticated user
    const { data: newCustomer, error: insertErr } = await supabaseAdmin
      .from('customers')
      .insert({
        clerk_user_id: userId,
        email: normalizedEmail,
        first_name: user.firstName || 'Customer',
        last_name: user.lastName || '',
        phone: user.phoneNumbers?.[0]?.phoneNumber || null,
        is_active: true,
      })
      .select('id, clerk_user_id, email, first_name, last_name, phone')
      .single();

    if (insertErr || !newCustomer) {
      console.error('[CUSTOMER HELPER INSERT ERROR]:', insertErr);
      return null;
    }

    return { customer: newCustomer, supabaseAdmin };
  } catch (err) {
    console.error('[CUSTOMER HELPER RESOLUTION ERROR]:', err);
    return null;
  }
}

/**
 * Privacy Compliance & Right to Erasure (DPDP Act / GDPR)
 * Anonymizes customer profile data and addresses while preserving transactional history
 * required for statutory 7-year GST/tax accounting.
 */
export async function anonymizeCustomerData(customerId: number | string) {
  const anonymizedEmail = `anonymized_${customerId}_${Date.now()}@redacted.invalid`;

  // 1. Redact profile PII in customers table
  await supabaseAdmin
    .from('customers')
    .update({
      email: anonymizedEmail,
      first_name: 'Redacted',
      last_name: 'Customer',
      phone: null,
      is_active: false,
    })
    .eq('id', customerId);

  // 2. Anonymize shipping addresses linked to customer
  await supabaseAdmin
    .from('addresses')
    .update({
      recipient_name: 'Redacted Customer',
      address_line1: '[REDACTED_SHIPPING_DESTINATION]',
      address_line2: null,
      phone: '0000000000',
    })
    .eq('customer_id', customerId);

  // 3. Redact contact inquiries linked to customer email or ID
  await supabaseAdmin
    .from('contact_inquiries')
    .update({
      name: 'Redacted Customer',
      email: anonymizedEmail,
      phone: null,
      message: '[REDACTED_UPON_PRIVACY_REQUEST]',
    })
    .eq('customer_id', customerId);

  return { success: true };
}
