import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function isAdmin(username?: string) {
  return username === process.env.ADMIN_GITHUB_USERNAME
}

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const username = (session?.user as { username?: string })?.username

  if (!isAdmin(username)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, content } = await req.json()
  if (!title || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const post = await prisma.blogPost.create({ data: { title, content } })
  return NextResponse.json(post)
}
