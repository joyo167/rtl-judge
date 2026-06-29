'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type Problem = { id: string; title: string; difficulty: string; description: string; starterCode: string | null }
type VerdictState = { verdict: string; executionOutput: string | null; runtimeMs: number | null } | null
type SubRow = { id: string; verdict: string; attemptNum: number; submittedAt: string; runtimeMs: number | null; executionOutput: string | null }

const diffColors: Record<string, string> = { Easy: '#2f9e44', Medium: '#f08c00', Hard: '#e03131' }

export default function ContestProblemPage() {
  const { id: contestId, slug } = useParams<{ id: string; slug: string }>()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [problem, setProblem] = useState<Problem | null>(null)
  const [editorValue, setEditorValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<VerdictState>(null)
  const [mySubs, setMySubs] = useState<SubRow[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load problem details from contest API
  useEffect(() => {
    fetch(`/api/contests/${contestId}`)
      .then((r) => r.json())
      .then((contest) => {
        const found = (contest.problems ?? []).find((p: { slug: string }) => p.slug === slug)
        if (!found) return
        // Fetch full problem description from problems API
        fetch(`/api/problems/${slug}`)
          .then((r) => r.json())
          .then((p) => {
            setProblem(p)
            setEditorValue(p.starterCode ?? '')
          })
      })
  }, [contestId, slug])

  function loadMySubs() {
    fetch(`/api/contests/${contestId}/submissions`)
      .then((r) => r.json())
      .then((grouped: Record<string, SubRow[]>) => {
        if (problem) {
          setMySubs(grouped[problem.id] ?? [])
        }
      })
  }

  useEffect(() => {
    if (problem) loadMySubs()
  }, [problem])

  async function handleSubmit() {
    if (!problem) return
    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch(`/api/contests/${contestId}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem.id, code: editorValue }),
      })

      if (!res.ok) {
        const err = await res.json()
        setResult({ verdict: err.error ?? 'Error', executionOutput: null, runtimeMs: null })
        setSubmitting(false)
        return
      }

      const { submissionId } = await res.json()

      pollRef.current = setInterval(async () => {
        const poll = await fetch(`/api/contests/${contestId}/submissions`)
        if (!poll.ok) return
        const grouped: Record<string, SubRow[]> = await poll.json()
        const subs = grouped[problem.id] ?? []
        const sub = subs.find((s) => s.id === submissionId)
        if (sub && sub.verdict !== 'pending') {
          clearInterval(pollRef.current!)
          pollRef.current = null
          setResult({ verdict: sub.verdict, executionOutput: sub.executionOutput, runtimeMs: sub.runtimeMs })
          setSubmitting(false)
          setMySubs(subs)
        }
      }, 1500)
    } catch {
      setResult({ verdict: 'Network error', executionOutput: null, runtimeMs: null })
      setSubmitting(false)
    }
  }

  const isAC = result?.verdict === 'AC'

  if (!problem) return (
    <div className="flex items-center justify-center h-[calc(100vh-56px)]">
      <p className="text-sm text-[#6c757d]">Loading…</p>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* LEFT */}
      <div className="overflow-y-auto flex-shrink-0 bg-white w-[40%] p-6 border-r border-[#dee2e6]">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-[#1a1a1a]">{problem.title}</h1>
          <span className="text-sm font-medium" style={{ color: diffColors[problem.difficulty] ?? '#1a1a1a' }}>
            {problem.difficulty}
          </span>
        </div>

        <div className="text-sm leading-relaxed text-[#6c757d] mb-6">
          <h3 className="font-semibold text-base mb-2 text-[#1a1a1a]">Problem Statement</h3>
          <p className="whitespace-pre-wrap">{problem.description}</p>
        </div>

        {/* My attempts */}
        {mySubs.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-[#1a1a1a] mb-2">My Attempts</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#6c757d] border-b border-[#dee2e6]">
                  <th className="text-left py-1 pr-2 font-medium">#</th>
                  <th className="text-left py-1 pr-2 font-medium">Verdict</th>
                  <th className="text-left py-1 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {[...mySubs].reverse().map((s) => {
                  const green = s.verdict === 'AC'
                  const gray = s.verdict === 'pending'
                  const expandable = ['CE','WA','RE','TLE'].includes(s.verdict)
                  const open = expanded === s.id
                  return (
                    <>
                      <tr
                        key={s.id}
                        onClick={() => expandable && setExpanded(open ? null : s.id)}
                        className={`border-b border-[#f1f3f5] ${expandable ? 'cursor-pointer hover:bg-[#f8f9fa]' : ''}`}
                      >
                        <td className="py-1.5 pr-2 text-[#6c757d]">{s.attemptNum}</td>
                        <td className="py-1.5 pr-2 font-semibold" style={{ color: green ? '#2f9e44' : gray ? '#6c757d' : '#e03131' }}>
                          {s.verdict}
                        </td>
                        <td className="py-1.5 text-[#6c757d]">{new Date(s.submittedAt).toLocaleTimeString()}</td>
                      </tr>
                      {expandable && open && s.executionOutput && (
                        <tr key={`${s.id}-out`}>
                          <td colSpan={3}>
                            <pre className="bg-[#f8f9fa] border border-[#dee2e6] p-2 text-xs whitespace-pre-wrap overflow-auto max-h-32 mb-1">
                              {s.executionOutput}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex flex-col flex-1 bg-white">
        <div className="flex items-center px-4 flex-shrink-0 bg-[#f8f9fa] h-10 border-b border-[#dee2e6]">
          <span className="text-xs text-[#6c757d] px-2 py-1 border border-[#dee2e6]">Verilog</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            language="verilog"
            theme={mounted && resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
            defaultValue={problem.starterCode ?? ''}
            onChange={(val) => setEditorValue(val ?? '')}
            options={{ fontSize: 14, minimap: { enabled: false }, lineNumbers: 'on', scrollBeyondLastLine: false, padding: { top: 16 } }}
          />
        </div>
        <div className="flex items-center justify-between px-4 flex-shrink-0 bg-[#f8f9fa] h-14 border-t border-[#dee2e6]">
          <div className="flex flex-col justify-center">
            {submitting && <span className="text-sm text-[#6c757d]">Judging…</span>}
            {result && !submitting && (
              <>
                <span className="text-sm font-semibold" style={{ color: isAC ? '#2f9e44' : '#e03131' }}>
                  {result.verdict}
                </span>
                {result.executionOutput && (
                  <pre className="text-xs text-[#6c757d] mt-1 max-w-xs truncate">{result.executionOutput}</pre>
                )}
              </>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#1a5fb4] hover:bg-[#164a8a] disabled:opacity-50 text-white text-sm px-6 py-2 font-medium transition-colors"
          >
            {submitting ? 'Judging…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
