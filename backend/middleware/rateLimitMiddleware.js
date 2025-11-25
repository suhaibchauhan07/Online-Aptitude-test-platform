import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

const createRateLimiter = ({
  windowMs,
  max,
  message = 'Too many requests, please try again later.',
  skipFailedRequests = false,
  skipSuccessfulRequests = false
}) =>
  rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipFailedRequests,
    skipSuccessfulRequests,
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json({
        message,
        retryAfter: res.getHeader('Retry-After') ?? Math.ceil(windowMs / 1000)
      });
    }
  });

const createSpeedLimiter = ({
  windowMs,
  delayAfter,
  delayMs,
  maxDelayMs = 5000
}) =>
  slowDown({
    windowMs,
    delayAfter,
    delayMs,
    maxDelayMs
  });

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

export const globalSpeedLimiter = createSpeedLimiter({
  windowMs: FIFTEEN_MINUTES,
  delayAfter: 150,
  delayMs: 250
});

export const globalRateLimiter = createRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 300
});

export const authSpeedLimiter = createSpeedLimiter({
  windowMs: FIFTEEN_MINUTES,
  delayAfter: 5,
  delayMs: 500,
  maxDelayMs: 5000
});

export const authRateLimiter = createRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  max: 10,
  message:
    'Too many login or registration attempts. Please try again in a few minutes.',
  skipSuccessfulRequests: true
});

export const mutationRateLimiter = createRateLimiter({
  windowMs: ONE_MINUTE,
  max: 30,
  message: 'Too many changes in a short period. Please slow down.'
});

export const uploadSpeedLimiter = createSpeedLimiter({
  windowMs: ONE_HOUR,
  delayAfter: 2,
  delayMs: 1500,
  maxDelayMs: 15000
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: ONE_HOUR,
  max: 8,
  message: 'Too many uploads today. Please try again later.'
});

