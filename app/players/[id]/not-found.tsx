import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-[10.5px] font-bold tracking-eyebrowWide uppercase text-ink3 mb-3">
          404
        </div>
        <h1
          className="text-ink font-black mb-4 leading-[0.96]"
          style={{ fontSize: "clamp(34px, 6vw, 58px)", letterSpacing: "-2.5px" }}
        >
          No file on that athlete.
        </h1>
        <Link
          href="/leaderboard"
          className="inline-block text-sm font-semibold px-7 py-3 rounded-3xl text-ink2 hover:text-ink transition-all"
          style={{ border: "1px solid var(--border-h)" }}
        >
          Back to Recruits
        </Link>
      </div>
    </div>
  );
}
