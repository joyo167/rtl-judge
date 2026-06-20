import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      totalSubs: true,
      acceptedSubs: true,
    },
    orderBy: { id: 'asc' },
  })

  const withRate = problems.map((p) => ({
    ...p,
    acceptanceRate:
      p.totalSubs === 0
        ? 0
        : Math.round((p.acceptedSubs / p.totalSubs) * 1000) / 10,
  }))

  return NextResponse.json(withRate)
}
