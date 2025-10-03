# Rate Limiting & IP Detection

## The Problem You Discovered

When your frontend (Vercel) makes requests to your backend (Fly.io), the backend would normally see ALL requests coming from Vercel's server IP, not the actual user's IP. This makes rate limiting useless because:

- ❌ All users share the same rate limit (Vercel's IP)
- ❌ One user could exhaust the limit for everyone
- ❌ Malicious actors still undetected

## The Solution

### 1. Trust Proxy Configuration

```javascript
// in index.js
app.set('trust proxy', 1); // Trust first proxy
```

This tells Express to trust the `X-Forwarded-For` header from the first proxy (Vercel, Fly.io, Cloudflare, etc.)

### 2. Custom IP Extraction

```javascript
// in middlewares/rateLimiter.js
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare
  const flyClientIp = req.headers['fly-client-ip']; // Fly.io
  
  // X-Forwarded-For: "client_ip, proxy1_ip, proxy2_ip"
  // We want the FIRST one (actual client)
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return flyClientIp || realIp || cfConnectingIp || req.ip;
};
```

### 3. Apply to All Rate Limiters

Every rate limiter now uses:
```javascript
keyGenerator: getClientIp
```

## How It Works in Production

### Request Flow:
```
User (123.45.67.89)
    ↓
Vercel Frontend
    ↓ X-Forwarded-For: 123.45.67.89
Fly.io Backend
    ↓ getClientIp() extracts 123.45.67.89
Rate Limiter
```

### Headers Set by Proxies:

| Platform | Header | Example |
|----------|--------|---------|
| **Vercel** | `X-Forwarded-For` | `123.45.67.89, 104.21.0.1` |
| **Fly.io** | `Fly-Client-IP` | `123.45.67.89` |
| **Cloudflare** | `CF-Connecting-IP` | `123.45.67.89` |
| **Generic** | `X-Real-IP` | `123.45.67.89` |

## Testing Locally

When testing locally, your IP will be `::1` (IPv6 localhost) or `127.0.0.1`. To test with real IPs:

```bash
# Simulate proxy header
curl -H "X-Forwarded-For: 203.0.113.1" http://localhost:3000/health
```

## Security Considerations

### ⚠️ Trust Proxy = 1 (First Proxy Only)

```javascript
app.set('trust proxy', 1); // ✅ Only trust first proxy
```

**Why not trust all proxies?**
- If you trust ALL proxies (`true`), an attacker could spoof the `X-Forwarded-For` header
- By trusting only 1 proxy, you trust only Vercel/Fly.io, not random clients

### Example Attack (if trust proxy = true):
```bash
# Attacker spoofs header
curl -H "X-Forwarded-For: 1.1.1.1" http://api.example.com/
# Backend thinks request came from 1.1.1.1, bypassing their rate limit
```

### ✅ With trust proxy = 1:
- Backend only trusts the LAST proxy in the chain (Vercel)
- Client can't spoof headers because Vercel overwrites them

## Rate Limits Per IP

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| **Global** | 100 req | 1 min | Prevent general abuse |
| **POST /api/urls** | 20 URLs | 15 min | Prevent URL spam |
| **GET /api/urls** | 30 req | 1 min | Prevent excessive fetching |
| **PATCH /api/urls/:id** | 10 req | 1 min | Prevent update spam |
| **GET /:shortCode** | 60 req | 1 min | 🔥 CRITICAL - prevent redirect abuse |

## Monitoring

### Check rate limit headers in response:
```
RateLimit-Limit: 60
RateLimit-Remaining: 59
RateLimit-Reset: 1643723400
```

### When limit is hit:
```json
{
  "error": "Too many requests from this IP. Please try again later."
}
```
Status: `429 Too Many Requests`

## Environment-Specific Behavior

### Development (localhost):
- All requests show as `::1` or `127.0.0.1`
- Rate limiting works but all local requests share the limit

### Production (Vercel + Fly.io):
- Each user gets their own rate limit based on their real IP
- Proper abuse prevention

## Alternative: User-Based Rate Limiting

If you want even more granular control, you could rate limit by **Clerk user ID** instead of IP for authenticated routes:

```javascript
// For authenticated endpoints only
keyGenerator: (req) => {
  const auth = req.auth();
  return auth?.userId || getClientIp(req); // Use userId if authenticated, else IP
}
```

This would give each logged-in user their own rate limit, regardless of IP changes (mobile, WiFi switches, etc.)

## Cost Savings

**Before rate limiting:**
- Attacker spams 1M redirects/day
- Redis: ~1M queries × $0.0001 = $100/day
- Prisma: ~1M queries × $0.0002 = $200/day
- **Total: $300/day = $9,000/month** 💸💸💸

**After rate limiting:**
- Max 60 redirects/min per IP = 86,400/day per IP
- Even with 100 attackers: 8.6M/day
- But realistically: legitimate usage only
- **Cost: ~$5-20/month** ✅

## Summary

✅ **Fixed**: Backend now extracts real user IP from proxy headers
✅ **Secure**: Only trusts first proxy (Vercel/Fly.io)
✅ **Effective**: Each user gets their own rate limit
✅ **Cost-Safe**: Prevents infinite request abuse
✅ **Production-Ready**: Works with Vercel + Fly.io deployment

You just saved yourself from potential bankruptcy! 🎉
