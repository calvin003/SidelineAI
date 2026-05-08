"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Match = { player_id: string; score: number; reasoning: string };

const CHIPS: { icon: string; query: string; label: string }[] = [
  { icon: "🎯", query: "Connector wing with elite off-ball IQ and switchable defense", label: "Connector wing" },
  { icon: "🔒", query: "Lead guard with three-level scoring and PnR shotmaking", label: "Lead PG scorer" },
  { icon: "🛡️", query: "Modern stretch big with short-roll passing and rim protection", label: "Modern big" },
  { icon: "📚", query: "Movement shooter who reads pin-downs and curls on time", label: "Movement shooter" },
  { icon: "📈", query: "High-motor athlete who finishes through contact at the rim", label: "Rim finisher" },
  { icon: "⚡", query: "Quick-trigger pull-up shotmaker with high release point", label: "Pull-up shotmaker" },
];

const RECENTS = [
  "Two-way wing who can defend 1–4",
  "Late-clock shotmaker with closer mentality",
  "Drop-coverage big who walls up vertical",
  "Multi-positional defender with plus motor",
];

const AV_SHADES = ["#111", "#333", "#222", "#444", "#1A1A1A", "#3A3A3A", "#2A2A2A", "#555"];

function initials(s: string) {
  const cleaned = s.replace(/^p_/, "").replace(/_/g, " ");
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}

