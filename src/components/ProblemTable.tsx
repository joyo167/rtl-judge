import Link from "next/link";

type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  acceptanceRate: number;
};

const difficultyColors: Record<string, string> = {
  Easy: "#2f9e44",
  Medium: "#f08c00",
  Hard: "#e03131",
};

export default function ProblemTable({ problems }: { problems: Problem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse border border-[#dee2e6]">
        <thead>
          <tr className="bg-[#f8f9fa] text-left">
            <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6] w-12">#</th>
            <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Title</th>
            <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Acceptance</th>
            <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, idx) => (
            <tr
              key={problem.id}
              className="bg-white hover:bg-[#f8f9fa] transition-colors"
            >
              <td className="px-4 py-3 text-[#6c757d] border border-[#dee2e6]">{idx + 1}</td>
              <td className="px-4 py-3 border border-[#dee2e6]">
                <Link
                  href={`/problems/${problem.slug}`}
                  className="text-[#1a5fb4] hover:underline"
                >
                  {problem.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-[#6c757d] border border-[#dee2e6]">
                {problem.acceptanceRate === 0 ? '—' : `${problem.acceptanceRate}%`}
              </td>
              <td
                className="px-4 py-3 font-medium border border-[#dee2e6]"
                style={{ color: difficultyColors[problem.difficulty] ?? "#1a1a1a" }}
              >
                {problem.difficulty}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
