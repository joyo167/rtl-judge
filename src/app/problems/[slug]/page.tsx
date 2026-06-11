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

const difficultyStyles: Record<string, string> = {
  Easy: "bg-easy/20 text-easy",
  Medium: "bg-medium/20 text-medium",
  Hard: "bg-hard/20 text-hard",
};

type Tab = "description" | "submissions";

export default function ProblemPage() {
  const [activeTab, setActiveTab] = useState<Tab>("description");

  return (
    <div className="flex" style={{ height: "calc(100vh - 56px)" }}>
      {/* LEFT PANEL */}
      <div
        className="overflow-y-auto flex-shrink-0"
        style={{ width: "40%", background: "#27272a", padding: 24, borderRight: "1px solid #3f3f46" }}
      >
        {/* Title + badge */}
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-white">Full Adder</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyStyles["Easy"]}`}>
            Easy
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border mb-5">
          {(["description", "submissions"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm capitalize transition-colors ${
                activeTab === tab
                  ? "text-white border-b-2 border-accent"
                  : "text-muted hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "description" ? (
          <div className="space-y-5 text-sm text-muted leading-relaxed">
            <div>
              <h3 className="text-white font-semibold text-base mb-2">Problem Statement</h3>
              <p>
                Implement a 1-bit full adder in Verilog. Given two single-bit inputs{" "}
                <code className="bg-background text-accent px-1 py-0.5 rounded text-xs">a</code> and{" "}
                <code className="bg-background text-accent px-1 py-0.5 rounded text-xs">b</code>, and
                a carry-in bit{" "}
                <code className="bg-background text-accent px-1 py-0.5 rounded text-xs">cin</code>,
                compute the sum and carry-out. The sum is the XOR of all three inputs, and the
                carry-out is high when two or more inputs are high.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold text-base mb-2">Module Interface</h3>
              <pre className="bg-background rounded p-3 text-xs text-accent overflow-x-auto font-mono">
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
              <h3 className="text-white font-semibold text-base mb-2">Examples</h3>
              <div className="bg-background rounded p-3 space-y-1 text-xs font-mono">
                <p>
                  <span className="text-muted">Input: </span>
                  <span className="text-text">a=1, b=1, cin=0</span>
                </p>
                <p>
                  <span className="text-muted">Output: </span>
                  <span className="text-easy">sum=0, cout=1</span>
                </p>
              </div>
              <div className="bg-background rounded p-3 space-y-1 text-xs font-mono mt-2">
                <p>
                  <span className="text-muted">Input: </span>
                  <span className="text-text">a=1, b=1, cin=1</span>
                </p>
                <p>
                  <span className="text-muted">Output: </span>
                  <span className="text-easy">sum=1, cout=1</span>
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
      <div className="flex flex-col flex-1" style={{ background: "#1a1a1a" }}>
        {/* Top bar */}
        <div
          className="flex items-center px-4 flex-shrink-0"
          style={{ height: 40, background: "#27272a", borderBottom: "1px solid #3f3f46" }}
        >
          <span className="bg-surface text-muted text-xs px-2 py-1 rounded">Verilog</span>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            language="verilog"
            theme="vs-dark"
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
          className="flex items-center justify-between px-4 flex-shrink-0"
          style={{ height: 56, background: "#27272a", borderTop: "1px solid #3f3f46" }}
        >
          <div />
          <button className="bg-accent text-white px-6 py-2 rounded font-medium hover:bg-blue-600 transition text-sm">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
