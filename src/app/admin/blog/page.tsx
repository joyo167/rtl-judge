'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

export default function AdminBlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')

  const username    = (session?.user as { username?: string })?.username
  const adminUsername = process.env.NEXT_PUBLIC_ADMIN_GITHUB_USERNAME

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/')
  }, [status, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })

    setSubmitting(false)

    if (res.ok) {
      router.push('/')
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
  }

  if (status === 'loading') {
    return <main className="max-w-3xl mx-auto px-6 py-8"><p className="text-sm text-[#6c757d]">Loading…</p></main>
  }

  if (adminUsername && username !== adminUsername) {
    return <main className="max-w-3xl mx-auto px-6 py-8"><p className="text-sm text-[#b71c1c]">Access denied. Admins only.</p></main>
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 font-[Inter,sans-serif]">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-8">Post Announcement</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Announcement title"
            className="w-full border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Content *</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={12}
            placeholder={"Write in Markdown.\n**bold**, # heading, `code`, etc."}
            className="w-full border border-[#dee2e6] px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#1a5fb4] resize-y"
            style={{ minHeight: '300px' }}
          />
        </div>

        {content && (
          <div>
            <p className="text-sm text-[#6c757d] mb-2">Preview:</p>
            <div className="border border-[#dee2e6] p-4 min-h-[100px] text-sm text-[#1a1a1a] leading-relaxed
              [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2
              [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2
              [&_h3]:font-semibold [&_h3]:mb-1
              [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
              [&_code]:bg-[#f1f3f5] [&_code]:px-1 [&_code]:font-mono
              [&_pre]:bg-[#f1f3f5] [&_pre]:p-3 [&_pre]:overflow-auto
              [&_strong]:font-semibold [&_a]:text-[#1a5fb4] [&_a]:underline">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-[#b71c1c]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#1a5fb4] text-white px-6 py-2 text-sm font-semibold hover:bg-[#1a4f94] disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Posting…' : 'Post Announcement'}
        </button>
      </form>
    </main>
  )
}
