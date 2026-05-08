"use client";

import { useEffect, useRef, useState } from "react";

const DEMO_VIDEO = "https://assets.mixkit.co/videos/44468/44468-360.mp4";

type Corner = { lbl: string; val: string };
type RawMoment = {
  start: number;
  end: number;
  label: string;
  text: string;
  phase: string;
  corners: { tl: Corner; tr: Corner; bl: Corner; br: Corner };
};

const RAW: RawMoment[] = [
  {
    start: 0.0,
    end: 1.0,
    label: "Pump fake",
    text: "Pump fake into low shoulder drop — sells the shot, gets defender airborne, shoulder dips toward the attack angle.",
    phase: "Half-court iso",
    corners: {
      tl: { lbl: "Moment", val: "Pump Fake" },
      tr: { lbl: "Skill", val: "Shot Create" },
      bl: { lbl: "Phase", val: "Iso setup" },
      br: { lbl: "Read", val: "Sells fake" },
    },
  },
  {
    start: 1.0,
    end: 2.0,
    label: "Right-foot lead step",
    text: "One step left, leading with the right foot — sets up the step-back rhythm and shifts the defender's weight.",
    phase: "Drive sequence",
    corners: {
      tl: { lbl: "Moment", val: "Lead Step" },
      tr: { lbl: "Skill", val: "Footwork" },
      bl: { lbl: "Phase", val: "Setup" },
      br: { lbl: "Read", val: "Sets rhythm" },
    },
  },
  {
    start: 2.0,
    end: 2.75,
    label: "Left-foot step-back",
    text: "Plants and pushes off the left foot into the step-back — defender on his heels, separation created.",
    phase: "Shot creation",
    corners: {
      tl: { lbl: "Moment", val: "Step-Back" },
      tr: { lbl: "Skill", val: "Separation" },
      bl: { lbl: "Phase", val: "Gather" },
      br: { lbl: "Read", val: "Plus space" },
    },
  },
  {
    start: 2.75,
    end: 3.75,
    label: "Pull-up release",
    text: "Release at 2.75s — clean one-motion pull-up jumper, high release point, balanced base.",
    phase: "Release",
    corners: {
      tl: { lbl: "Moment", val: "Release" },
      tr: { lbl: "Skill", val: "Pull-Up J" },
      bl: { lbl: "Phase", val: "Shot" },
      br: { lbl: "Grade", val: "Plus" },
    },
  },
  {
    start: 5.75,
    end: 6.75,
    label: "Make",
    text: "Ball through net at 5.75s — clean rotation, even arc, no rim. Splash.",
    phase: "Finish",
    corners: {
      tl: { lbl: "Moment", val: "Make" },
      tr: { lbl: "Result", val: "Splash" },
      bl: { lbl: "Phase", val: "Score" },
      br: { lbl: "Grade", val: "A+" },
    },
  },
];

const DOT_COLORS = ["#888", "#999", "#777", "#AAAAAA", "#666"];
const SPEEDS = [0.5, 1, 1.5, 2];

const STATS = [
  { lbl: "PPG", val: "28.4", sub: "points" },
  { lbl: "APG", val: "9.7", sub: "assists" },
  { lbl: "FG%", val: "51%", sub: "field goal" },
  { lbl: "3P%", val: "44%", sub: "three-point" },
];

