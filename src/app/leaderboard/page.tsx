'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatarUrl: string | null
  solveCount: number
  points: number
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Leaderboard</h1>

      {loading ? (
        <p className="text-sm text-[#6c757d]">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-[#6c757d] text-center py-12">
          No submissions yet. Be the first to solve a problem!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-[#dee2e6]">
            <thead>
              <tr className="bg-[#f8f9fa] text-left">
                <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6] w-16">Rank</th>
                <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">User</th>
                <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Problems Solved</th>
                <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Points</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.userId} className="bg-white hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-4 py-3 text-[#6c757d] border border-[#dee2e6]">#{entry.rank}</td>
                  <td className="px-4 py-3 border border-[#dee2e6]">
                    <div className="flex items-center gap-2">
                      {entry.avatarUrl && (
                        <img
                          src={entry.avatarUrl}
                          alt={entry.username}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="font-medium text-[#1a5fb4]">{entry.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#1a1a1a] border border-[#dee2e6]">{entry.solveCount}</td>
                  <td className="px-4 py-3 text-[#1a1a1a] border border-[#dee2e6]">{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
