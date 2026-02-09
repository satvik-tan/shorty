import 'dotenv/config';
import { PrismaClient } from "../generated/prisma/client.ts";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
});

export async function getOrCreateUser(clerkId) {
  if (!clerkId) {
    throw new Error("Missing clerkId");
  }

  console.log('🔑 getOrCreateUser called with clerkId:', clerkId);

  try {
    const result = await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: {
        clerkId,
      },
    });
    
    console.log('✅ User upserted:', result);
    return result;
  } catch (error) {
    console.error('❌ User upsert error:', error);
    throw error;
  }
}