export default function RecruitPage() {
  const [query, setQuery] = useState("");
  const [thinking, setThinking] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerNames, setPlayerNames] = useState<Record<string, { name: string; school: string; pos: string }>>({});

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((d) => {
        const map: typeof playerNames = {};
        for (const p of d.players ?? []) {
          map[p.player_id] = {
            name: p.display_name ?? p.player_id,
            school: p.school ?? "—",
            pos: p.clip_metadata.position,
          };
        }
        setPlayerNames(map);
      });
  }, []);

  const submit = async (q?: string) => {
    const text = (q ?? query).trim();
    if (!text) return;
    setMatches(null);
    setError(null);
    setThinking(true);
    try {
      const r = await fetch("/api/recruit/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "search failed");
      setMatches(d.matches ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setThinking(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-20 pb-16 px-6 relative">
      <div className="page-grid-bg" />

      <div className="relative z-10 w-full max-w-[680px] flex flex-col items-center">
        <div className="eyebrow-pill mb-7">
          <span className="eyebrow-dot" />
          Scout Dashboard · Class of 2026
        </div>

        <h1
          className="text-center text-ink font-black mb-3.5 leading-[0.96]"
          style={{ fontSize: "clamp(34px, 6vw, 58px)", letterSpacing: "-2.5px" }}
        >
          Who are you
          <br />
          <span style={{ color: "#CCCCCC" }}>looking</span> for?
        </h1>
        <p className="text-base text-ink2 leading-[1.65] text-center mb-10 max-w-[420px]">
          Describe the player you need. Position, skills, archetype — whatever
          matters to your program.
        </p>

        {/* Prompt box */}
        <div
          className="w-full bg-bg overflow-hidden mb-4 transition-all"
          style={{
            border: "1.5px solid var(--border-h)",
            borderRadius: 18,
            boxShadow: "0 8px 40px rgba(0,0,0,.07), 0 2px 8px rgba(0,0,0,.04)",
          }}
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="e.g. 'Two-way wing who can defend 1–4 with above-the-rim finishing…'"
            className="w-full px-[22px] pt-5 pb-2 font-sans text-[15px] text-ink leading-[1.65] outline-none resize-none bg-transparent"
            rows={4}
            style={{ minHeight: 120 }}
          />
          <div className="flex items-center justify-between px-3.5 pb-3.5 pt-2.5">
            <span className="text-[11.5px] text-ink3 select-none">
              {query.length > 0 ? `${query.length} chars · ⌘↵ to search` : "Press ⌘↵ to search"}
            </span>
            <button
              type="button"
              onClick={() => submit()}
              disabled={thinking}
              className="flex items-center gap-2 text-[13.5px] font-bold px-[22px] py-2.5 rounded-3xl bg-ink text-white transition-all hover:bg-[#333] hover:-translate-y-px disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
                <path
                  d="M6.5 1v11M1 6.5l5.5-5.5 5.5 5.5"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {thinking ? "Scouting…" : "Search"}
            </button>
          </div>
        </div>

        {/* Quick chips */}
        <div className="text-[11px] font-semibold text-ink3 uppercase tracking-eyebrowWide mb-2.5 self-start">
          Quick searches
        </div>
        <div className="flex flex-wrap gap-2 w-full mb-12">
          {CHIPS.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setQuery(c.query)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium text-ink2 bg-bg hover:bg-ink hover:text-white hover:border-ink transition-colors"
              style={{ border: "1px solid var(--border-h)" }}
            >
              <span className="text-[13px]">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3.5 mb-7">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <div className="text-[11.5px] text-ink3 font-medium whitespace-nowrap">
            Recent searches
          </div>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 w-full">
          {RECENTS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setQuery(r)}
              className="bg-bg2 px-4 py-3.5 rounded-xl text-left flex flex-col gap-1 transition-all hover:bg-bg3 hover:-translate-y-px"
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="text-[13px] font-semibold text-ink leading-snug">
                {r}
              </div>
              <div className="text-[11px] text-ink3 flex items-center gap-1.5">
                <span
                  className="text-[10px] font-semibold px-1.5 py-px rounded bg-bg4 text-ink2"
                >
                  Saved
                </span>
                Past searches
              </div>
            </button>
          ))}
        </div>

        {/* Thinking */}
        {thinking && (
          <div className="flex items-center gap-2.5 mt-10 text-[13px] text-ink2 font-medium">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ink3" style={{ animation: "blinkDot 1.2s infinite" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-ink3" style={{ animation: "blinkDot 1.2s 0.2s infinite" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-ink3" style={{ animation: "blinkDot 1.2s 0.4s infinite" }} />
            </span>
            Scanning recruits…
          </div>
        )}

        {error && (
          <div className="mt-10 text-[14px] text-[#C8102E]">{error}</div>
        )}

        {/* Results */}
        {matches && (
          <section className="w-full mt-10 fade-up">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-bold text-ink">
                Matches for &ldquo;{query.length > 40 ? query.slice(0, 40) + "…" : query}&rdquo;
              </div>
              <div className="text-[11.5px] text-ink3">
                {matches.length} {matches.length === 1 ? "recruit" : "recruits"} found
              </div>
            </div>

            {matches.length === 0 ? (
              <div
                className="rounded-xl p-10 text-center text-ink2 bg-bg2"
                style={{ border: "1px solid var(--border)" }}
              >
                No recruits match that profile yet.
              </div>
            ) : (
              <div className="space-y-2">
                {matches.map((m, i) => {
                  const meta = playerNames[m.player_id];
                  const av = AV_SHADES[i % AV_SHADES.length];
                  return (
                    <Link
                      key={m.player_id}
                      href={`/players/${m.player_id}`}
                      className="flex items-start gap-3 px-4 py-3.5 rounded-md bg-bg cursor-pointer transition-all hover:bg-bg2"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      <div
                        className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ background: av }}
                      >
                        {initials(meta?.name ?? m.player_id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ink">
                          {meta?.name ?? m.player_id}
                        </div>
                        <div className="text-[11.5px] text-ink2 mt-px">
                          {meta ? `${meta.school} · ${meta.pos}` : "—"}
                        </div>
                        <div className="text-[12.5px] text-ink2 mt-2 leading-snug">
                          {m.reasoning}
                        </div>
                      </div>
                      <div
                        className="text-[11.5px] font-bold text-ink2 px-2.5 py-0.5 rounded-full bg-bg2 shrink-0"
                        style={{ border: "1px solid var(--border)" }}
                      >
                        {Math.round(m.score * 100)}% match
                      </div>
                      <div className="text-[15px] font-extrabold text-ink min-w-[28px] text-right shrink-0">
                        {Math.round(m.score * 100)}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
