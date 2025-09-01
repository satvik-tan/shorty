import 'dotenv/config'
import express from 'express'
import { clerkMiddleware, requireAuth } from '@clerk/express'


export const clerk = clerkMiddleware();

export const requireAuthMiddleware = requireAuth();