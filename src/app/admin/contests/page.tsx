'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Problem = { id: string; title: string; slug: string; difficulty: string }
type ProblemSlot = { problemId: string; points: number }

export default function AdminContestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [slots, setSlots] = useState<ProblemSlot[]>([{ problemId: '', points: 500 }])
  const [problems, setProblems] = useState<Problem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const username = (session?.user as { username?: string })?.username
  const adminUsername = process.env.NEXT_PUBLIC_ADMIN_GITHUB_USERNAME

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/')
  }, [status, router])

  useEffect(() => {
    fetch('/api/problems')
      .then((r) => r.json())
      .then((d: Problem[]) => setProblems(d))
      .catch(() => {})
  }, [])

  function addSlot() {
    setSlots((s) => [...s, { problemId: '', points: 500 }])
  }

  function removeSlot(i: number) {
    setSlots((s) => s.filter((_, idx) => idx !== i))
  }

  function updateSlot(i: number, field: keyof ProblemSlot, value: string | number) {
    setSlots((s) => s.map((slot, idx) => idx === i ? { ...slot, [field]: value } : slot))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const validSlots = slots.filter((s) => s.problemId)
    if (validSlots.length === 0) {
      setError('Add at least one problem')
      setSubmitting(false)
      return
    }

    const res = await fetch('/api/contests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        problems: validSlots,
      }),
    })

    setSubmitting(false)

    if (res.ok) {
      router.push('/contests')
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
  }

  if (status === 'loading') return <main className="max-w-3xl mx-auto px-6 py-8"><p className="text-sm text-[#6c757d]">Loading…</p></main>
  if (adminUsername && username !== adminUsername) {
    return <main className="max-w-3xl mx-auto px-6 py-8"><p className="text-sm text-[#b71c1c]">Access denied. Admins only.</p></main>
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 font-[Inter,sans-serif]">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-8">Create Contest</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. RTL Round 1"
            className="w-full border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional contest description"
            className="w-full border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4] resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Start Time *</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">End Time *</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4]"
            />
          </div>
        </div>

        {/* Problems */}
        <div>
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">Problems *</label>
          <div className="space-y-2">
            {slots.map((slot, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-sm font-bold text-[#1a5fb4] w-6">{String.fromCharCode(65 + i)}</span>
                <select
                  value={slot.problemId}
                  onChange={(e) => updateSlot(i, 'problemId', e.target.value)}
                  className="flex-1 border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4] bg-white"
                >
                  <option value="">Select problem…</option>
                  {problems.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} ({p.difficulty})</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={slot.points}
                  onChange={(e) => updateSlot(i, 'points', Number(e.target.value))}
                  placeholder="Points"
                  className="w-24 border border-[#dee2e6] px-3 py-2 text-sm focus:outline-none focus:border-[#1a5fb4]"
                />
                {slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(i)}
                    className="text-[#e03131] text-sm px-2 hover:text-[#c92a2a]"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSlot}
            className="mt-3 text-sm text-[#1a5fb4] hover:underline"
          >
            + Add Problem
          </button>
        </div>

        {error && <p className="text-sm text-[#b71c1c]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#1a5fb4] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#1a4f94] disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Creating…' : 'Create Contest'}
        </button>
      </form>
    </main>
  )
}
