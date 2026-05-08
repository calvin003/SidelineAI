"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const path = usePathname() ?? "/";
  const onScout = path.startsWith("/recruit");
  const onAthlete =
    path.startsWith("/leaderboard") ||
    path.startsWith("/players") ||
    path.startsWith("/upload");

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-14 px-8 flex items-center justify-between border-b backdrop-blur"
      style={{
        background: "rgba(255,255,255,.92)",
        borderColor: "var(--border)",
      }}
    >
      <Link
        href="/"
        className="font-black tracking-tightest text-ink"
        style={{ fontSize: 20, letterSpacing: "-1px" }}
      >
        Sideline
      </Link>

      <div
        className="flex gap-[3px] p-1 rounded-full"
        style={{ background: "var(--bg-3)", border: "1px solid var(--border)" }}
      >
        <Link
          href="/recruit"
          className={`px-5 py-[5px] rounded-2xl text-[12.5px] font-bold transition-all ${
            onScout ? "bg-ink text-white shadow" : "text-ink2 hover:text-ink"
          }`}
        >
          Scout
        </Link>
        <Link
          href="/leaderboard"
          className={`px-5 py-[5px] rounded-2xl text-[12.5px] font-bold transition-all ${
            onAthlete ? "bg-ink text-white shadow" : "text-ink2 hover:text-ink"
          }`}
        >
          Athlete
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-[13px] text-ink2 hover:text-ink transition-colors font-medium">
          Sign in
        </button>
        <Link
          href="/athlete/setup"
          className="text-[13px] font-bold px-[18px] py-[7px] rounded-2xl bg-ink text-white hover:bg-[#333] transition-all"
        >
          Get started →
        </Link>
      </div>
    </nav>
  );
}
