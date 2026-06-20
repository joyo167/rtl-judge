import ProblemTable from "@/components/ProblemTable";
import { prisma } from "@/lib/db";

export default async function ProblemsPage() {
  const raw = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      totalSubs: true,
      acceptedSubs: true,
    },
    orderBy: { id: "asc" },
  });

  const problems = raw.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    acceptanceRate:
      p.totalSubs === 0
        ? 0
        : Math.round((p.acceptedSubs / p.totalSubs) * 1000) / 10,
  }));

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-text text-2xl font-bold mb-6">Problems</h1>
      <ProblemTable problems={problems} />
    </main>
  );
}
