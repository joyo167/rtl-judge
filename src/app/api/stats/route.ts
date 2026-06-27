import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [problems, users, submissions] = await Promise.all([
    prisma.problem.count(),
    prisma.user.count(),
    prisma.submission.count(),
  ])

  return NextResponse.json({ problems, users, submissions })
}
