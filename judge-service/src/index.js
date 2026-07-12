require('dotenv').config()
const { Worker } = require('bullmq')
const { Redis }  = require('ioredis')
const { Pool }   = require('pg')
const fs         = require('fs')
const path       = require('path')
const Docker     = require('dockerode')
const docker     = new Docker()

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: {},
})

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

redis.on('connect', () =>
  console.log('[redis] connected'))
redis.on('error', (err) =>
  console.error('[redis] error:', err.message))

// ── Core judge function ──────────────────────
async function runJudge(jobId, userCode, testbenchCode) {
  const dir = `/tmp/jobs/${jobId}` 
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(`${dir}/solution.v`, userCode)
  fs.writeFileSync(`${dir}/testbench.v`, testbenchCode)

  const startTime = Date.now()
  let output = ''
  let verdict = 'RE'

  try {
    const container = await docker.createContainer({
      Image: 'rtl-judge:latest',
      Cmd: ['sh', '-c',
        `/usr/bin/iverilog -o /tmp/sim /judge/testbench.v /judge/solution.v 2>/tmp/ce.txt` +
        ` && /usr/bin/timeout 5 /tmp/sim 2>&1` +
        ` || (echo "==CE==" && cat /tmp/ce.txt)` 
      ],
      HostConfig: {
        Binds: [`${dir}:/judge:ro`],
        Memory: 256 * 1024 * 1024,
        NanoCpus: 1 * 1e9,
        NetworkMode: 'none',
        PidsLimit: 50,
        AutoRemove: true,
      },
    })

    await container.start()

    const logStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
    })

    output = await new Promise((resolve) => {
      const chunks = []
      logStream.on('data', chunk => chunks.push(chunk))
      logStream.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8')
        // Strip Docker log headers (8-byte prefix per frame)
        const lines = []
        let i = 0
        while (i < raw.length) {
          if (i + 8 <= raw.length) {
            const size = raw.charCodeAt(i+4) * 16777216 +
                         raw.charCodeAt(i+5) * 65536 +
                         raw.charCodeAt(i+6) * 256 +
                         raw.charCodeAt(i+7)
            lines.push(raw.slice(i + 8, i + 8 + size))
            i += 8 + size
          } else { break }
        }
        resolve(lines.join(''))
      })
    })

  } catch (err) {
    console.error('[docker] error:', err.message)
    output = err.message
    verdict = 'RE'
  } finally {
    try { 
      fs.rmSync(dir, { recursive: true, force: true }) 
    } catch(e) {}
  }

  const runtimeMs = Date.now() - startTime

  if (output.includes('==CE=='))               verdict = 'CE'
  else if (runtimeMs >= 5500)                  verdict = 'TLE'
  else if (output.includes('VERDICT: ACCEPTED'))    verdict = 'AC'
  else if (output.includes('VERDICT: WRONG_ANSWER')) verdict = 'WA'
  else                                         verdict = 'RE'

  console.log(`[judge] verdict: ${verdict} in ${runtimeMs}ms`)
  console.log(`[judge] output: ${output.slice(0, 200)}`)

  return { verdict, output: output.slice(0, 4000), runtimeMs }
}

// ── BullMQ Worker ────────────────────────────
const worker = new Worker('submissions', async (job) => {
  const { submissionId, userId, problemId,
          userCode, testbenchCode } = job.data

  console.log(`[judge] processing job ${job.id}, submission ${submissionId}`)

  const result = await runJudge(submissionId, userCode, testbenchCode)

  console.log(`[judge] verdict: ${result.verdict} in ${result.runtimeMs}ms`)

  // Update verdict in PostgreSQL
  await db.query(
    `UPDATE "Submission"
     SET verdict=$1, "executionOutput"=$2, "runtimeMs"=$3
     WHERE id=$4`,
    [result.verdict, result.output, result.runtimeMs, submissionId]
  )

  // Update problem stats
  await db.query(
    `UPDATE "Problem" SET
     "totalSubs" = "totalSubs" + 1,
     "acceptedSubs" = "acceptedSubs" + $1
     WHERE id=$2`,
    [result.verdict === 'AC' ? 1 : 0, problemId]
  )

  // On AC: award points only on first solve
  if (result.verdict === 'AC') {
    const existing = await db.query(
      `SELECT 1 FROM "UserSolve" WHERE "userId"=$1 AND "problemId"=$2`,
      [userId, problemId]
    )

    if (existing.rows.length === 0) {
      const pts = await db.query(
        `SELECT points FROM "Problem" WHERE id=$1`,
        [problemId]
      )
      const points = pts.rows[0]?.points ?? 100

      await redis.zadd('leaderboard:global', 'INCR', points, userId)

      await db.query(
        `INSERT INTO "UserSolve" ("userId", "problemId", "solvedAt")
         VALUES ($1, $2, NOW())
         ON CONFLICT DO NOTHING`,
        [userId, problemId]
      )

      await db.query(
        `UPDATE "User" SET points = points + $1, "solveCount" = "solveCount" + 1 WHERE id=$2`,
        [points, userId]
      )
    }
  }

  return result

}, { connection: redis, concurrency: 2 })

worker.on('completed', (job, result) =>
  console.log(`[worker] job ${job.id} done: ${result.verdict}`))

worker.on('failed', (job, err) =>
  console.error(`[worker] job ${job.id} failed:`, err.message))

// ── Contest BullMQ Worker ─────────────────────
const contestWorker = new Worker('contest-submissions', async (job) => {
  const { submissionId, userId, contestId,
          problemId, userCode, testbenchCode,
          attemptNum, startTime } = job.data

  console.log(`[contest] processing job ${job.id}, submission ${submissionId}`)

  const result = await runJudge(submissionId, userCode, testbenchCode)

  console.log(`[contest] verdict: ${result.verdict} in ${result.runtimeMs}ms`)

  await db.query(
    `UPDATE "ContestSubmission"
     SET verdict=$1, "executionOutput"=$2, "runtimeMs"=$3
     WHERE id=$4`,
    [result.verdict, result.output, result.runtimeMs, submissionId]
  )

  if (result.verdict === 'AC') {
    const firstAC = await db.query(
      `SELECT id FROM "ContestSubmission"
       WHERE "userId"=$1 AND "problemId"=$2 AND "contestId"=$3
       AND verdict='AC' AND id != $4
       LIMIT 1`,
      [userId, problemId, contestId, submissionId]
    )

    if (firstAC.rows.length === 0) {
      const contestStart = new Date(startTime)
      const solveTime = Math.floor((Date.now() - contestStart.getTime()) / 60000)
      const penalty = (attemptNum - 1) * 20
      const totalForProblem = solveTime + penalty

      await redis.zincrby(`contest:${contestId}:solved`, 1, userId)
      await redis.zincrby(`contest:${contestId}:penalty`, totalForProblem, userId)
    }
  }

  return result
}, { connection: redis, concurrency: 2 })

contestWorker.on('completed', (job, result) =>
  console.log(`[contest-worker] job ${job.id} done: ${result.verdict}`))

contestWorker.on('failed', (job, err) =>
  console.error(`[contest-worker] job ${job.id} failed:`, err.message))

console.log('[judge] worker started, waiting for jobs...')
