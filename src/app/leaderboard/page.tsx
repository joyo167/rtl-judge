const entries = [
  { rank: 1, user: "alice", points: 1240, solved: 31 },
  { rank: 2, user: "bob_rtl", points: 1185, solved: 29 },
  { rank: 3, user: "circuit_hacker", points: 1020, solved: 25 },
  { rank: 4, user: "verilog_pro", points: 870, solved: 21 },
  { rank: 5, user: "synth_wizard", points: 740, solved: 18 },
];

export default function LeaderboardPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-[#dee2e6]">
          <thead>
            <tr className="bg-[#f8f9fa] text-left">
              <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6] w-16">Rank</th>
              <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">User</th>
              <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Points</th>
              <th className="px-4 py-3 font-semibold text-[#6c757d] border border-[#dee2e6]">Solved</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.rank}
                className="bg-white hover:bg-[#f8f9fa] transition-colors"
              >
                <td className="px-4 py-3 text-[#6c757d] border border-[#dee2e6]">{entry.rank}</td>
                <td className="px-4 py-3 font-medium text-[#1a5fb4] border border-[#dee2e6]">{entry.user}</td>
                <td className="px-4 py-3 text-[#1a1a1a] border border-[#dee2e6]">{entry.points}</td>
                <td className="px-4 py-3 text-[#1a1a1a] border border-[#dee2e6]">{entry.solved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
