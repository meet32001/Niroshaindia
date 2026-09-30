import { headers } from 'next/headers';

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

/**
 * Lightweight in-memory rate limiter for server actions.
 */
export function checkRateLimit(
  scope: string,
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 30;
  const now = Date.now();
  const key = `${scope}:${identifier || 'unknown'}`;

  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now >= bucket.resetTime) {
    const resetTime = now + windowMs;
    rateLimitBuckets.set(key, { count: 1, resetTime });
    return { success: true, remaining: Math.max(0, max - 1), resetTime };
  }

  bucket.count += 1;
  const success = bucket.count <= max;

  rateLimitBuckets.set(key, bucket);

  return {
    success,
    remaining: Math.max(0, max - bucket.count),
    resetTime: bucket.resetTime,
  };
}

/**
 * Resolve the best-effort client IP from request headers.
 */
export async function getClientIp(): Promise<string> {
  try {
    const requestHeaders = await headers();

    const forwardedFor = requestHeaders.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0]?.trim() || 'unknown';
    }

    return (
      requestHeaders.get('x-real-ip') ||
      requestHeaders.get('cf-connecting-ip') ||
      requestHeaders.get('x-client-ip') ||
      'unknown'
    );
  } catch {
    return 'unknown';
  }
}
