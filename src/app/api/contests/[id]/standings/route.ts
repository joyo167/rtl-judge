import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const contest = await prisma.contest.findUnique({
    where: { id: params.id },
    select: {
      startTime: true,
      isPublished: true,
      contestProblems: {
        orderBy: { orderIndex: 'asc' },
        select: { problemId: true, orderIndex: true },
      },
    },
  })

  if (!contest || !contest.isPublished)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // All AC submissions for this contest, earliest per user+problem
  const acSubs = await prisma.contestSubmission.findMany({
    where: { contestId: params.id, verdict: 'AC' },
    orderBy: { submittedAt: 'asc' },
    select: {
      userId: true,
      problemId: true,
      submittedAt: true,
      attemptNum: true,
      user: { select: { username: true, avatarUrl: true } },
    },
  })

  // First AC per user+problem
  const firstAC = new Map<string, typeof acSubs[0]>()
  for (const s of acSubs) {
    const key = `${s.userId}:${s.problemId}`
    if (!firstAC.has(key)) firstAC.set(key, s)
  }

  // All submissions (to count wrong attempts before first AC)
  const allSubs = await prisma.contestSubmission.findMany({
    where: { contestId: params.id },
    select: { userId: true, problemId: true, verdict: true, submittedAt: true },
  })

  // Build per-user stats
  const userMap = new Map<string, {
    username: string
    avatarUrl: string | null
    solved: number
    totalPenalty: number
    problems: Record<string, { solved: boolean; attempts: number; solveTime?: number; penalty?: number }>
  }>()

  for (const [key, ac] of Array.from(firstAC.entries())) {
    const [userId] = key.split(':')
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        username: ac.user.username,
        avatarUrl: ac.user.avatarUrl,
        solved: 0,
        totalPenalty: 0,
        problems: {},
      })
    }
    const u = userMap.get(userId)!

    // Count wrong attempts before first AC for this problem
    const wrongBefore = allSubs.filter(
      (s) =>
        s.userId === userId &&
        s.problemId === ac.problemId &&
        s.verdict !== 'AC' &&
        new Date(s.submittedAt) < new Date(ac.submittedAt)
    ).length

    const solveTime = Math.floor(
      (new Date(ac.submittedAt).getTime() - contest.startTime.getTime()) / 60000
    )
    const penalty = wrongBefore * 20
    const total = solveTime + penalty

    u.solved += 1
    u.totalPenalty += total
    u.problems[ac.problemId] = {
      solved: true,
      attempts: wrongBefore + 1,
      solveTime,
      penalty,
    }
  }

  // Also track attempted-but-not-solved users
  for (const s of allSubs) {
    if (!userMap.has(s.userId)) {
      // Will be added with 0 solved if they only have wrong subs
      // Skip — standings only shows users who've solved ≥1 or attempted
    }
    const u = userMap.get(s.userId)
    if (u && !u.problems[s.problemId]) {
      u.problems[s.problemId] = { solved: false, attempts: 0 }
    }
    if (u && !u.problems[s.problemId].solved) {
      u.problems[s.problemId].attempts += 1
    }
  }

  // Sort: solved DESC, penalty ASC
  const rows = Array.from(userMap.entries())
    .map(([userId, u]) => ({ userId, ...u }))
    .sort((a, b) => b.solved - a.solved || a.totalPenalty - b.totalPenalty)
    .slice(0, 100)
    .map((u, i) => ({ rank: i + 1, ...u }))

  const problemLabels = contest.contestProblems.map((cp, i) => ({
    problemId: cp.problemId,
    label: String.fromCharCode(65 + i),
  }))

  return NextResponse.json({ rows, problemLabels })
}
