"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between px-6 h-14 bg-white border-b border-[#dee2e6]">
      <Link href="/" className="font-bold text-xl text-[#1a5fb4]">
        RTL Judge
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium text-[#1a1a1a] hover:underline">
          Home
        </Link>
        <Link href="/problems" className="text-sm font-medium text-[#1a1a1a] hover:underline">
          Problems
        </Link>
        <Link href="/contests" className="text-sm font-medium text-[#1a1a1a] hover:underline">
          Contests
        </Link>
        <Link href="/leaderboard" className="text-sm font-medium text-[#1a1a1a] hover:underline">
          Leaderboard
        </Link>
        {(session?.user as { username?: string })?.username === process.env.NEXT_PUBLIC_ADMIN_GITHUB_USERNAME && (
          <>
            <Link href="/admin/contests" className="text-sm font-medium text-[#1a5fb4] hover:underline">
              + Contest
            </Link>
            <Link href="/admin/blog" className="text-sm font-medium text-[#1a5fb4] hover:underline">
              + Blog
            </Link>
          </>
        )}
      </div>

      {session ? (
        <div className="flex items-center gap-3">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? "avatar"}
              className="w-8 h-8 rounded-full"
            />
          )}
          {(session.user as { username?: string })?.username ? (
            <Link
              href={`/profile/${(session.user as { username?: string }).username}`}
              className="text-sm text-[#1a5fb4] hover:underline"
            >
              {(session.user as { username?: string }).username}
            </Link>
          ) : (
            <span className="text-sm text-[#6c757d]">{session.user?.name}</span>
          )}
          <button
            onClick={() => signOut()}
            className="text-sm text-[#6c757d] hover:text-[#1a1a1a]"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("github")}
          className="border border-[#1a5fb4] text-[#1a5fb4] px-4 py-1.5 text-sm hover:bg-[#f8f9fa]"
        >
          Sign In
        </button>
      )}
    </nav>
  );
}
