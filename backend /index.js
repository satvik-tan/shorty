import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import urlRoutes from './routes/url.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - only allow frontend origin
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // Limit payload size

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Health check (no auth)
app.get('/health', (req, res) => {
  console.log('💚 Health check hit');
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Clerk auth middleware
app.use(clerkMiddleware());

// Routes
console.log('🔗 Mounting URL routes at /');
try {
  app.use('/', urlRoutes);
  console.log('✅ Routes mounted successfully');
} catch (error) {
  console.error('❌ Error mounting routes:', error);
}

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
});
