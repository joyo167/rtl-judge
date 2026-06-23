require('dotenv').config()
const { Worker } = require('bullmq')
const { Redis }  = require('ioredis')
const { Pool }   = require('pg')
const { exec }   = require('child_process')
const fs         = require('fs')
const path       = require('path')

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
  fs.writeFileSync(`${dir}/solution.v`,  userCode)
  fs.writeFileSync(`${dir}/testbench.v`, testbenchCode)

  const startTime = Date.now()

  return new Promise((resolve) => {
    const cmd = [
      `/usr/bin/iverilog -o ${dir}/sim`,
      `${dir}/testbench.v ${dir}/solution.v`,
      `2>${dir}/ce.txt`,
      `&& /usr/bin/timeout 5 ${dir}/sim 2>&1`,
      `|| (echo "==CE==" && cat ${dir}/ce.txt)`
    ].join(' ')

    exec(cmd,
      { timeout: 7000, maxBuffer: 512 * 1024 },
      (err, stdout, stderr) => {
        const runtimeMs = Date.now() - startTime
        const output = stdout || ''

        let verdict
        if (output.includes('==CE=='))
          verdict = 'CE'
        else if (err && err.killed)
          verdict = 'TLE'
        else if (output.includes('VERDICT: ACCEPTED'))
          verdict = 'AC'
        else if (output.includes('VERDICT: WRONG_ANSWER'))
          verdict = 'WA'
        else
          verdict = 'RE'

        // cleanup
        try {
          fs.rmSync(dir, { recursive: true, force: true })
        } catch(e) {}

        resolve({ verdict, output: output.slice(0, 4000), runtimeMs })
      }
    )
  })
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

  // Update leaderboard in Redis if AC
  if (result.verdict === 'AC') {
    const pts = await db.query(
      `SELECT points FROM "Problem" WHERE id=$1`,
      [problemId]
    )
    if (pts.rows[0]) {
      await redis.zadd(
        'leaderboard:global',
        'INCR',
        pts.rows[0].points,
        userId
      )
    }
  }

  return result

}, { connection: redis, concurrency: 2 })

worker.on('completed', (job, result) =>
  console.log(`[worker] job ${job.id} done: ${result.verdict}`))

worker.on('failed', (job, err) =>
  console.error(`[worker] job ${job.id} failed:`, err.message))

console.log('[judge] worker started, waiting for jobs...')
