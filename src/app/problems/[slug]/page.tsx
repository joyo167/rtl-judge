import { prisma } from "@/lib/db";
import ProblemDetail from "@/components/ProblemDetail";

export const dynamic = 'force-dynamic'

export default async function ProblemPage({
  params,
}: {
  params: { slug: string };
}) {
  const problem = await prisma.problem.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      difficulty: true,
      description: true,
      starterCode: true,
    },
  });

  if (!problem) {
    return (
      <main className="flex items-center justify-center h-[calc(100vh-56px)]">
        <p className="text-[#6c757d] text-lg">Problem not found.</p>
      </main>
    );
  }

  return <ProblemDetail problem={problem} />;
}
