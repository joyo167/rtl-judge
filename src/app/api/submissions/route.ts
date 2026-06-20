import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'
import { submissionQueue } from '@/lib/queue'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { problemId, code } = await req.json()

  const user = await prisma.user.findFirst({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  })

  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
  }

  const submission = await prisma.submission.create({
    data: {
      userId: user.id,
      problemId: problem.id,
      code,
      verdict: 'pending',
    },
  })

  await submissionQueue.add('judge', {
    submissionId: submission.id,
    userId: user.id,
    problemId: problem.id,
    userCode: code,
    testbenchCode: problem.testbenchCode,
  })

  return NextResponse.json({ submissionId: submission.id })
}
