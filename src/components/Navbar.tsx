import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="flex items-center justify-between px-6"
      style={{ height: 56, background: "#27272a", borderBottom: "1px solid #3f3f46" }}
    >
      <Link href="/" className="text-accent font-bold text-xl">
        RTL Judge
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/problems" className="text-sm text-muted hover:text-white transition-colors">
          Problems
        </Link>
        <Link href="/leaderboard" className="text-sm text-muted hover:text-white transition-colors">
          Leaderboard
        </Link>
      </div>

      <button className="border border-accent text-accent px-4 py-1.5 rounded text-sm hover:bg-accent hover:text-white transition">
        Sign In
      </button>
    </nav>
  );
}