function fmt(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function LandingDemo() {
  const vidRef = useRef<HTMLVideoElement | null>(null);
  const tlRef = useRef<HTMLDivElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [activeIdx, setActiveIdx] = useState(-1);

  const annotations = RAW;
  const totalForMarkers = duration || 10;

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    const onMeta = () => {
      setDuration(v.duration || 0);
      v.muted = true;
      v.play().catch(() => {});
    };
    const onTime = () => setCurrent(v.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    if (!duration) {
      setActiveIdx(-1);
      return;
    }
    const idx = annotations.findIndex(
      (a) => current >= a.start && current < a.end,
    );
    setActiveIdx(idx);
  }, [current, duration, annotations]);

  const togglePlay = () => {
    const v = vidRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };
  const seekTo = (t: number) => {
    const v = vidRef.current;
    if (!v || !duration) return;
    v.currentTime = Math.max(0, Math.min(duration, t));
    if (v.paused) v.play();
  };
  const scrub = (e: React.MouseEvent) => {
    const el = tlRef.current;
    if (!el || !duration) return;
    const rect = el.getBoundingClientRect();
    seekTo(((e.clientX - rect.left) / rect.width) * duration);
  };
  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (vidRef.current) vidRef.current.playbackRate = SPEEDS[next];
  };

  const active = activeIdx >= 0 ? annotations[activeIdx] : null;
  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <section className="relative px-5 pt-14 pb-20 flex flex-col items-center">
      <div className="text-[10.5px] font-bold tracking-eyebrowWide uppercase text-ink3 mb-6 whitespace-nowrap">
        Scout Film Interface
      </div>

      <div className="w-full max-w-[1060px]">
        {/* Moment tabs */}
        <div className="flex gap-1.5 mb-2.5 flex-wrap">
          {annotations.map((a, i) => {
            const on = i === activeIdx;
            return (
              <button
                key={i}
                onClick={() => seekTo(a.start)}
                className="flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[11.5px] font-medium select-none transition-all"
                style={{
                  border: on ? "1px solid #000" : "1px solid var(--border)",
                  background: on ? "#000" : "var(--bg-2)",
                  color: on ? "#fff" : "var(--text-2)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: on ? "#fff" : DOT_COLORS[i] }}
                />
                {a.label}
                <span
                  className="text-[10px] tabular"
                  style={{ opacity: 0.55 }}
                >
                  {fmt(a.start)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3.5">
          {/* VIDEO */}
          <div>
            <div
              className="rounded-xl overflow-hidden bg-black"
              style={{
                border: "1px solid rgba(0,0,0,.12)",
                boxShadow: "0 24px 64px rgba(0,0,0,.18)",
              }}
            >
              <div
                className="relative w-full bg-black"
                style={{ paddingTop: "56.25%" }}
              >
                <video
                  ref={vidRef}
                  src={DEMO_VIDEO}
                  preload="auto"
                  playsInline
                  onClick={togglePlay}
                  onEnded={() => {
                    const v = vidRef.current;
                    if (!v) return;
                    v.currentTime = 0;
                    v.play().catch(() => {});
                  }}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                />
                <div className="absolute inset-0 pointer-events-none z-[2]">
                  {active && (
                    <>
                      <Corner pos="tl" data={active.corners.tl} />
                      <Corner pos="tr" data={active.corners.tr} />
                      <Corner pos="bl" data={active.corners.bl} />
                      <Corner pos="br" data={active.corners.br} />
                    </>
                  )}
                </div>
              </div>

              <div
                className="px-3.5 pt-2 pb-3"
                style={{
                  background: "#F0F0F0",
                  borderTop: "1px solid rgba(0,0,0,.06)",
                }}
              >
                <div
                  ref={tlRef}
                  onClick={scrub}
                  className="relative h-7 cursor-pointer flex items-center mb-1"
                >
                  <div
                    className="absolute left-0 right-0 h-[3px] rounded"
                    style={{ background: "rgba(0,0,0,.12)" }}
                  />
                  <div
                    className="absolute left-0 h-[3px] bg-ink rounded transition-[width] duration-75"
                    style={{ width: `${pct}%` }}
                  />
                  <div
                    className="absolute w-3 h-3 rounded-full bg-ink z-[2] transition-[left] duration-75"
                    style={{
                      left: `${pct}%`,
                      transform: "translateX(-50%)",
                      boxShadow: "0 0 0 3px rgba(0,0,0,.15)",
                    }}
                  />
                  {annotations.map((a, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        seekTo(a.start);
                      }}
                      className="absolute top-1/2 w-2 h-2 rounded-full z-[3] hover:scale-150 transition-transform"
                      style={{
                        left: `${(a.start / totalForMarkers) * 100}%`,
                        transform: "translate(-50%, -50%)",
                        border: "1.5px solid #000",
                        background: DOT_COLORS[i],
                      }}
                      title={`${a.label} · ${fmt(a.start)}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,.15)]"
                    style={{ background: "rgba(0,0,0,.07)" }}
                  >
                    {playing ? (
                      <svg width={10} height={12} viewBox="0 0 10 12" fill="currentColor">
                        <rect x={0} y={0} width={3.5} height={12} rx={1} />
                        <rect x={6.5} y={0} width={3.5} height={12} rx={1} />
                      </svg>
                    ) : (
                      <svg width={11} height={12} viewBox="0 0 11 12" fill="currentColor">
                        <polygon points="1,1 10,6 1,11" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => seekTo(current - 5)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,.15)]"
                    style={{ background: "rgba(0,0,0,.07)" }}
                  >
                    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                      <polyline points="5,2 1,6 5,10" />
                      <line x1={1} y1={6} x2={11} y2={6} />
                    </svg>
                  </button>
                  <button
                    onClick={() => seekTo(current + 5)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,.15)]"
                    style={{ background: "rgba(0,0,0,.07)" }}
                  >
                    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                      <polyline points="7,2 11,6 7,10" />
                      <line x1={11} y1={6} x2={1} y2={6} />
                    </svg>
                  </button>
                  <span className="text-[11.5px] text-ink2 tabular">
                    {fmt(current)} / {fmt(duration)}
                  </span>
                  <button
                    onClick={cycleSpeed}
                    className="ml-auto text-[11px] font-bold text-ink2 px-[9px] py-0.5 rounded hover:text-ink"
                    style={{
                      background: "rgba(0,0,0,.05)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {SPEEDS[speedIdx]}×
                  </button>
                  <span className="text-[10.5px] text-ink3 ml-1">HD · 360p</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex flex-col gap-2.5">
            <div
              className="rounded-xl overflow-hidden bg-bg2"
              style={{ border: "1px solid var(--border)" }}
            >
              {/* Player card */}
              <div
                className="flex items-center gap-2.5 px-3.5 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold text-ink shrink-0"
                  style={{
                    background: "#E8E8E8",
                    border: "1px solid rgba(0,0,0,.12)",
                  }}
                >
                  JE
                </div>
                <div>
                  <div className="text-[13px] font-bold text-ink">Jordan Ellis</div>
                  <div className="text-[11px] text-ink2">
                    PG · Westside Prep, Chicago · ★★★★★
                  </div>
                </div>
              </div>
              {/* Annotations head */}
              <div
                className="px-4 py-3 flex items-center justify-between text-[10px] font-bold text-ink3 uppercase"
                style={{
                  borderBottom: "1px solid var(--border)",
                  letterSpacing: "0.09em",
                }}
              >
                Scout Annotations
                <span
                  className="text-[10.5px] font-bold text-ink3 px-[7px] py-0.5 rounded-[10px]"
                  style={{ background: "var(--bg-3)" }}
                >
                  {annotations.length} notes
                </span>
              </div>
              {/* List */}
              <div className="p-1.5 flex flex-col gap-0.5">
                {annotations.map((a, i) => {
                  const on = i === activeIdx;
                  return (
                    <button
                      key={i}
                      onClick={() => seekTo(a.start)}
                      className="flex gap-2.5 items-start px-2 py-2 rounded-md text-left transition-colors"
                      style={{
                        background: on ? "var(--bg-3)" : "transparent",
                        border: on
                          ? "1px solid rgba(0,0,0,.14)"
                          : "1px solid transparent",
                      }}
                    >
                      <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                        <span
                          className="w-[7px] h-[7px] rounded-full"
                          style={{ background: DOT_COLORS[i] }}
                        />
                        <span
                          className="text-[9.5px] font-semibold tabular"
                          style={{ color: on ? "var(--text-2)" : "var(--text-3)" }}
                        >
                          {fmt(a.start)}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-ink leading-[1.5]">
                          {a.text}
                        </div>
                        <div className="text-[10.5px] text-ink3 mt-0.5 font-medium">
                          {a.phase}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats card */}
            <div
              className="rounded-xl overflow-hidden bg-bg2"
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="px-4 py-3 text-[10px] font-bold text-ink3 uppercase"
                style={{
                  borderBottom: "1px solid var(--border)",
                  letterSpacing: "0.09em",
                }}
              >
                Season Stats
              </div>
              <div
                className="grid grid-cols-2 gap-px"
                style={{ background: "var(--border)" }}
              >
                {STATS.map((s) => (
                  <div
                    key={s.lbl}
                    className="bg-bg2 px-3.5 py-3"
                  >
                    <div className="text-[10px] text-ink3 mb-0.5 uppercase tracking-eyebrow">
                      {s.lbl}
                    </div>
                    <div className="text-[20px] font-extrabold text-ink leading-none">
                      {s.val}
                    </div>
                    <div className="text-[10px] text-ink3 mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Corner({
  pos,
  data,
}: {
  pos: "tl" | "tr" | "bl" | "br";
  data: { lbl: string; val: string };
}) {
  const positions: Record<typeof pos, React.CSSProperties> = {
    tl: { top: 10, left: 14, textAlign: "left" },
    tr: { top: 10, right: 14, textAlign: "right" },
    bl: { bottom: 10, left: 14, textAlign: "left" },
    br: { bottom: 10, right: 14, textAlign: "right" },
  };
  return (
    <div
      className="absolute flex flex-col text-white"
      style={{
        ...positions[pos],
        gap: 1,
        textShadow: "0 1px 4px rgba(0,0,0,.7)",
      }}
    >
      <div
        className="font-semibold uppercase"
        style={{ fontSize: 9.5, opacity: 0.7, letterSpacing: "0.04em" }}
      >
        {data.lbl}
      </div>
      <div
        className="font-extrabold leading-tight"
        style={{ fontSize: 15, letterSpacing: "-0.3px" }}
      >
        {data.val}
      </div>
    </div>
  );
}
