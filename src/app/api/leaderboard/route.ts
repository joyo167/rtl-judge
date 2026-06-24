import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'

export async function GET() {
  const raw = await redis.zrevrange(
    'leaderboard:global', 0, 99, 'WITHSCORES'
  )

  const pairs: { userId: string; score: number }[] = []
  for (let i = 0; i < raw.length; i += 2) {
    pairs.push({ userId: raw[i], score: parseInt(raw[i + 1]) })
  }

  if (pairs.length === 0) {
    return NextResponse.json([])
  }

  const users = await prisma.user.findMany({
    where: { id: { in: pairs.map(p => p.userId) } },
    select: { id: true, username: true, avatarUrl: true, solveCount: true }
  })

  const leaderboard = pairs.map((pair, index) => {
    const user = users.find(u => u.id === pair.userId)
    return {
      rank: index + 1,
      userId: pair.userId,
      username: user?.username ?? 'Unknown',
      avatarUrl: user?.avatarUrl ?? null,
      solveCount: user?.solveCount ?? 0,
      points: pair.score,
    }
  })

  return NextResponse.json(leaderboard)
}
