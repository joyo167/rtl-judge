import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    select: {
      verdict: true,
      executionOutput: true,
      runtimeMs: true,
    },
  })

  if (!submission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(submission)
}
