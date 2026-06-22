import { Redis } from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    tls: {},
  })

redis.on('connect', () => console.log('[redis] connected successfully'))
redis.on('error', (err) => console.error('[redis] connection error:', err.message))

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
