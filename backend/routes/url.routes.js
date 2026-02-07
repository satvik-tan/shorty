import express from 'express';
import { requireAuth } from '@clerk/express';
import { createURL, getURL, patchUrl, getAllUrls } from '../services/url.services.js';
import { 
  createUrlLimiter, 
  redirectLimiter, 
  fetchLimiter, 
  updateLimiter 
} from '../middlewares/rateLimiter.js';

const router = express.Router();

console.log('🚀 URL Routes loaded');

// Authenticated routes (must come first with specific paths)
router.post('/api/urls', createUrlLimiter, requireAuth(), (req, res, next) => {
  console.log('📍 Route matched: POST /api/urls');
  next();
}, createURL);

router.get('/api/urls', fetchLimiter, requireAuth(), (req, res, next) => {
  console.log('📍 Route matched: GET /api/urls');
  next();
}, getAllUrls);

router.patch('/api/urls/:id', updateLimiter, requireAuth(), (req, res, next) => {
  console.log('📍 Route matched: PATCH /api/urls/:id');
  next();
}, patchUrl);

// Public redirect route (CRITICAL - MUST HAVE RATE LIMITING!)
router.get('/:shortCode', redirectLimiter, (req, res, next) => {
  console.log('📍 Route matched: GET /:shortCode');
  next();
}, getURL);

console.log('✅ All routes registered with rate limiting');

export default router;
