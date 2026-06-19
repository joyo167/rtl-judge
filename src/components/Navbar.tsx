"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav
      className="flex items-center justify-between px-6 bg-background"
      style={{ height: 56, borderBottom: "1px solid #dee2e6" }}
    >
      <Link href="/" className="font-bold text-xl" style={{ color: "#1a5fb4" }}>
        RTL Judge
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/problems" className="text-sm text-text hover:underline">
          Problems
        </Link>
        <Link href="/leaderboard" className="text-sm text-text hover:underline">
          Leaderboard
        </Link>
      </div>

      {session ? (
        <div className="flex items-center gap-3">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? "avatar"}
              className="w-8 h-8"
              style={{ borderRadius: 2 }}
            />
          )}
          <span className="text-sm text-muted">{session.user?.name}</span>
          <button
            onClick={() => signOut()}
            className="text-sm text-muted hover:text-text"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("github")}
          className="text-sm px-4 py-1.5"
          style={{ border: "1px solid #1a5fb4", color: "#1a5fb4", borderRadius: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = "#164a8a")}
          onMouseLeave={e => (e.currentTarget.style.color = "#1a5fb4")}
        >
          Sign In
        </button>
      )}
    </nav>
  );
}
