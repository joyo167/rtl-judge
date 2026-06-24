import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

function isAdmin(username?: string) {
  return username === process.env.ADMIN_GITHUB_USERNAME
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const username = (session?.user as { username?: string })?.username

  if (!isAdmin(username)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, slug, difficulty, points, tags, description, starterCode, testbenchCode } = body

  if (!title || !slug || !difficulty || !description || !testbenchCode) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.problem.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
  }

  const problem = await prisma.problem.create({
    data: {
      id: randomUUID(),
      title,
      slug,
      difficulty,
      points: Number(points) || 100,
      tags: Array.isArray(tags) ? tags : [],
      description,
      starterCode: starterCode || '',
      testbenchCode,
    },
  })

  return NextResponse.json(problem, { status: 201 })
}
