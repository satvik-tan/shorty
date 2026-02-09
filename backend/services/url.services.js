import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';
import { nanoid } from 'nanoid';
import Redis from 'ioredis';
import { getOrCreateUser } from '../lib/createUser.js';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
});
const redis = new Redis(process.env.REDIS_URL);


///creating a new short url
export async function createURL(req, res) {
  console.log('🔵 CREATE URL - Hit endpoint');
  console.log('Body:', req.body);
  
  try {
    const { longUrl } = req.body;
    
    if (!longUrl) {
      return res.status(400).json({ error: 'longUrl is required' });
    }

    // Call req.auth() as a function to get auth data
    const auth = req.auth();
    console.log('Auth:', auth);
    
    const user = await getOrCreateUser(auth.userId);
    console.log('User:', user);
    const shortCode = nanoid(7);

    const url = await prisma.shortUrl.create({
      data: {
        shortCode,
        longUrl,
        userId: user.id,
      },
    });

    // Return frontend URL, not backend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    return res.status(201).json({
      success: true,
      data: {
        ...url,
        shortUrl: `${frontendUrl}/${url.shortCode}`,
      },
    });
  } catch (error) {
    console.error('Create URL error:', error);
    return res.status(500).json({ error: 'Failed to create short URL' });
  }
}


///this is the core getting logic with redis caching
export async function getURL(req, res) {
  console.log('🟢 GET URL - Hit endpoint');
  console.log('Params:', req.params);
  
  try {
    const { shortCode } = req.params;
    const cacheKey = `short:${shortCode}`;

    // 1. Try Redis
    let longUrl = await redis.get(cacheKey);

    if (!longUrl) {
      // 2. DB lookup
      const url = await prisma.shortUrl.findUnique({
        where: { shortCode },
      });

      if (!url || !url.isActive) {
        // Fallback to frontend 404 page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(302, `${frontendUrl}/?notfound=${shortCode}`);
      }

      // Increment DB hit counter
      await prisma.shortUrl.update({
        where: { id: url.id },
        data: { totalClicks: { increment: 1 } },
      });

      longUrl = url.longUrl;

      // 3. Cache it
      await redis.set(cacheKey, longUrl, 'EX', 3600);
    } else {
      // Still increment clicks even from cache
      const url = await prisma.shortUrl.findUnique({
        where: { shortCode },
      });
      
      if (url) {
        await prisma.shortUrl.update({
          where: { id: url.id },
          data: { totalClicks: { increment: 1 } },
        });
      }
    }

    // 4. Use 302 redirect (temporary) - can be changed to 301 (permanent) if needed
    console.log('✅ Redirecting to:', longUrl);
    return res.redirect(302, longUrl);
  } catch (error) {
    console.error('Get URL error:', error);
    // Fallback to frontend on error
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(302, `${frontendUrl}/?error=server`);
  }
}


//this is for deleting or updating the url
export async function patchUrl(req, res) {
  console.log('🟡 PATCH URL - Hit endpoint');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  
  try {
    const { longUrl, isActive } = req.body;
    const auth = req.auth();
    const user = await getOrCreateUser(auth.userId);

    const updateData = {};
    if (longUrl !== undefined) updateData.longUrl = longUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await prisma.shortUrl.updateMany({
      where: {
        id: req.params.id,
        userId: user.id,
      },
      data: updateData,
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'URL not found or access denied' });
    }

    // Invalidate cache
    const url = await prisma.shortUrl.findUnique({
      where: { id: req.params.id },
    });
    
    if (url) {
      await redis.del(`short:${url.shortCode}`);
    }

    return res.json({ success: true, message: 'URL updated' });
  } catch (error) {
    console.error('Patch URL error:', error);
    return res.status(500).json({ error: 'Failed to update URL' });
  }
}


//listing a user all the urls. 
export async function getAllUrls(req, res) {
  console.log('🟣 GET ALL URLS - Hit endpoint');
  
  try {
    const auth = req.auth();
    console.log('Auth:', auth);
    
    const user = await getOrCreateUser(auth.userId);
    console.log('User:', user);

    const urls = await prisma.shortUrl.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: urls,
    });
  } catch (error) {
    console.error('Get all URLs error:', error);
    return res.status(500).json({ error: 'Failed to fetch URLs' });
  }
}