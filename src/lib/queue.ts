import { Queue } from 'bullmq'

const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379')

export const submissionQueue = new Queue('submissions', {
  connection: {
    host: redisUrl.hostname,
    port: Number(redisUrl.port) || 6379,
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
  },
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})
