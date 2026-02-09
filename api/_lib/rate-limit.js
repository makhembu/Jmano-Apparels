import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = (redisUrl && redisToken) 
  ? new Ratelimit({
      redis: new Redis({
        url: redisUrl,
        token: redisToken,
      }),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

export async function checkRateLimit(req, limit = 10, window = "10 s") {
    // If Redis isn't configured, skip rate limiting (fail open) to prevent app breakage
    if (!ratelimit) {
        return { success: true };
    }

    try {
        // Use IP as identifier
        const ip = req.headers['x-forwarded-for'] || '127.0.0.1';
        
        // Dynamic limiter creation based on specific route needs
        const specificLimiter = new Ratelimit({
            redis: new Redis({
                url: redisUrl,
                token: redisToken,
            }),
            limiter: Ratelimit.slidingWindow(limit, window),
            analytics: true,
            prefix: "@upstash/ratelimit",
        });

        const { success, limit: l, remaining, reset } = await specificLimiter.limit(ip);
        return { success, limit: l, remaining, reset };
    } catch (e) {
        console.error("Rate limit error:", e);
        // Fail open if Redis is down
        return { success: true };
    }
}