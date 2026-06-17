"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

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

      {session ? (
        <div className="flex items-center gap-3">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? "avatar"}
              className="rounded-full w-8 h-8"
            />
          )}
          <span className="text-sm text-muted">{session.user?.name}</span>
          <button
            onClick={() => signOut()}
            className="text-sm text-muted hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("github")}
          className="border border-accent text-accent px-4 py-1.5 rounded text-sm hover:bg-accent hover:text-white transition"
        >
          Sign In
        </button>
      )}
    </nav>
  );
}
