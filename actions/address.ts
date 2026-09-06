'use server';

import { z } from 'zod';
import { getAuthenticatedCustomer } from '@/lib/db/customer-helper';
import { addressSchema, AddressInput } from '@/lib/validations/address';

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
      .order('is_default', { ascending: false })
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

    // If setting as default, unset previous default for this customer
    if (validated.is_default) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', customer.id);
    }

    const addressData = {
      customer_id: customer.id,
      recipient_name: validated.recipient_name,
      address_line1: validated.address_line1,
      address_line2: validated.address_line2 || '',
      city: validated.city,
      state: validated.state,
      postal_code: validated.postal_code,
      country: validated.country || 'India',
      phone: validated.phone,
      is_default: validated.is_default,
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
