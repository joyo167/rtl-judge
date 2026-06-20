"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Problem = {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  starterCode: string | null;
};

type VerdictState = {
  verdict: string;
  executionOutput: string | null;
  runtimeMs: number | null;
} | null;

const difficultyColors: Record<string, string> = {
  Easy: "#2f9e44",
  Medium: "#f08c00",
  Hard: "#e03131",
};

type Tab = "description" | "submissions";

export default function ProblemDetail({ problem }: { problem: Problem }) {
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [editorValue, setEditorValue] = useState(problem.starterCode ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<VerdictState>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, code: editorValue }),
      });

      if (!res.ok) {
        const err = await res.json();
        setResult({ verdict: err.error ?? "Error", executionOutput: null, runtimeMs: null });
        setSubmitting(false);
        return;
      }

      const { submissionId } = await res.json();

      pollRef.current = setInterval(async () => {
        const poll = await fetch(`/api/submissions/${submissionId}`);
        if (!poll.ok) return;
        const data = await poll.json();
        if (data.verdict !== "pending") {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setResult(data);
          setSubmitting(false);
        }
      }, 1500);
    } catch {
      setResult({ verdict: "Network error", executionOutput: null, runtimeMs: null });
      setSubmitting(false);
    }
  }

  const isAC = result?.verdict === "AC" || result?.verdict === "Accepted";

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* LEFT PANEL */}
      <div className="overflow-y-auto flex-shrink-0 bg-white w-[40%] p-6 border-r border-[#dee2e6]">
        {/* Title + difficulty */}
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-[#1a1a1a]">{problem.title}</h1>
          <span
            className="text-sm font-medium"
            style={{ color: difficultyColors[problem.difficulty] ?? "#1a1a1a" }}
          >
            {problem.difficulty}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-5 border-b border-[#dee2e6]">
          {(["description", "submissions"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm capitalize ${
                activeTab === tab
                  ? "text-[#1a1a1a] font-semibold border-b-2 border-[#1a5fb4]"
                  : "text-[#6c757d]"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "description" ? (
          <div className="space-y-5 text-sm leading-relaxed text-[#6c757d]">
            <div>
              <h3 className="font-semibold text-base mb-2 text-[#1a1a1a]">Problem Statement</h3>
              <p className="whitespace-pre-wrap">{problem.description}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-[#6c757d] text-sm">No submissions yet</p>
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col flex-1 bg-white">
        {/* Top bar */}
        <div className="flex items-center px-4 flex-shrink-0 bg-[#f8f9fa] h-10 border-b border-[#dee2e6]">
          <span className="text-xs text-[#6c757d] px-2 py-1 border border-[#dee2e6]">Verilog</span>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            language="verilog"
            theme="vs"
            defaultValue={problem.starterCode ?? ""}
            onChange={(val) => setEditorValue(val ?? "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              padding: { top: 16 },
            }}
          />
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 flex-shrink-0 bg-[#f8f9fa] h-14 border-t border-[#dee2e6]">
          {/* Verdict display */}
          <div className="flex flex-col justify-center">
            {submitting && (
              <span className="text-sm text-[#6c757d]">Judging…</span>
            )}
            {result && !submitting && (
              <>
                <span
                  className="text-sm font-semibold"
                  style={{ color: isAC ? "#2f9e44" : "#e03131" }}
                >
                  {result.verdict}
                </span>
                {result.executionOutput && (
                  <pre className="text-xs text-[#6c757d] mt-1 max-w-xs truncate">
                    {result.executionOutput}
                  </pre>
                )}
              </>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#1a5fb4] hover:bg-[#164a8a] disabled:opacity-50 text-white text-sm px-6 py-2 font-medium transition-colors"
          >
            {submitting ? "Judging…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
