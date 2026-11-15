export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

interface BucketEntry {
  count: number;
  resetAtMs: number;
}

/**
 * Lightweight fixed-window per-IP rate limiter with bounded bucket eviction.
 */
export class FixedWindowRateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxEntries: number;
  private readonly buckets = new Map<string, BucketEntry>();

  constructor(options?: { windowMs?: number; maxRequests?: number; maxEntries?: number }) {
    this.windowMs = Math.max(1000, options?.windowMs ?? 60_000);
    this.maxRequests = Math.max(1, options?.maxRequests ?? 12);
    this.maxEntries = Math.max(32, options?.maxEntries ?? 2000);
  }

  public check(rawKey: string, nowMs: number = Date.now()): RateLimitDecision {
    const key = rawKey.trim() || 'unknown';
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAtMs <= nowMs) {
      if (this.buckets.size >= this.maxEntries) {
        this.pruneExpired(nowMs);
        if (this.buckets.size >= this.maxEntries) {
          const oldestKey = this.buckets.keys().next().value;
          if (oldestKey !== undefined) {
            this.buckets.delete(oldestKey);
          }
        }
      }

      const resetAtMs = nowMs + this.windowMs;
      this.buckets.set(key, { count: 1, resetAtMs });
      return {
        allowed: true,
        limit: this.maxRequests,
        remaining: Math.max(0, this.maxRequests - 1),
        retryAfterSeconds: Math.ceil(this.windowMs / 1000),
      };
    }

    if (existing.count >= this.maxRequests) {
      const retryAfterMs = Math.max(1000, existing.resetAtMs - nowMs);
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      };
    }

    existing.count += 1;
    return {
      allowed: true,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - existing.count),
      retryAfterSeconds: Math.ceil(Math.max(0, existing.resetAtMs - nowMs) / 1000),
    };
  }

  private pruneExpired(nowMs: number): void {
    for (const [k, entry] of this.buckets.entries()) {
      if (entry.resetAtMs <= nowMs) {
        this.buckets.delete(k);
      }
    }
  }
}

export function normalizeClientIp(rawIp: string | undefined): string {
  if (!rawIp) return 'unknown';
  const trimmed = rawIp.trim();
  if (!trimmed) return 'unknown';
  return trimmed.startsWith('::ffff:') ? trimmed.slice(7) : trimmed;
}
