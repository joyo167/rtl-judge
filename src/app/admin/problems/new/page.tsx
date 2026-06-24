'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic_ from 'next/dynamic'

const MonacoEditor = dynamic_(() => import('@monaco-editor/react'), { ssr: false })

const DIFFICULTY_POINTS: Record<string, number> = {
  Easy: 100,
  Medium: 200,
  Hard: 300,
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function NewProblemPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [difficulty, setDifficulty] = useState('Easy')
  const [points, setPoints] = useState(100)
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [starterCode, setStarterCode] = useState('')
  const [testbenchCode, setTestbenchCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const username = (session?.user as { username?: string })?.username
  const adminUsername = process.env.NEXT_PUBLIC_ADMIN_GITHUB_USERNAME

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/')
  }, [status, router])

  useEffect(() => {
    if (!slugEdited) setSlug(toSlug(title))
  }, [title, slugEdited])

  useEffect(() => {
    setPoints(DIFFICULTY_POINTS[difficulty] ?? 100)
  }, [difficulty])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)

    const res = await fetch('/api/admin/problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, difficulty, points, tags: tagList, description, starterCode, testbenchCode }),
    })

    setSubmitting(false)

    if (res.ok) {
      const problem = await res.json()
      setSuccess(`Problem "${problem.title}" created! Slug: ${problem.slug}`)
      setTitle(''); setSlug(''); setSlugEdited(false)
      setDifficulty('Easy'); setPoints(100); setTags('')
      setDescription(''); setStarterCode(''); setTestbenchCode('')
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
  }, [title, slug, difficulty, points, tags, description, starterCode, testbenchCode])

  if (status === 'loading') {
    return <main className="max-w-4xl mx-auto px-6 py-8"><p className="text-sm text-[#6c757d]">Loading…</p></main>
  }

  if (adminUsername && username !== adminUsername) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-sm text-[#b71c1c]">Access denied. Admins only.</p>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 font-[Inter,sans-serif]">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-8">Add New Problem</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title + Slug */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. D Flip-Flop"
              required
              className="w-full border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Slug *</label>
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugEdited(true) }}
              placeholder="e.g. d-flip-flop"
              required
              className="w-full border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4]"
            />
          </div>
        </div>

        {/* Difficulty + Points + Tags */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Difficulty *</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4] bg-white"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Points</label>
            <input
              type="number"
              value={points}
              onChange={e => setPoints(Number(e.target.value))}
              className="w-full border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Tags <span className="text-[#6c757d] font-normal">(comma-separated)</span></label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. sequential, flip-flop"
              className="w-full border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4]"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Description * <span className="text-[#6c757d] font-normal">(paste from AI)</span></label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={8}
            placeholder="Paste the problem description here. Markdown supported."
            className="w-full border border-[#dee2e6] px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#1a5fb4] resize-y"
          />
        </div>

        {/* Starter Code */}
        <div>
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Starter Code <span className="text-[#6c757d] font-normal">(shown to users in editor)</span></label>
          <div className="border border-[#dee2e6]">
            <MonacoEditor
              height="220px"
              language="verilog"
              theme="light"
              value={starterCode}
              onChange={v => setStarterCode(v ?? '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                wordWrap: 'on',
              }}
            />
          </div>
        </div>

        {/* Testbench Code */}
        <div>
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">
            Testbench Code * <span className="text-[#6c757d] font-normal">(must end with VERDICT: ACCEPTED / VERDICT: WRONG_ANSWER)</span>
          </label>
          <div className="border border-[#dee2e6]">
            <MonacoEditor
              height="360px"
              language="verilog"
              theme="light"
              value={testbenchCode}
              onChange={v => setTestbenchCode(v ?? '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                wordWrap: 'on',
              }}
            />
          </div>
          <p className="text-xs text-[#6c757d] mt-1">
            Last lines must be: <code className="bg-[#f8f9fa] px-1">if (errors == 0) $display("VERDICT: ACCEPTED"); else $display("VERDICT: WRONG_ANSWER");</code>
          </p>
        </div>

        {/* Feedback */}
        {error && <p className="text-sm text-[#b71c1c] font-medium">{error}</p>}
        {success && <p className="text-sm text-[#2e7d32] font-medium">{success}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#1a5fb4] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#1a4f94] disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Saving…' : 'Add Problem'}
        </button>

      </form>
    </main>
  )
}
