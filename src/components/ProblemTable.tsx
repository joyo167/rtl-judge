const problems = [
  { id: 1, title: "Two Sum", acceptance: "48.3%", difficulty: "Easy" as const },
  { id: 2, title: "Add Two Numbers", acceptance: "41.2%", difficulty: "Medium" as const },
  { id: 3, title: "Median of Two Sorted Arrays", acceptance: "37.8%", difficulty: "Hard" as const },
];

const difficultyStyles: Record<string, string> = {
  Easy: "bg-easy/20 text-easy",
  Medium: "bg-medium/20 text-medium",
  Hard: "bg-hard/20 text-hard",
};

export default function ProblemTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface text-muted text-left">
            <th className="px-4 py-3 font-medium w-12">#</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Acceptance</th>
            <th className="px-4 py-3 font-medium">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, idx) => (
            <tr
              key={problem.id}
              className={`border-t border-border hover:bg-surface/60 transition-colors ${
                idx % 2 === 0 ? "bg-background" : "bg-surface/30"
              }`}
            >
              <td className="px-4 py-3 text-muted">{problem.id}</td>
              <td className="px-4 py-3 text-text hover:text-accent cursor-pointer transition-colors">
                {problem.title}
              </td>
              <td className="px-4 py-3 text-muted">{problem.acceptance}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${difficultyStyles[problem.difficulty]}`}
                >
                  {problem.difficulty}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
