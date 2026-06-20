import { Queue } from 'bullmq'

const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379')

// Upstash (and most hosted Redis) require TLS. Enable it for rediss:// URLs
// or whenever the host is an Upstash endpoint, even if the URL says redis://.
const needsTls =
  redisUrl.protocol === 'rediss:' || redisUrl.hostname.endsWith('upstash.io')

export const submissionQueue = new Queue('submissions', {
  connection: {
    host: redisUrl.hostname,
    port: Number(redisUrl.port) || 6379,
    username: redisUrl.username || undefined,
    password: decodeURIComponent(redisUrl.password) || undefined,
    tls: needsTls ? {} : undefined,
    retryStrategy: (times: number) =>
      times > 3 ? null : Math.min(times * 200, 1000),
  },
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})
