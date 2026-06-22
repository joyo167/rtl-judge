import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'
import { submissionQueue } from '@/lib/queue'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as
    | { id?: string; githubId?: string; email?: string | null }
    | undefined

  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { problemId, code } = await req.json()

  // Prefer stable identifiers (DB id / GitHub id); fall back to email.
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(sessionUser.id ? [{ id: sessionUser.id }] : []),
        ...(sessionUser.githubId ? [{ githubId: sessionUser.githubId }] : []),
        ...(sessionUser.email ? [{ email: sessionUser.email }] : []),
      ],
    },
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

  try {
    const job = await submissionQueue.add('judge', {
      submissionId: submission.id,
      userId: user.id,
      problemId: problem.id,
      userCode: code,
      testbenchCode: problem.testbenchCode,
    })
    console.log('[queue] job added successfully, id:', job.id)
  } catch (err) {
    console.error('[queue] FAILED to add job:', err)
  }

  return NextResponse.json({ submissionId: submission.id })
}
