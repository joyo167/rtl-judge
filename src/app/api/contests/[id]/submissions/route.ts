import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'
import { contestQueue } from '@/lib/contestQueue'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contest = await prisma.contest.findUnique({
    where: { id: params.id },
    select: { id: true, startTime: true, endTime: true, isPublished: true },
  })

  if (!contest || !contest.isPublished)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const now = Date.now()
  if (now < contest.startTime.getTime() || now > contest.endTime.getTime())
    return NextResponse.json({ error: 'Contest not active' }, { status: 403 })

  const { problemId, code } = await req.json()

  const cp = await prisma.contestProblem.findUnique({
    where: { contestId_problemId: { contestId: params.id, problemId } },
    select: { problem: { select: { testbenchCode: true } } },
  })
  if (!cp) return NextResponse.json({ error: 'Problem not in contest' }, { status: 404 })

  const attemptNum = await prisma.contestSubmission.count({
    where: { userId, contestId: params.id, problemId },
  })

  const submission = await prisma.contestSubmission.create({
    data: {
      userId,
      contestId: params.id,
      problemId,
      code,
      verdict: 'pending',
      attemptNum: attemptNum + 1,
    },
  })

  await contestQueue.add('judge', {
    submissionId: submission.id,
    userId,
    contestId: params.id,
    problemId,
    userCode: code,
    testbenchCode: cp.problem.testbenchCode,
    attemptNum: attemptNum + 1,
    startTime: contest.startTime.toISOString(),
  })

  return NextResponse.json({ submissionId: submission.id })
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json([], { status: 200 })

  const subs = await prisma.contestSubmission.findMany({
    where: { contestId: params.id, userId },
    orderBy: { submittedAt: 'asc' },
    select: {
      id: true,
      problemId: true,
      verdict: true,
      attemptNum: true,
      submittedAt: true,
      runtimeMs: true,
      executionOutput: true,
    },
  })

  // Group by problemId
  const grouped: Record<string, typeof subs> = {}
  for (const s of subs) {
    if (!grouped[s.problemId]) grouped[s.problemId] = []
    grouped[s.problemId].push(s)
  }

  return NextResponse.json(grouped)
}
