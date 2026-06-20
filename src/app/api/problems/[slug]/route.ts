import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const problem = await prisma.problem.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      description: true,
      starterCode: true,
      totalSubs: true,
      acceptedSubs: true,
    },
  })

  if (!problem) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(problem)
}
