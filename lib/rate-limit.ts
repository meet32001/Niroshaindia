import { headers } from "next/headers";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStores = new Map<string, Map<string, RateLimitRecord>>();

export interface RateLimitOptions {
  windowMs: number; // Duration of sliding window in milliseconds
  max: number;      // Maximum requests permitted within the window
}

/**
 * In-memory sliding window rate limiter for Server Actions and API routes.
 * Identifies clients using IP detection headers.
 */
export function checkRateLimit(
  namespace: string,
  identifier: string,
  options: RateLimitOptions
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let store = rateLimitStores.get(namespace);
  if (!store) {
    store = new Map<string, RateLimitRecord>();
    rateLimitStores.set(namespace, store);
  }

  // Periodic cleanup of expired rate limit buckets
  if (store.size > 5000) {
    for (const [key, record] of store.entries()) {
      if (record.resetAt <= now) {
        store.delete(key);
      }
    }
  }

  const existing = store.get(identifier);

  if (!existing || existing.resetAt <= now) {
    store.set(identifier, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      success: true,
      remaining: options.max - 1,
      resetAt: now + options.windowMs,
    };
  }

  if (existing.count >= options.max) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: options.max - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Resolves the client's IP address from incoming Next.js request headers.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {
    // If called outside server request scope
  }
  return "127.0.0.1";
}
