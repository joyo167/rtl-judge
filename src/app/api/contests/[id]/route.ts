import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function statusOf(startTime: Date, endTime: Date): 'upcoming' | 'ongoing' | 'ended' {
  const now = Date.now()
  if (now < startTime.getTime()) return 'upcoming'
  if (now > endTime.getTime()) return 'ended'
  return 'ongoing'
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const contest = await prisma.contest.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      isPublished: true,
      contestProblems: {
        orderBy: { orderIndex: 'asc' },
        select: {
          orderIndex: true,
          points: true,
          problem: {
            select: { id: true, title: true, slug: true, difficulty: true },
          },
        },
      },
    },
  })

  if (!contest || !contest.isPublished) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const status = statusOf(contest.startTime, contest.endTime)

  // Before contest starts: hide problem titles/slugs, expose count only
  if (status === 'upcoming') {
    return NextResponse.json({
      id: contest.id,
      title: contest.title,
      description: contest.description,
      startTime: contest.startTime,
      endTime: contest.endTime,
      status,
      problemCount: contest.contestProblems.length,
      problems: null,
    })
  }

  // Ongoing or ended: full problem list with labels A, B, C...
  const problems = contest.contestProblems.map((cp, i) => ({
    label: String.fromCharCode(65 + i),
    orderIndex: cp.orderIndex,
    points: cp.points,
    id: cp.problem.id,
    title: cp.problem.title,
    slug: cp.problem.slug,
    difficulty: cp.problem.difficulty,
  }))

  return NextResponse.json({
    id: contest.id,
    title: contest.title,
    description: contest.description,
    startTime: contest.startTime,
    endTime: contest.endTime,
    status,
    problemCount: problems.length,
    problems,
  })
}
