'use server';

import { z } from 'zod';
import { getAuthenticatedCustomer } from '@/lib/db/customer-helper';

export const addressSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  street_address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(5, 'Phone number is required'),
  is_default_shipping: z.boolean().default(false),
  is_default_billing: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export async function getUserAddresses() {
  try {
    const authData = await getAuthenticatedCustomer();
    if (!authData) {
      return { success: false, error: 'Unauthenticated', addresses: [] };
    }

    const { customer, supabaseAdmin } = authData;

    const { data: addresses, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('customer_id', customer.id)
      .order('is_default_shipping', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET ADDRESSES ERROR]:', error);
      return { success: false, error: error.message, addresses: [] };
    }

    return { success: true, addresses: addresses || [] };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch addresses';
    return { success: false, error: errorMessage, addresses: [] };
  }
}

export async function saveAddress(rawPayload: AddressInput) {
  try {
    const authData = await getAuthenticatedCustomer();
    if (!authData) {
      return { success: false, error: 'Unauthenticated' };
    }

    const { customer, supabaseAdmin } = authData;

    const validated = addressSchema.parse(rawPayload);

    // If setting as default shipping, unset previous default shipping for this customer
    if (validated.is_default_shipping) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default_shipping: false })
        .eq('customer_id', customer.id);
    }

    // If setting as default billing, unset previous default billing for this customer
    if (validated.is_default_billing) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default_billing: false })
        .eq('customer_id', customer.id);
    }

    const addressData = {
      customer_id: customer.id,
      full_name: validated.full_name,
      street_address: validated.street_address,
      city: validated.city,
      state: validated.state,
      postal_code: validated.postal_code,
      country: validated.country,
      phone: validated.phone,
      is_default_shipping: validated.is_default_shipping,
      is_default_billing: validated.is_default_billing,
    };

    let result;
    if (validated.id) {
      // Update existing address strictly owned by customer
      result = await supabaseAdmin
        .from('addresses')
        .update(addressData)
        .eq('id', validated.id)
        .eq('customer_id', customer.id)
        .select()
        .single();
    } else {
      // Insert new address
      result = await supabaseAdmin
        .from('addresses')
        .insert(addressData)
        .select()
        .single();
    }

    if (result.error) {
      console.error('[SAVE ADDRESS ERROR]:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, address: result.data };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || 'Invalid input data' };
    }
    const errorMessage = err instanceof Error ? err.message : 'Failed to save address';
    return { success: false, error: errorMessage };
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const authData = await getAuthenticatedCustomer();
    if (!authData) {
      return { success: false, error: 'Unauthenticated' };
    }

    const { customer, supabaseAdmin } = authData;

    const { error } = await supabaseAdmin
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('customer_id', customer.id);

    if (error) {
      console.error('[DELETE ADDRESS ERROR]:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete address';
    return { success: false, error: errorMessage };
  }
}
