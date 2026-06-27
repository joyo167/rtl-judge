'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'

type Stats = { problems: number; users: number; submissions: number }
type Post  = { id: string; title: string; content: string; createdAt: string }

function fmt(dt: string) {
  return new Date(dt).toLocaleString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center px-10">
      <span className="font-bold text-2xl text-[#1a5fb4]">{value}</span>
      <span className="text-sm text-[#6c757d] mt-0.5">{label}</span>
    </div>
  )
}

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
    <main className="max-w-3xl mx-auto px-6 py-8">
      {/* Stats bar */}
      <div className="flex items-center justify-center py-6">
        <StatItem value={stats.problems}    label="Problems"    />
        <div className="w-px h-10 bg-[#dee2e6]" />
        <StatItem value={stats.users}       label="Users"       />
        <div className="w-px h-10 bg-[#dee2e6]" />
        <StatItem value={stats.submissions} label="Submissions" />
      </div>
      <div className="border-b border-[#dee2e6] mb-8" />

      {/* Blog feed */}
      {posts.length === 0 ? (
        <p className="text-center text-[#6c757d] text-sm">No announcements yet.</p>
      ) : (
        <div>
          {posts.map((post, i) => (
            <div key={post.id}>
              <div className="py-6">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h2 className="text-lg font-semibold text-[#1a1a1a]">{post.title}</h2>
                  {isAdmin && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-xs text-red-500 hover:text-red-700 flex-shrink-0 mt-0.5"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#6c757d] mb-3">{fmt(post.createdAt)}</p>
                <div className="prose prose-sm max-w-none text-[#1a1a1a] leading-relaxed
                  [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2
                  [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2
                  [&_h3]:font-semibold [&_h3]:mb-1
                  [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
                  [&_code]:bg-[#f1f3f5] [&_code]:px-1 [&_code]:text-sm [&_code]:font-mono
                  [&_pre]:bg-[#f1f3f5] [&_pre]:p-3 [&_pre]:overflow-auto [&_pre]:text-sm
                  [&_strong]:font-semibold [&_a]:text-[#1a5fb4] [&_a]:underline">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </div>
              {i < posts.length - 1 && <div className="border-b border-[#dee2e6]" />}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
