'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type ContestProblem = {
  label: string
  id: string
  title: string
  slug: string
  difficulty: string
  points: number
}

type Contest = {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  status: 'upcoming' | 'ongoing' | 'ended'
  problemCount: number
  problems: ContestProblem[] | null
}

function useCountdown(target: string) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) { setRemaining('0:00:00'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [target])

  return remaining
}

const diffColors: Record<string, string> = {
  Easy: '#2f9e44', Medium: '#f08c00', Hard: '#e03131',
}

export default function ContestPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [contest, setContest] = useState<Contest | null>(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    function load() {
      fetch(`/api/contests/${id}`)
        .then((r) => r.json())
        .then((d) => { setContest(d); setLoading(false) })
        .catch(() => setLoading(false))
    }
    load()
    // Re-fetch when contest is upcoming, so problems appear on start
    timerRef.current = setInterval(load, 30000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [id])

  const countdown = useCountdown(
    contest?.status === 'upcoming' ? contest.startTime :
    contest?.status === 'ongoing'  ? contest.endTime : ''
  )

  if (loading) return <main className="max-w-5xl mx-auto px-6 py-8"><p className="text-sm text-[#6c757d]">Loading…</p></main>
  if (!contest || (contest as { error?: string }).error) return <main className="max-w-5xl mx-auto px-6 py-8"><p className="text-sm text-[#6c757d]">Contest not found.</p></main>

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">{contest.title}</h1>
        <Link
          href={`/contests/${id}/standings`}
          className="text-sm text-[#1a5fb4] hover:underline ml-4 mt-1"
        >
          View Standings →
        </Link>
      </div>

      {contest.description && (
        <p className="text-sm text-[#6c757d] mb-4 whitespace-pre-wrap">{contest.description}</p>
      )}

      {/* Timer */}
      {contest.status === 'upcoming' && (
        <div className="mb-6 inline-flex items-center gap-2 bg-[#e8f0fd] px-4 py-2 rounded">
          <span className="text-sm text-[#1a5fb4] font-medium">Starts in</span>
          <span className="text-lg font-bold text-[#1a5fb4] font-mono">{countdown}</span>
        </div>
      )}
      {contest.status === 'ongoing' && (
        <div className="mb-6 inline-flex items-center gap-2 bg-[#ebfbee] px-4 py-2 rounded">
          <span className="text-sm text-[#2f9e44] font-medium">Ends in</span>
          <span className="text-lg font-bold text-[#2f9e44] font-mono">{countdown}</span>
        </div>
      )}
      {contest.status === 'ended' && (
        <div className="mb-6 inline-flex items-center gap-2 bg-[#f8f9fa] px-4 py-2 rounded">
          <span className="text-sm text-[#6c757d] font-medium">Contest ended</span>
        </div>
      )}

      {/* Problems */}
      {contest.status === 'upcoming' ? (
        <div className="text-sm text-[#6c757d] border border-[#dee2e6] p-6 text-center">
          <p className="font-medium mb-1">Contest has not started yet</p>
          <p>{contest.problemCount} problem{contest.problemCount !== 1 ? 's' : ''} will be revealed at start</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#dee2e6] text-xs text-[#6c757d]">
              <th className="text-left py-2 pr-4 font-medium w-10">#</th>
              <th className="text-left py-2 pr-4 font-medium">Title</th>
              <th className="text-left py-2 pr-4 font-medium">Difficulty</th>
              <th className="text-left py-2 font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {(contest.problems ?? []).map((p) => (
              <tr
                key={p.id}
                className="border-b border-[#f1f3f5] hover:bg-[#f8f9fa] cursor-pointer"
                onClick={() => router.push(`/contests/${id}/problems/${p.slug}`)}
              >
                <td className="py-3 pr-4 text-sm font-bold text-[#1a5fb4]">{p.label}</td>
                <td className="py-3 pr-4 text-sm font-medium text-[#1a1a1a]">{p.title}</td>
                <td className="py-3 pr-4 text-sm" style={{ color: diffColors[p.difficulty] ?? '#1a1a1a' }}>{p.difficulty}</td>
                <td className="py-3 text-sm text-[#6c757d]">{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
