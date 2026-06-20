import { Redis } from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379')
const needsTls =
  redisUrl.protocol === 'rediss:' || redisUrl.hostname.endsWith('upstash.io')

export const redis =
  globalForRedis.redis ??
  new Redis({
    host: redisUrl.hostname,
    port: Number(redisUrl.port) || 6379,
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    ...(needsTls ? { tls: {} } : {}),
  })

redis.on('error', () => {
  /* swallow connection errors to avoid log spam; surfaced on actual use */
})

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
