export interface PincodeLookupResult {
  isValid: boolean;
  city?: string;
  state?: string;
  district?: string;
  error?: string;
}

export async function verifyIndianPincode(pincode: string): Promise<PincodeLookupResult> {
  const cleanPin = pincode.trim();
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return { isValid: false, error: 'PIN code must be a valid 6-digit number.' };
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      next: { revalidate: 86400 }, // Cache valid lookups for 24 hours
    });

    if (!res.ok) {
      return { isValid: false, error: 'Postal verification service unreachable.' };
    }

    const data = await res.json();
    if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      const postOffice = data[0].PostOffice[0];
      return {
        isValid: true,
        city: postOffice.District || postOffice.Block || postOffice.Name,
        state: postOffice.State,
        district: postOffice.District,
      };
    }

    return { isValid: false, error: 'Invalid PIN code. No postal office found in India.' };
  } catch (err) {
    console.error('PIN code lookup failed:', err);
    return { isValid: false, error: 'Failed to verify PIN code.' };
  }
}
