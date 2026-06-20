"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Problem = {
  title: string;
  difficulty: string;
  description: string;
  starterCode: string | null;
};

const difficultyColors: Record<string, string> = {
  Easy: "#2f9e44",
  Medium: "#f08c00",
  Hard: "#e03131",
};

type Tab = "description" | "submissions";

export default function ProblemDetail({ problem }: { problem: Problem }) {
  const [activeTab, setActiveTab] = useState<Tab>("description");

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
          <div />
          <button className="bg-[#1a5fb4] hover:bg-[#164a8a] text-white text-sm px-6 py-2 font-medium transition-colors">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
