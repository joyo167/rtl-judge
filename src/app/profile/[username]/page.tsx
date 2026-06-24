'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const difficultyColor: Record<string, string> = {
  Easy: '#2e7d32',
  Medium: '#e65100',
  Hard: '#b71c1c',
}

interface Submission {
  id: string
  verdict: string
  submittedAt: string
  runtimeMs: number | null
  problem: { title: string; slug: string; difficulty: string }
}

interface Solve {
  solvedAt: string
  problem: { title: string; slug: string; difficulty: string }
}

interface UserProfile {
  id: string
  username: string
  name: string | null
  avatarUrl: string | null
  points: number
  solveCount: number
  createdAt: string
  rank: number | null
  submissions: Submission[]
  solves: Solve[]
}

export default function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/users/${params.username}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(data => { if (data) { setProfile(data); setLoading(false) } })
      .catch(() => setLoading(false))
  }, [params.username])

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-sm text-[#6c757d]">Loading…</p>
      </main>
    )
  }

  if (notFound || !profile) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-sm text-[#6c757d]">User not found.</p>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 font-[Inter,sans-serif]">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        {profile.avatarUrl && (
          <img
            src={profile.avatarUrl}
            alt={profile.username}
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">{profile.username}</h1>
          {profile.name && profile.name !== profile.username && (
            <p className="text-sm text-[#6c757d]">{profile.name}</p>
          )}
          <p className="text-xs text-[#6c757d] mt-0.5">
            Joined {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="flex items-center gap-0 border border-[#dee2e6] mb-8 w-fit">
        <div className="px-6 py-4 text-center border-r border-[#dee2e6]">
          <p className="text-xl font-bold text-[#1a1a1a]">
            {profile.rank !== null ? `#${profile.rank}` : '—'}
          </p>
          <p className="text-xs text-[#6c757d] mt-0.5">Global Rank</p>
        </div>
        <div className="px-6 py-4 text-center border-r border-[#dee2e6]">
          <p className="text-xl font-bold text-[#1a1a1a]">{profile.solveCount}</p>
          <p className="text-xs text-[#6c757d] mt-0.5">Problems Solved</p>
        </div>
        <div className="px-6 py-4 text-center">
          <p className="text-xl font-bold text-[#1a1a1a]">{profile.points}</p>
          <p className="text-xs text-[#6c757d] mt-0.5">Points</p>
        </div>
      </div>

      {/* ── Solved Problems ── */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[#1a1a1a] mb-3">Solved Problems</h2>
        {profile.solves.length === 0 ? (
          <p className="text-sm text-[#6c757d]">No problems solved yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse border border-[#dee2e6]">
            <thead>
              <tr className="bg-[#f8f9fa] text-left">
                <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Title</th>
                <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Difficulty</th>
                <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Solved At</th>
              </tr>
            </thead>
            <tbody>
              {profile.solves.map(s => (
                <tr key={s.problem.slug} className="bg-white hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-4 py-3 border border-[#dee2e6]">
                    <Link href={`/problems/${s.problem.slug}`} className="text-[#1a5fb4] hover:underline">
                      {s.problem.title}
                    </Link>
                  </td>
                  <td
                    className="px-4 py-3 border border-[#dee2e6] font-medium"
                    style={{ color: difficultyColor[s.problem.difficulty] ?? '#1a1a1a' }}
                  >
                    {s.problem.difficulty}
                  </td>
                  <td className="px-4 py-3 text-[#6c757d] border border-[#dee2e6]">
                    {new Date(s.solvedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ── Recent Submissions ── */}
      <section>
        <h2 className="text-lg font-semibold text-[#1a1a1a] mb-3">Recent Submissions</h2>
        {profile.submissions.length === 0 ? (
          <p className="text-sm text-[#6c757d]">No submissions yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse border border-[#dee2e6]">
            <thead>
              <tr className="bg-[#f8f9fa] text-left">
                <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Problem</th>
                <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Verdict</th>
                <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Runtime</th>
                <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Time</th>
              </tr>
            </thead>
            <tbody>
              {profile.submissions.map(sub => (
                <tr key={sub.id} className="bg-white hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-4 py-3 border border-[#dee2e6]">
                    <Link href={`/problems/${sub.problem.slug}`} className="text-[#1a5fb4] hover:underline">
                      {sub.problem.title}
                    </Link>
                  </td>
                  <td
                    className="px-4 py-3 border border-[#dee2e6] font-semibold"
                    style={{ color: sub.verdict === 'AC' ? '#2e7d32' : '#b71c1c' }}
                  >
                    {sub.verdict.toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-[#6c757d] border border-[#dee2e6]">
                    {sub.runtimeMs !== null ? `${sub.runtimeMs} ms` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#6c757d] border border-[#dee2e6]">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}
