import rateLimit from 'express-rate-limit';

const getClientIp = (req) => {
  // Check various proxy headers in order of preference
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare
  const flyClientIp = req.headers['fly-client-ip']; // Fly.io
  
  // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2)
  // We want the FIRST one (client's real IP)
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  // Fallback to other headers or req.ip
  return flyClientIp || realIp || cfConnectingIp || req.ip;
};

// Rate limit for URL creation (authenticated users)
export const createUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { error: 'Too many URLs created. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => getClientIp(req), // Use function signature
});

// Rate limit for public redirects (this is critical!)
export const redirectLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 redirects per minute per IP
  message: { error: 'Too many redirect requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req, res) => getClientIp(req),
});

// Rate limit for fetching URLs
export const fetchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => getClientIp(req),
});

// Rate limit for updates
export const updateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 updates per minute
  message: { error: 'Too many update requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => getClientIp(req),
});

// Global rate limiter for all requests
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: { error: 'Too many requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => getClientIp(req),
});
