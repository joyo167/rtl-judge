require('dotenv').config()
const { Pool } = require('pg')
const { Redis } = require('ioredis')

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: {},
})

async function main() {
  const { rows } = await db.query(
    `SELECT id, username, points FROM "User" ORDER BY points DESC`
  )

  console.log(`Syncing ${rows.length} users to Redis leaderboard…`)

  await redis.del('leaderboard:global')

  for (const user of rows) {
    if (user.points > 0) {
      await redis.zadd('leaderboard:global', user.points, user.id)
      console.log(`  ${user.username}: ${user.points} pts`)
    }
  }

  console.log('Done.')
  await db.end()
  redis.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
