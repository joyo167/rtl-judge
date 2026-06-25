'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type ProblemCell = { solved: boolean; attempts: number; solveTime?: number; penalty?: number }
type StandingRow = {
  rank: number
  userId: string
  username: string
  avatarUrl: string | null
  solved: number
  totalPenalty: number
  problems: Record<string, ProblemCell>
}
type ProblemLabel = { problemId: string; label: string }
type Standings = { rows: StandingRow[]; problemLabels: ProblemLabel[] }

export default function StandingsPage() {
  const { id: contestId } = useParams<{ id: string }>()
  const [data, setData] = useState<Standings | null>(null)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function load() {
    fetch(`/api/contests/${contestId}/standings`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
    fetch(`/api/contests/${contestId}`)
      .then((r) => r.json())
      .then((c) => setStatus(c.status))
  }

  useEffect(() => {
    load()
    timerRef.current = setInterval(() => {
      if (status === 'ongoing') load()
    }, 30000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [contestId])

  if (loading) return <main className="max-w-6xl mx-auto px-6 py-8"><p className="text-sm text-[#6c757d]">Loading…</p></main>
  if (!data) return <main className="max-w-6xl mx-auto px-6 py-8"><p className="text-sm text-[#6c757d]">Failed to load standings.</p></main>

  const { rows, problemLabels } = data

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/contests/${contestId}`} className="text-sm text-[#1a5fb4] hover:underline">← Back to Contest</Link>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Standings</h1>
        {status === 'ongoing' && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#ebfbee] text-[#2f9e44]">Live</span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-[#6c757d]">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dee2e6] text-xs text-[#6c757d]">
                <th className="text-left py-2 pr-4 font-medium w-12">Rank</th>
                <th className="text-left py-2 pr-4 font-medium">User</th>
                <th className="text-left py-2 pr-4 font-medium">Solved</th>
                <th className="text-left py-2 pr-4 font-medium">Penalty</th>
                {problemLabels.map((pl) => (
                  <th key={pl.problemId} className="text-center py-2 px-3 font-medium">{pl.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.userId} className="border-b border-[#f1f3f5] hover:bg-[#f8f9fa]">
                  <td className="py-2.5 pr-4 text-[#6c757d]">{row.rank}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      {row.avatarUrl && (
                        <img src={row.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                      )}
                      <Link href={`/profile/${row.username}`} className="text-[#1a5fb4] hover:underline font-medium">
                        {row.username}
                      </Link>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 font-semibold text-[#1a1a1a]">{row.solved}</td>
                  <td className="py-2.5 pr-4 text-[#6c757d]">{row.totalPenalty}</td>
                  {problemLabels.map((pl) => {
                    const cell = row.problems[pl.problemId]
                    if (!cell) return <td key={pl.problemId} className="py-2.5 px-3 text-center text-[#dee2e6]">—</td>
                    if (cell.solved) return (
                      <td key={pl.problemId} className="py-2.5 px-3 text-center">
                        <span className="text-[#2f9e44] font-semibold block text-xs">+{cell.attempts > 1 ? cell.attempts - 1 : ''}</span>
                        <span className="text-[#2f9e44] text-xs">{cell.solveTime}m</span>
                      </td>
                    )
                    return (
                      <td key={pl.problemId} className="py-2.5 px-3 text-center text-[#e03131] text-xs">
                        -{cell.attempts}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
