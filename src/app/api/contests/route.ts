import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function statusOf(startTime: Date, endTime: Date): 'upcoming' | 'ongoing' | 'ended' {
  const now = Date.now()
  if (now < startTime.getTime()) return 'upcoming'
  if (now > endTime.getTime()) return 'ended'
  return 'ongoing'
}

function isAdmin(username?: string) {
  return username === process.env.ADMIN_GITHUB_USERNAME
}

export async function GET() {
  const contests = await prisma.contest.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
    },
    orderBy: { startTime: 'desc' },
  })

  const withStatus = contests.map((c) => ({
    ...c,
    status: statusOf(c.startTime, c.endTime),
  }))

  return NextResponse.json(withStatus)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const username = (session?.user as { username?: string })?.username

  if (!isAdmin(username)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, startTime, endTime, problems } = body as {
    title?: string
    description?: string
    startTime?: string
    endTime?: string
    problems?: { problemId: string; points?: number }[]
  }

  if (!title || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const start = new Date(startTime)
  const end = new Date(endTime)
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: 'Invalid start/end time' }, { status: 400 })
  }

  const probs = (problems ?? []).filter((p) => p.problemId)

  const contest = await prisma.contest.create({
    data: {
      title,
      description: description || null,
      startTime: start,
      endTime: end,
      isPublished: true,
      contestProblems: {
        create: probs.map((p, i) => ({
          problemId: p.problemId,
          orderIndex: i,
          points: Number(p.points) || 500,
        })),
      },
    },
    select: { id: true, title: true },
  })

  return NextResponse.json(contest, { status: 201 })
}
