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

  async function handleSubmit() {
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
  `

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-12 bg-white border-b border-[#dee2e6] flex-shrink-0">
        <h1 className="text-sm font-bold text-[#1a1a1a]">New Announcement</h1>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-[#e03131]">{error}</span>}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#1a5fb4] text-white px-5 py-1.5 text-sm font-semibold hover:bg-[#1a4f94] disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Posting…' : 'Post Announcement'}
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 py-3 border-b border-[#dee2e6] bg-[#f8f9fa] flex-shrink-0">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          placeholder="Announcement title…"
          className="w-full bg-transparent text-xl font-bold text-[#1a1a1a] placeholder-[#adb5bd] focus:outline-none"
        />
      </div>

      {/* Editor + Preview split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex flex-col flex-1 border-r border-[#dee2e6]">
          <div className="px-4 py-1.5 bg-[#f8f9fa] border-b border-[#dee2e6]">
            <span className="text-xs font-medium text-[#6c757d] uppercase tracking-wider">Markdown</span>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={"Write in Markdown...\n\n**bold**, *italic*, # heading, `code`\n\n```\ncode block\n```"}
            className="flex-1 px-5 py-4 text-sm font-mono text-[#1a1a1a] bg-white focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="px-4 py-1.5 bg-[#f8f9fa] border-b border-[#dee2e6] flex-shrink-0">
            <span className="text-xs font-medium text-[#6c757d] uppercase tracking-wider">Preview</span>
          </div>
          <div className={`px-6 py-4 flex-1 ${mdClass}`}>
            {content
              ? <ReactMarkdown>{content}</ReactMarkdown>
              : <p className="text-[#adb5bd] text-sm italic">Nothing to preview yet…</p>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
