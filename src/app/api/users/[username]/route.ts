import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const user = await prisma.user.findFirst({
    where: { username: params.username },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      points: true,
      solveCount: true,
      createdAt: true,
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const rank = await redis.zrevrank('leaderboard:global', user.id)

  const submissions = await prisma.submission.findMany({
    where: { userId: user.id },
    orderBy: { submittedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      verdict: true,
      submittedAt: true,
      runtimeMs: true,
      problem: {
        select: { title: true, slug: true, difficulty: true }
      }
    }
  })

  const solves = await prisma.userSolve.findMany({
    where: { userId: user.id },
    include: {
      problem: {
        select: { title: true, slug: true, difficulty: true }
      }
    },
    orderBy: { solvedAt: 'desc' }
  })

  return NextResponse.json({
    ...user,
    rank: rank !== null ? rank + 1 : null,
    submissions,
    solves,
  })
}
