import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function isAdmin(username?: string) {
  return username === process.env.ADMIN_GITHUB_USERNAME
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const username = (session?.user as { username?: string })?.username

  if (!isAdmin(username)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.blogPost.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
