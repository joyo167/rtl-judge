import Link from "next/link";

const problems = [
  { id: 1, slug: "full-adder", title: "Full Adder", acceptance: "48.3%", difficulty: "Easy" as const },
  { id: 2, slug: "four-bit-counter", title: "4-Bit Counter", acceptance: "41.2%", difficulty: "Medium" as const },
  { id: 3, slug: "barrel-shifter", title: "Barrel Shifter", acceptance: "37.8%", difficulty: "Hard" as const },
];

const difficultyColors: Record<string, string> = {
  Easy: "#2f9e44",
  Medium: "#f08c00",
  Hard: "#e03131",
};

export default function ProblemTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse" style={{ border: "1px solid #dee2e6" }}>
        <thead>
          <tr className="bg-surface text-left" style={{ borderBottom: "1px solid #dee2e6" }}>
            <th className="px-4 py-3 font-semibold text-muted w-12" style={{ borderRight: "1px solid #dee2e6" }}>#</th>
            <th className="px-4 py-3 font-semibold text-muted" style={{ borderRight: "1px solid #dee2e6" }}>Title</th>
            <th className="px-4 py-3 font-semibold text-muted" style={{ borderRight: "1px solid #dee2e6" }}>Acceptance</th>
            <th className="px-4 py-3 font-semibold text-muted">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <tr
              key={problem.id}
              className="bg-background hover:bg-surface transition-colors"
              style={{ borderTop: "1px solid #dee2e6" }}
            >
              <td className="px-4 py-3 text-muted" style={{ borderRight: "1px solid #dee2e6" }}>{problem.id}</td>
              <td className="px-4 py-3" style={{ borderRight: "1px solid #dee2e6" }}>
                <Link
                  href={`/problems/${problem.slug}`}
                  className="hover:underline"
                  style={{ color: "#1a5fb4" }}
                >
                  {problem.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted" style={{ borderRight: "1px solid #dee2e6" }}>{problem.acceptance}</td>
              <td className="px-4 py-3 font-medium" style={{ color: difficultyColors[problem.difficulty] }}>
                {problem.difficulty}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
