import { RateLimiterMemory } from 'rate-limiter-flexible';

export const authLimiter = new RateLimiterMemory({
  points: 60, // Number of points
  duration: 300, // Per 300 seconds
  blockDuration: 300 // Block for 5 minutes
});

export const loginLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 60 * 15, // Per 15 minutes
  blockDuration: 60 * 15 // Block for 15 minutes
});

export async function rateLimitMiddleware(limiter) {
  return async (req, res, next) => {
    try {
      await limiter.consume(req.ip);
      next();
    } catch (error) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Please try again later'
      });
    }
  };
}