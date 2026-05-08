"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PlayerEvaluation } from "@/lib/schema";
import { avgScore } from "@/lib/utils";

const AV_SHADES = [
  "#111111",
  "#333333",
  "#222222",
  "#444444",
  "#1A1A1A",
  "#3A3A3A",
  "#2A2A2A",
  "#555555",
];

type Tab = "All" | "Guard" | "Forward" | "Center";

function tabFor(pos: string): "Guard" | "Forward" | "Center" {
  if (["PG", "SG", "guard"].includes(pos)) return "Guard";
  if (["C"].includes(pos)) return "Center";
  return "Forward";
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  if (parts.length === 1) return parts[0].slice(0, 2);
  return "??";
}

function starsStr(n: number) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function rankCls(i: number): string {
  if (i === 0) return "text-ink";
  if (i === 1) return "text-ink2";
  if (i === 2) return "text-[#888]";
  return "text-ink3";
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<PlayerEvaluation[]>([]);
  const [tab, setTab] = useState<Tab>("All");

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((d) => setPlayers(d.players || []));
  }, []);

  const ranked = useMemo(() => {
    const enriched = players
      .map((p) => ({
        ...p,
        _grade: Math.round(avgScore(p.skill_evaluation) * 10),
        _group: tabFor(p.clip_metadata.position),
      }))
      .sort((a, b) => b._grade - a._grade);
    if (tab === "All") return enriched;
    return enriched.filter((p) => p._group === tab);
  }, [players, tab]);

  return (
    <div className="bg-bg2 min-h-screen">
      <div className="max-w-[840px] mx-auto px-5 pt-20 pb-16">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-[11px] bg-ink text-white flex items-center justify-center text-[19px]">
              🏀
            </div>
            <div>
              <div className="text-[19px] font-bold">Basketball Recruits</div>
              <div className="text-[12.5px] text-ink2 mt-px">
                Ranked by composite score · Class of 2026
              </div>
            </div>
          </div>
          <div
            className="text-[11.5px] font-semibold text-ink2 px-3 py-1 rounded-full"
            style={{ background: "var(--bg-3)" }}
          >
            2025–26 Season
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-md w-fit mb-3.5 bg-bg"
          style={{ border: "1px solid var(--border)" }}
        >
          {(["All", "Guard", "Forward", "Center"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1 rounded text-[12.5px] font-medium transition-all ${
                tab === t
                  ? "bg-ink text-white"
                  : "text-ink2 hover:bg-bg2 hover:text-ink"
              }`}
            >
              {t === "All" ? "All" : `${t}s`}
            </button>
          ))}
        </div>

        {/* Leaderboard card */}
        <div
          className="bg-bg rounded-xl overflow-hidden shadow-soft"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="grid items-center px-[18px] py-[9px] bg-bg2 text-[10.5px] font-semibold text-ink3 uppercase tracking-eyebrow"
            style={{
              gridTemplateColumns: "40px 1fr 90px 90px 70px 88px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>#</div>
            <div>Athlete</div>
            <div>Position</div>
            <div className="text-right">Skill avg</div>
            <div className="text-right">Rating</div>
            <div className="text-right">Score</div>
          </div>

          {ranked.length === 0 && (
            <div className="px-[18px] py-12 text-center text-ink3 text-[13px]">
              Loading recruits…
            </div>
          )}

          {ranked.map((p, i) => {
            const name = p.display_name ?? p.player_id?.replace(/^p_/, "") ?? "Athlete";
            const av = AV_SHADES[i % AV_SHADES.length];
            const stars = p.stars ?? 4;
            const skillsAvg = (avgScore(p.skill_evaluation)).toFixed(1);
            return (
              <Link
                key={p.player_id}
                href={`/players/${p.player_id}`}
                className="grid items-center px-[18px] py-3 cursor-pointer transition-colors hover:bg-[#F5F5F5] relative group block"
                style={{
                  gridTemplateColumns: "40px 1fr 90px 90px 70px 88px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div className={`text-sm font-bold ${rankCls(i)}`}>{i + 1}</div>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-bold text-white shrink-0"
                    style={{ background: av }}
                  >
                    {initials(name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink truncate">
                      {name}
                    </div>
                    <div className="text-[11.5px] text-ink2 truncate">
                      {p.school ?? "—"}
                    </div>
                  </div>
                </div>
                <div>
                  <span
                    className="inline-block px-[9px] py-0.5 rounded-full text-[11.5px] font-semibold"
                    style={{ background: "#F0F0F0", color: "#333" }}
                  >
                    {p.clip_metadata.position}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular text-ink">
                    {skillsAvg}<span className="text-ink3 font-normal">/10</span>
                  </div>
                  <div className="text-[10.5px] text-ink3">6 categories</div>
                </div>
                <div className="text-right text-[11px] text-ink tabular tracking-tighter">
                  {starsStr(stars)}
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <div
                    className="w-[42px] h-1 rounded-sm overflow-hidden"
                    style={{ background: "var(--border)" }}
                  >
                    <div
                      className="h-full bg-ink rounded-sm"
                      style={{ width: `${p._grade}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-ink min-w-[24px] text-right">
                    {p._grade}
                  </span>
                </div>
                <span className="absolute right-4 text-[15px] text-ink3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 pointer-events-none">
                  ›
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
