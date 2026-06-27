'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

type Stats = { problems: number; users: number; submissions: number }
type Post  = { id: string; title: string; content: string; createdAt: string }

function fmt(dt: string) {
  return new Date(dt).toLocaleString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatCard({ value, label, icon }: { value: number; label: string; icon: string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white border border-[#dee2e6] px-10 py-5 flex-1">
      <span className="text-2xl mb-1">{icon}</span>
      <span className="font-bold text-3xl text-[#1a5fb4] tabular-nums">{value.toLocaleString()}</span>
      <span className="text-xs font-medium uppercase tracking-widest text-[#6c757d]">{label}</span>
    </div>
  )
}

const mdClass = `
  text-[#1a1a1a] leading-relaxed text-sm
  [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
  [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2
  [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
  [&_p]:mb-3 [&_p:last-child]:mb-0
  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
  [&_li]:mb-1
  [&_code]:bg-[#f1f3f5] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-[#c92a2a]
  [&_pre]:bg-[#f8f9fa] [&_pre]:border [&_pre]:border-[#dee2e6] [&_pre]:p-3 [&_pre]:overflow-auto [&_pre]:text-xs [&_pre]:mb-3 [&_pre]:rounded
  [&_pre_code]:bg-transparent [&_pre_code]:text-[#1a1a1a] [&_pre_code]:p-0
  [&_strong]:font-semibold
  [&_a]:text-[#1a5fb4] [&_a]:underline [&_a]:underline-offset-2
  [&_blockquote]:border-l-4 [&_blockquote]:border-[#1a5fb4] [&_blockquote]:pl-4 [&_blockquote]:text-[#6c757d] [&_blockquote]:italic [&_blockquote]:my-3
  [&_hr]:border-[#dee2e6] [&_hr]:my-4
`

export default function HomePage() {
  const { data: session } = useSession()
  const username = (session?.user as { username?: string })?.username
  const isAdmin  = username === process.env.NEXT_PUBLIC_ADMIN_GITHUB_USERNAME

  const [stats, setStats] = useState<Stats>({ problems: 0, users: 0, submissions: 0 })
  const [posts, setPosts]  = useState<Post[]>([])

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
    fetch('/api/blog').then(r => r.json()).then(setPosts).catch(() => {})
  }, [])

  async function deletePost(id: string) {
    if (!confirm('Delete this announcement?')) return
    await fetch(`/api/blog/${id}`, { method: 'DELETE' })
    setPosts(p => p.filter(x => x.id !== id))
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-[#1a5fb4] text-white">
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">RTL Judge</h1>
          <p className="text-[#a5c8f0] text-base max-w-xl mx-auto mb-8">
            Practice RTL design challenges, compete in timed contests, and climb the leaderboard.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/problems"
              className="bg-white text-[#1a5fb4] font-semibold text-sm px-6 py-2.5 hover:bg-[#e8f0fd] transition-colors"
            >
              Browse Problems
            </Link>
            <Link
              href="/contests"
              className="border border-white text-white font-semibold text-sm px-6 py-2.5 hover:bg-white/10 transition-colors"
            >
              View Contests
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-6 -mt-6 mb-12">
        <div className="flex gap-3">
          <StatCard value={stats.problems}    label="Problems"    icon="📋" />
          <StatCard value={stats.users}       label="Users"       icon="👥" />
          <StatCard value={stats.submissions} label="Submissions" icon="⚡" />
        </div>
      </div>

      {/* Announcements */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1a1a1a] flex items-center gap-2">
            <span className="inline-block w-1 h-5 bg-[#1a5fb4] rounded-full" />
            Announcements
          </h2>
          {isAdmin && (
            <Link href="/admin/blog" className="text-xs font-medium text-[#1a5fb4] border border-[#1a5fb4] px-3 py-1 hover:bg-[#e8f0fd] transition-colors">
              + New Post
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-[#6c757d]">
            <p className="text-4xl mb-3">📢</p>
            <p className="text-sm">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border border-[#dee2e6] hover:border-[#adb5bd] transition-colors">
                {/* Post header */}
                <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b border-[#f1f3f5]">
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a] text-base leading-snug">{post.title}</h3>
                    <p className="text-xs text-[#6c757d] mt-1 flex items-center gap-1">
                      <span>📅</span>
                      {fmt(post.createdAt)}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="flex-shrink-0 text-xs text-[#6c757d] hover:text-[#e03131] border border-transparent hover:border-[#e03131] px-2 py-1 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
                {/* Post body */}
                <div className={`px-5 py-4 ${mdClass}`}>
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
