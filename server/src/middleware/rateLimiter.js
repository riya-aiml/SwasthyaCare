/**
 * SwasthyaCare In-Memory Sliding-Window Rate Limiter Middleware
 * Protects conversational AI endpoints against flood/DoS, token exhaustion, and brute-force.
 * Zero-dependency, lightweight, and thread-safe for Node.js event loop.
 */

class SlidingWindowRateLimiter {
  constructor(windowMs = 60000, maxRequests = 30) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.hits = new Map();

    // Periodically sweep expired buckets every 2 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 120000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter((t) => now - t < this.windowMs);
      if (valid.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, valid);
      }
    }
  }

  createMiddleware() {
    return (req, res, next) => {
      // Key on authenticated user ID or fallback to client IP
      const key = req.user?._id?.toString() || req.ip || 'anonymous';
      const now = Date.now();

      const timestamps = this.hits.get(key) || [];
      const windowStart = now - this.windowMs;
      const recentTimestamps = timestamps.filter((t) => t > windowStart);

      if (recentTimestamps.length >= this.maxRequests) {
        const oldest = recentTimestamps[0];
        const retryAfterSeconds = Math.ceil((oldest + this.windowMs - now) / 1000);

        res.set('Retry-After', String(retryAfterSeconds));
        res.set('X-RateLimit-Limit', String(this.maxRequests));
        res.set('X-RateLimit-Remaining', '0');
        res.set('X-RateLimit-Reset', String(Math.ceil((oldest + this.windowMs) / 1000)));

        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many chat requests. Rate limit is ${this.maxRequests} requests per minute. Please try again in ${retryAfterSeconds} seconds.`,
          },
        });
      }

      recentTimestamps.push(now);
      this.hits.set(key, recentTimestamps);

      const remaining = this.maxRequests - recentTimestamps.length;
      res.set('X-RateLimit-Limit', String(this.maxRequests));
      res.set('X-RateLimit-Remaining', String(remaining));

      next();
    };
  }
}

export const chatRateLimiter = new SlidingWindowRateLimiter(60000, 30).createMiddleware();
export default chatRateLimiter;
