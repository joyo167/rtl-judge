import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  const users = await prisma.user.findMany({
    select: { id: true, email: true, username: true, githubId: true },
  })
  const submissionCount = await prisma.submission.count()
  return NextResponse.json({
    sessionEmail: session?.user?.email ?? null,
    sessionUser: session?.user ?? null,
    dbUsers: users,
    submissionCount,
  })
}
