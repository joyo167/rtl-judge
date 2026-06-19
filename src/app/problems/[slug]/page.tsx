"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const STARTER_CODE = `module full_adder (
    input  wire a,
    input  wire b,
    input  wire cin,
    output wire sum,
    output wire cout
);
    // Your implementation here

endmodule
`;

const difficultyColors: Record<string, string> = {
  Easy: "#2f9e44",
  Medium: "#f08c00",
  Hard: "#e03131",
};

type Tab = "description" | "submissions";

export default function ProblemPage() {
  const [activeTab, setActiveTab] = useState<Tab>("description");

  return (
    <div className="flex" style={{ height: "calc(100vh - 56px)" }}>
      {/* LEFT PANEL */}
      <div
        className="overflow-y-auto flex-shrink-0 bg-background"
        style={{ width: "40%", padding: 24, borderRight: "1px solid #dee2e6" }}
      >
        {/* Title + difficulty */}
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-text">Full Adder</h1>
          <span className="text-sm font-medium" style={{ color: difficultyColors["Easy"] }}>
            Easy
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-5" style={{ borderBottom: "1px solid #dee2e6" }}>
          {(["description", "submissions"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-2 text-sm capitalize"
              style={
                activeTab === tab
                  ? { color: "#1a1a1a", fontWeight: 700, textDecoration: "underline" }
                  : { color: "#6c757d" }
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "description" ? (
          <div className="space-y-5 text-sm leading-relaxed" style={{ color: "#6c757d" }}>
            <div>
              <h3 className="font-semibold text-base mb-2 text-text">Problem Statement</h3>
              <p>
                Implement a 1-bit full adder in Verilog. Given two single-bit inputs{" "}
                <code className="px-1 py-0.5 text-xs font-mono" style={{ background: "#f8f9fa", border: "1px solid #dee2e6", color: "#1a5fb4" }}>a</code> and{" "}
                <code className="px-1 py-0.5 text-xs font-mono" style={{ background: "#f8f9fa", border: "1px solid #dee2e6", color: "#1a5fb4" }}>b</code>, and
                a carry-in bit{" "}
                <code className="px-1 py-0.5 text-xs font-mono" style={{ background: "#f8f9fa", border: "1px solid #dee2e6", color: "#1a5fb4" }}>cin</code>,
                compute the sum and carry-out. The sum is the XOR of all three inputs, and the
                carry-out is high when two or more inputs are high.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2 text-text">Module Interface</h3>
              <pre className="p-3 text-xs overflow-x-auto font-mono text-text" style={{ background: "#f8f9fa", border: "1px solid #dee2e6" }}>
{`module full_adder (
    input  wire a,
    input  wire b,
    input  wire cin,
    output wire sum,
    output wire cout
);`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2 text-text">Examples</h3>
              <div className="p-3 space-y-1 text-xs font-mono" style={{ background: "#f8f9fa", border: "1px solid #dee2e6" }}>
                <p>
                  <span className="text-muted">Input: </span>
                  <span className="text-text">a=1, b=1, cin=0</span>
                </p>
                <p>
                  <span className="text-muted">Output: </span>
                  <span style={{ color: "#2f9e44" }}>sum=0, cout=1</span>
                </p>
              </div>
              <div className="p-3 space-y-1 text-xs font-mono mt-2" style={{ background: "#f8f9fa", border: "1px solid #dee2e6" }}>
                <p>
                  <span className="text-muted">Input: </span>
                  <span className="text-text">a=1, b=1, cin=1</span>
                </p>
                <p>
                  <span className="text-muted">Output: </span>
                  <span style={{ color: "#2f9e44" }}>sum=1, cout=1</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted text-sm">No submissions yet</p>
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col flex-1 bg-background">
        {/* Top bar */}
        <div
          className="flex items-center px-4 flex-shrink-0 bg-surface"
          style={{ height: 40, borderBottom: "1px solid #dee2e6" }}
        >
          <span className="text-xs text-muted px-2 py-1" style={{ border: "1px solid #dee2e6" }}>Verilog</span>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            language="verilog"
            theme="vs"
            defaultValue={STARTER_CODE}
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
        <div
          className="flex items-center justify-between px-4 flex-shrink-0 bg-surface"
          style={{ height: 56, borderTop: "1px solid #dee2e6" }}
        >
          <div />
          <button
            className="text-white text-sm px-6 py-2 font-medium"
            style={{ background: "#1a5fb4", borderRadius: 0 }}
            onMouseEnter={e => (e.currentTarget.style.background = "#164a8a")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1a5fb4")}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
