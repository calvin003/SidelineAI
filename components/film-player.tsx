"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PlayerEvaluation } from "@/lib/schema";

type Moment = PlayerEvaluation["tagged_moments"][number];

const SPEEDS = [0.5, 1, 1.5, 2];

const RATING_COLORS: Record<Moment["rating"], string> = {
  positive: "#1F6B3A",
  neutral: "#666666",
  negative: "#C8102E",
};

function tsToSec(ts: string): number {
  const m = ts.match(/(\d+):(\d+)/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function fmt(s: number): string {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Generate stable pseudo-random box positions per moment so each annotation
// appears in a different area of the frame.
function boxFor(idx: number) {
  const seed = (idx * 9301 + 49297) % 233280;
  const norm = seed / 233280;
  const x = 5 + norm * 25;
  const y = 8 + ((idx * 7919) % 12);
  const w = 50 + ((idx * 31) % 12);
  const h = 70 + ((idx * 17) % 18);
  return {
    x: `${x}%`,
    y: `${y}%`,
    w: `${Math.min(w, 100 - x - 2)}%`,
    h: `${Math.min(h, 100 - y - 2)}%`,
  };
}

export function FilmPlayer({
  videoUrl,
  moments,
  caption,
  autoplay,
}: {
  videoUrl: string;
  moments: Moment[];
  caption?: string;
  autoplay?: boolean;
}) {
  const vidRef = useRef<HTMLVideoElement | null>(null);
  const tlRef = useRef<HTMLDivElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [activeIdx, setActiveIdx] = useState<number>(-1);

  // Always render moments in the side panel and on the timeline. When
  // duration is known, use precise positioning; otherwise estimate using a
  // notional max so the UI is populated immediately.
  const enriched = useMemo(() => {
    const fallbackMax =
      Math.max(60, ...moments.map((m) => tsToSec(m.timestamp) + 5));
    const total = duration || fallbackMax;
    return moments.map((m, i) => {
      const rawStart = tsToSec(m.timestamp);
      const dur = m.duration_seconds || 4;
      const safeStart = Math.min(rawStart, Math.max(0, total - 1));
      return {
        ...m,
        idx: i,
        start: safeStart,
        end: Math.min(safeStart + dur, total),
        total,
        box: boxFor(i),
      };
    });
  }, [moments, duration]);

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    const onMeta = () => {
      setDuration(v.duration || 0);
      if (autoplay) {
        v.muted = true;
        v.play().catch(() => {});
      }
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
  }, [autoplay]);

  useEffect(() => {
    if (!enriched.length) {
      setActiveIdx(-1);
      return;
    }
    const found = enriched.findIndex(
      (m) => current >= m.start && current < m.end,
    );
    setActiveIdx(found);
  }, [current, enriched]);

  const togglePlay = () => {
    const v = vidRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const seekTo = (t: number) => {
    const v = vidRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(duration || 0, t));
    if (v.paused) v.play();
  };

  const scrub = (e: React.MouseEvent) => {
    const el = tlRef.current;
    if (!el || !duration) return;
    const rect = el.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seekTo(ratio * duration);
  };

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (vidRef.current) vidRef.current.playbackRate = SPEEDS[next];
  };

  const active = activeIdx >= 0 ? enriched[activeIdx] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
      {/* VIDEO CARD */}
      <div
        className="rounded-xl overflow-hidden border bg-black shadow-soft"
        style={{ borderColor: "#222" }}
      >
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <video
            ref={vidRef}
            src={videoUrl}
            preload="metadata"
            playsInline
            onClick={togglePlay}
            onEnded={() => {
              const v = vidRef.current;
              if (!v) return;
              v.currentTime = 0;
            }}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          />

          {/* Initial play overlay */}
          {!autoplay && !playing && current === 0 && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 z-[4] flex items-center justify-center cursor-pointer"
              style={{ background: "rgba(0,0,0,.4)" }}
            >
              <div
                className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,.16)",
                  border: "2px solid rgba(255,255,255,.6)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <svg width={20} height={20} viewBox="0 0 20 20" fill="white">
                  <polygon points="6,3 18,10 6,17" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-3.5 pt-2 pb-3" style={{ background: "#F0F0F0" }}>
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
              className="absolute left-0 h-[3px] bg-ink rounded"
              style={{
                width: duration ? `${(current / duration) * 100}%` : "0%",
              }}
            />
            <div
              className="absolute w-3 h-3 rounded-full bg-ink z-[2]"
              style={{
                left: duration ? `${(current / duration) * 100}%` : "0%",
                transform: "translateX(-50%)",
                boxShadow: "0 0 0 3px rgba(0,0,0,.15)",
              }}
            />
            {enriched.map((m) => (
              <button
                key={m.idx}
                onClick={(e) => {
                  e.stopPropagation();
                  seekTo(m.start);
                }}
                className="absolute top-1/2 w-2 h-2 rounded-full z-[3]"
                style={{
                  left: `${(m.start / m.total) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  border: "1.5px solid #000",
                  background: RATING_COLORS[m.rating],
                }}
                title={`${m.timestamp} · ${m.category}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,.07)" }}
            >
              {playing ? (
                <svg width={11} height={12} viewBox="0 0 11 12" fill="currentColor">
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
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,.07)" }}
            >
              <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <polyline points="5,2 1,6 5,10" />
                <line x1={1} y1={6} x2={11} y2={6} />
              </svg>
            </button>
            <button
              onClick={() => seekTo(current + 5)}
              className="w-7 h-7 rounded-full flex items-center justify-center"
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
              className="ml-auto text-[11px] font-bold text-ink2 px-[9px] py-[2px] rounded"
              style={{
                background: "rgba(0,0,0,.05)",
                border: "1px solid var(--border)",
              }}
            >
              {SPEEDS[speedIdx]}×
            </button>
            <span className="text-[10.5px] text-ink3 ml-1">HD</span>
          </div>
        </div>
      </div>

      {/* SIDE PANEL */}
      <div className="flex flex-col gap-2.5">
        <div
          className="rounded-xl overflow-hidden bg-bg2"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="eyebrow">Tagged Moments</span>
            <span
              className="text-[10.5px] font-bold text-ink3 px-[7px] py-[2px] rounded-[10px]"
              style={{ background: "var(--bg-3)" }}
            >
              {moments.length} clips
            </span>
          </div>
          <div className="p-1.5 flex flex-col gap-0.5 max-h-[420px] overflow-y-auto">
            {enriched.map((m) => {
              const on = m.idx === activeIdx;
              return (
                <button
                  key={m.idx}
                  onClick={() => seekTo(m.start)}
                  className={`flex gap-2.5 items-start px-2.5 py-2 rounded-md text-left transition-colors ${
                    on ? "bg-bg3" : "hover:bg-bg3"
                  }`}
                  style={{
                    border: on
                      ? "1px solid rgba(0,0,0,.14)"
                      : "1px solid transparent",
                  }}
                >
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <span
                      className="w-[7px] h-[7px] rounded-full"
                      style={{ background: RATING_COLORS[m.rating] }}
                    />
                    <span className="text-[9.5px] font-semibold text-ink3 tabular">
                      {m.timestamp}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-ink leading-snug line-clamp-2">
                      {m.factual_description}
                    </div>
                    <div className="text-[10.5px] text-ink3 mt-0.5 font-medium">
                      {m.category.replace(/_/g, " ")}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {caption && (
          <div
            className="rounded-xl px-4 py-3 bg-bg2 text-[12px] text-ink2 leading-relaxed"
            style={{ border: "1px solid var(--border)" }}
          >
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}

function Corner({
  pos,
  label,
  value,
}: {
  pos: "tl" | "tr" | "bl" | "br";
  label: string;
  value: string;
}) {
  const positions: Record<typeof pos, React.CSSProperties> = {
    tl: { top: 10, left: 14, textAlign: "left" },
    tr: { top: 10, right: 14, textAlign: "right" },
    bl: { bottom: 10, left: 14, textAlign: "left" },
    br: { bottom: 10, right: 14, textAlign: "right" },
  };
  return (
    <div
      className="absolute flex flex-col gap-px text-white"
      style={{
        ...positions[pos],
        textShadow: "0 1px 4px rgba(0,0,0,.7)",
      }}
    >
      <div
        className="font-semibold uppercase"
        style={{ fontSize: 9.5, opacity: 0.7, letterSpacing: "0.04em" }}
      >
        {label}
      </div>
      <div
        className="font-extrabold leading-tight"
        style={{ fontSize: 15, letterSpacing: "-0.3px" }}
      >
        {value}
      </div>
    </div>
  );
}

function ratingLabel(r: Moment["rating"]) {
  if (r === "positive") return "+ Plus";
  if (r === "negative") return "− Note";
  return "Neutral";
}
