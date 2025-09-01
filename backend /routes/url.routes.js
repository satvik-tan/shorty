import express from 'express';
import { requireAuth } from '@clerk/express';
import { createURL, getURL, patchUrl, getAllUrls } from '../services/url.services.js';

const router = express.Router();

console.log('🚀 URL Routes loaded');

// Authenticated routes (must come first with specific paths)
router.post('/api/urls', requireAuth(), (req, res, next) => {
  console.log('📍 Route matched: POST /api/urls');
  next();
}, createURL);

router.get('/api/urls', requireAuth(), (req, res, next) => {
  console.log('📍 Route matched: GET /api/urls');
  next();
}, getAllUrls);

router.patch('/api/urls/:id', requireAuth(), (req, res, next) => {
  console.log('📍 Route matched: PATCH /api/urls/:id');
  next();
}, patchUrl);

// Public redirect route (catch-all, must be last)
router.get('/:shortCode', (req, res, next) => {
  console.log('📍 Route matched: GET /:shortCode');
  next();
}, getURL);

console.log('✅ All routes registered');

export default router;
