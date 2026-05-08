import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayerById } from "@/lib/players";
import { SKILL_LABELS, type SkillKey } from "@/lib/schema";
import { avgScore } from "@/lib/utils";
import { FilmPlayer } from "@/components/film-player";
import { RadarChart } from "@/components/radar-chart";

const DEFAULT_VIDEO = "https://assets.mixkit.co/videos/44468/44468-360.mp4";

const AV_SHADES = ["#111111", "#333333", "#222222", "#444444"];

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  if (parts.length === 1) return parts[0].slice(0, 2);
  return "??";
}
function starsStr(n: number) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default async function PlayerPage({
  params,
}: {
  params: { id: string };
}) {
  const p = await getPlayerById(params.id);
  if (!p) notFound();

  const name = p.display_name ?? "Athlete";
  const grade = Math.round(avgScore(p.skill_evaluation) * 10);
  const stars = p.stars ?? 4;
  const av = AV_SHADES[(name.charCodeAt(0) || 0) % AV_SHADES.length];

  const skillKeys = Object.keys(p.skill_evaluation) as SkillKey[];
  const RADAR_SHORT: Record<SkillKey, string> = {
    perimeter_defense: "Defense",
    screen_navigation: "Screen Nav",
    finishing: "Finish",
    shot_creation: "Shot Create",
    passing_iq: "Pass IQ",
    off_ball_movement: "Off-Ball",
  };
  const radarLabels = skillKeys.map((k) => RADAR_SHORT[k]);
  const radarValues = skillKeys.map((k) => p.skill_evaluation[k].score / 10);

  const stats = skillKeys.map((k) => ({
    label: SKILL_LABELS[k],
    val: p.skill_evaluation[k].score * 10,
    color: "#111111",
  }));

  const physical = p.physical_observations;

  const seasonMetrics = [
    {
      label: "Athleticism",
      val: physical.athleticism_score.toFixed(1),
      sub: "out of 10",
    },
    {
      label: "Lateral",
      val: physical.lateral_quickness_score.toFixed(1),
      sub: "quickness score",
    },
    {
      label: "Motor",
      val: physical.motor_score.toFixed(1),
      sub: "effort score",
    },
    {
      label: "Decision IQ",
      val: p.tactical_intelligence.decision_making_score.toFixed(1),
      sub: "tactical reads",
    },
  ];

  return (
    <div className="bg-bg2 min-h-screen">
      <div className="max-w-[840px] mx-auto px-5 pt-20 pb-16">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink2 bg-bg shadow-soft px-3.5 py-1.5 rounded-md mb-4 hover:bg-bg2 hover:text-ink transition-colors"
          style={{ border: "1px solid var(--border)" }}
        >
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M9 2L4 7l5 5" />
          </svg>
          Back to Leaderboard
        </Link>

        {/* Profile header */}
        <div
          className="flex gap-3.5 items-center bg-bg rounded-xl px-[18px] py-4 mb-3 shadow-soft"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white font-bold shrink-0"
            style={{ fontSize: 17, background: av }}
          >
            {initials(name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[19px] font-bold flex items-center gap-2 flex-wrap">
              {name}
              <span
                className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{ background: "#F0F0F0", color: "#333" }}
              >
                {p.clip_metadata.position}
              </span>
              <span
                className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{ background: "#EEEEEE", color: "#444" }}
              >
                Class of 2026
              </span>
            </div>
            <div className="text-[12.5px] text-ink2 mt-1">
              {p.school ?? "—"}
            </div>
            <div className="flex gap-2 items-center mt-1.5 flex-wrap">
              <span
                className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{ background: "#F0F0F0", color: "#555" }}
              >
                {starsStr(stars)} {stars}-star recruit
              </span>
              <span className="text-xs text-ink3">
                {physical.estimated_height_band} · {physical.frame.split(",")[0]}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              type="button"
              className="text-xs font-bold px-3.5 py-1.5 rounded-md text-white whitespace-nowrap bg-ink hover:bg-[#333] transition-colors"
            >
              + Add another clip
            </button>
            <button
              type="button"
              className="text-xs font-medium px-3.5 py-1.5 rounded-md text-ink whitespace-nowrap bg-bg hover:bg-bg2 transition-colors"
              style={{ border: "1px solid var(--border)" }}
            >
              Full report ↗
            </button>
          </div>
        </div>

        {/* SCOUTING HEADLINE */}
        <div
          className="bg-bg rounded-xl p-5 mb-3 shadow-soft"
          style={{ border: "1px solid var(--border)" }}
        >
          <div className="eyebrow mb-2">Scouting headline</div>
          <p
            className="font-bold text-ink leading-tight"
            style={{ fontSize: "clamp(20px, 2.4vw, 28px)", letterSpacing: "-0.5px" }}
          >
            &ldquo;{p.scouting_summary.headline}&rdquo;
          </p>
          <div className="flex gap-1.5 flex-wrap mt-3">
            {p.recruiter_facing_descriptors.map((d) => (
              <span
                key={d}
                className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: "var(--bg-3)", color: "#333" }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* ANNOTATED FILM */}
        <div className="mb-3">
          <FilmPlayer
            videoUrl={p.video_url ?? DEFAULT_VIDEO}
            moments={p.tagged_moments}
            caption="Click any moment in the side panel — the player jumps to that timestamp and overlays the analyst's read on top of the action."
          />
        </div>

        {/* RADAR + STAT BREAKDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div
            className="bg-bg rounded-xl p-[18px] shadow-soft"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="eyebrow mb-3.5">Performance Radar</div>
            <div className="flex justify-center">
              <RadarChart
                labels={radarLabels}
                values={radarValues}
                size={280}
              />
            </div>
          </div>

          <div
            className="bg-bg rounded-xl p-[18px] shadow-soft"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="eyebrow mb-3.5">Skill Breakdown</div>
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2 mb-2.5 last:mb-0">
                <span className="text-xs text-ink2 w-[120px] shrink-0">
                  {s.label}
                </span>
                <div
                  className="flex-1 h-1 rounded-sm overflow-hidden"
                  style={{ background: "var(--border)" }}
                >
                  <div
                    className="h-full rounded-sm"
                    style={{ width: `${s.val}%`, background: s.color }}
                  />
                </div>
                <span className="text-xs font-semibold text-ink min-w-[28px] text-right tabular">
                  {s.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SEASON METRICS + STRENGTHS/GROWTH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div
            className="bg-bg rounded-xl p-[18px] shadow-soft"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="eyebrow mb-3.5">Physical & Tactical</div>
            <div className="grid grid-cols-2 gap-2">
              {seasonMetrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-md px-3 py-2.5 bg-bg2"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div className="text-[11px] text-ink3 mb-0.5">{m.label}</div>
                  <div className="text-[21px] font-bold text-ink leading-tight tabular">
                    {m.val}
                  </div>
                  <div className="text-[11px] text-ink3 mt-0.5">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="bg-bg rounded-xl p-[18px] shadow-soft"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="eyebrow mb-3.5">Strengths · Growth</div>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-semibold text-[#1F6B3A] mb-1.5 uppercase tracking-eyebrow">
                  Strengths
                </div>
                {p.scouting_summary.strengths.map((s, i) => (
                  <div key={i} className="flex gap-2 text-[12.5px] text-ink2 mb-1 leading-snug">
                    <span className="text-[#1F6B3A]">＋</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#B5841F] mb-1.5 uppercase tracking-eyebrow">
                  Areas for growth
                </div>
                {p.scouting_summary.areas_for_growth.map((s, i) => (
                  <div key={i} className="flex gap-2 text-[12.5px] text-ink2 mb-1 leading-snug">
                    <span className="text-[#B5841F]">−</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PROJECTED ROLE + ARCHETYPE + ATHLETE BREAKDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div
            className="bg-bg rounded-xl p-[18px] shadow-soft"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="eyebrow mb-3.5">Projection</div>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-ink3 mb-1">Projected role</div>
                <div className="text-[14px] text-ink leading-snug">
                  {p.scouting_summary.projected_role}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink3 mb-1">Archetype</div>
                <div className="text-[14px] font-semibold text-ink">
                  {p.scouting_summary.comparable_archetype}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink3 mb-1">Honest limitations</div>
                <div className="text-[12.5px] text-ink2 italic leading-snug">
                  {p.scouting_summary.honest_limitations}
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-bg rounded-xl p-[18px] shadow-soft"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="eyebrow mb-3.5">For the athlete</div>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-ink3 mb-1.5">What you&apos;re doing well</div>
                {p.athlete_facing_breakdown.what_youre_doing_well.map((s, i) => (
                  <div key={i} className="flex gap-2 text-[12.5px] text-ink2 mb-1 leading-snug">
                    <span className="text-ink">●</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[11px] text-ink3 mb-1">Focus on next</div>
                <div className="text-[14px] font-semibold text-ink leading-snug">
                  {p.athlete_facing_breakdown.one_thing_to_focus_on_next}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink3 mb-1">Drill</div>
                <div className="text-[12.5px] text-ink2 leading-snug">
                  {p.athlete_facing_breakdown.drill_recommendation}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
