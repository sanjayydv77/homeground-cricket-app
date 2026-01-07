import { cleanExpiredMatches } from '../lib/database'

export const initCleanup = () => {
  // Run cleanup immediately
  cleanExpiredMatches()
  
  // Schedule cleanup every 24 hours
  setInterval(() => {
    cleanExpiredMatches()
  }, 24 * 60 * 60 * 1000)
}

export const getDaysRemaining = (completedAt: any) => {
  if (!completedAt) return null
  
  const now = Date.now()
  // Handle String (Supabase) or JS Date
  const completedTime = typeof completedAt === 'string' ? new Date(completedAt).getTime() : completedAt.getTime()
  const expiryTime = completedTime + (7 * 24 * 60 * 60 * 1000)
  const remainingMs = expiryTime - now
  
  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000))
}
