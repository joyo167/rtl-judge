'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Contest = {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  status: 'upcoming' | 'ongoing' | 'ended'
}

const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
  ongoing: { label: 'Live', color: '#2f9e44', bg: '#ebfbee' },
  upcoming: { label: 'Upcoming', color: '#1a5fb4', bg: '#e8f0fd' },
  ended:    { label: 'Ended',    color: '#6c757d', bg: '#f8f9fa' },
}

function fmt(dt: string) {
  return new Date(dt).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function Row({ c, onClick }: { c: Contest; onClick: () => void }) {
  const badge = statusBadge[c.status]
  return (
    <tr
      onClick={onClick}
      className="border-b border-[#f1f3f5] hover:bg-[#f8f9fa] cursor-pointer"
    >
      <td className="py-3 pr-4 text-sm font-medium text-[#1a1a1a]">{c.title}</td>
      <td className="py-3 pr-4 text-sm text-[#6c757d]">{fmt(c.startTime)}</td>
      <td className="py-3 pr-4 text-sm text-[#6c757d]">{fmt(c.endTime)}</td>
      <td className="py-3">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded"
          style={{ color: badge.color, background: badge.bg }}
        >
          {badge.label}
        </span>
      </td>
    </tr>
  )
}

function Section({ title, contests, onNav }: { title: string; contests: Contest[]; onNav: (id: string) => void }) {
  if (!contests.length) return null
  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold uppercase tracking-widest text-[#6c757d] mb-3">{title}</h2>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#dee2e6] text-xs text-[#6c757d]">
            <th className="text-left py-2 pr-4 font-medium">Title</th>
            <th className="text-left py-2 pr-4 font-medium">Start</th>
            <th className="text-left py-2 pr-4 font-medium">End</th>
            <th className="text-left py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {contests.map((c) => (
            <Row key={c.id} c={c} onClick={() => onNav(c.id)} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ContestsPage() {
  const router = useRouter()
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/contests')
      .then((r) => r.json())
      .then((d) => { setContests(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const ongoing  = contests.filter((c) => c.status === 'ongoing')
  const upcoming = contests.filter((c) => c.status === 'upcoming')
  const ended    = contests.filter((c) => c.status === 'ended')

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-8">Contests</h1>
      {loading && <p className="text-sm text-[#6c757d]">Loading…</p>}
      {!loading && contests.length === 0 && (
        <p className="text-sm text-[#6c757d]">No contests yet.</p>
      )}
      <Section title="Live Now" contests={ongoing}  onNav={(id) => router.push(`/contests/${id}`)} />
      <Section title="Upcoming" contests={upcoming} onNav={(id) => router.push(`/contests/${id}`)} />
      <Section title="Past"     contests={ended}    onNav={(id) => router.push(`/contests/${id}`)} />
    </main>
  )
}
