import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string })?.id

  if (!userId) return NextResponse.json([])

  const problem = await prisma.problem.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  })

  if (!problem) return NextResponse.json([])

  const submissions = await prisma.submission.findMany({
    where: { userId, problemId: problem.id },
    orderBy: { submittedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      verdict: true,
      submittedAt: true,
      runtimeMs: true,
      executionOutput: true,
    },
  })

  return NextResponse.json(submissions)
}
