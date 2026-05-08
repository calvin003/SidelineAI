"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

type Stage =
  | { kind: "form" }
  | { kind: "uploading" }
  | { kind: "indexing"; taskId: string }
  | { kind: "evaluating"; videoId: string }
  | { kind: "done"; playerId: string }
  | { kind: "error"; message: string };

const POSITIONS = ["PG", "SG", "SF", "PF", "C", "wing", "guard", "forward"];

export default function UploadPage() {
  const [stage, setStage] = useState<Stage>({ kind: "form" });
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<string>("wing");
  const [name, setName] = useState<string>("");
  const [playerDescription, setPlayerDescription] = useState<string>("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stage.kind !== "indexing") return;
    const id = setInterval(async () => {
      try {
        const r = await fetch(`/api/status/${stage.taskId}`);
        const d = await r.json();
        if (d.status === "ready" && d.videoId) {
          clearInterval(id);
          setStage({ kind: "evaluating", videoId: d.videoId });
        } else if (d.status === "failed") {
          clearInterval(id);
          setStage({ kind: "error", message: "Indexing failed at Twelve Labs" });
        }
      } catch (e: any) {
        clearInterval(id);
        setStage({ kind: "error", message: e.message });
      }
    }, 3000);
    return () => clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (stage.kind !== "evaluating") return;
    (async () => {
      try {
        const r = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: stage.videoId,
            position,
            displayName: name || undefined,
            playerDescription: playerDescription.trim() || undefined,
          }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "evaluate failed");
        setStage({ kind: "done", playerId: d.player_id });
      } catch (e: any) {
        setStage({ kind: "error", message: e.message });
      }
    })();
  }, [stage, position, name, playerDescription]);

  const submit = async () => {
    if (!file) return;
    setStage({ kind: "uploading" });
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload-token",
      });
      const r = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: blob.url, filename: file.name }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "upload failed");
      setStage({ kind: "indexing", taskId: d.taskId });
    } catch (e: any) {
      setStage({ kind: "error", message: e.message });
    }
  };

  return (
    <div className="min-h-screen relative pt-20 pb-16 px-6">
      <div className="page-grid-bg" />

      <div className="relative z-10 max-w-[680px] mx-auto">
        <div className="flex justify-center mb-6">
          <div className="eyebrow-pill">
            <span className="eyebrow-dot" />
            Upload your tape · Step {stepNumber(stage)} of 4
          </div>
        </div>

        {stage.kind === "form" && (
          <FormView
            file={file}
            setFile={setFile}
            position={position}
            setPosition={setPosition}
            name={name}
            setName={setName}
            playerDescription={playerDescription}
            setPlayerDescription={setPlayerDescription}
            drag={drag}
            setDrag={setDrag}
            fileRef={fileRef}
            onSubmit={submit}
          />
        )}

        {(stage.kind === "uploading" ||
          stage.kind === "indexing" ||
          stage.kind === "evaluating") && <Processing stage={stage} />}

        {stage.kind === "done" && <DoneView playerId={stage.playerId} />}

        {stage.kind === "error" && (
          <ErrorView
            message={stage.message}
            onRetry={() => setStage({ kind: "form" })}
          />
        )}
      </div>
    </div>
  );
}

function FormView({
  file,
  setFile,
  position,
  setPosition,
  name,
  setName,
  playerDescription,
  setPlayerDescription,
  drag,
  setDrag,
  fileRef,
  onSubmit,
}: any) {
  return (
    <>
      <h1
        className="text-center text-ink font-black mb-3.5 leading-[0.96]"
        style={{ fontSize: "clamp(34px, 6vw, 58px)", letterSpacing: "-2.5px" }}
      >
        Upload one
        <br />
        <span style={{ color: "#CCCCCC" }}>game</span>.
      </h1>
      <p className="text-base text-ink2 leading-[1.65] text-center mb-10 max-w-[460px] mx-auto">
        MP4 or MOV. Up to ~150MB. A single full game gives Sideline enough
        evidence for honest grades.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-3.5"
      >
        <div
          className={`relative rounded-2xl p-12 text-center cursor-pointer transition-all ${
            drag ? "bg-bg3" : file ? "bg-bg2" : "bg-bg"
          }`}
          style={{
            border: drag
              ? "2px dashed #000"
              : file
                ? "2px solid #000"
                : "2px dashed var(--border-h)",
          }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) setFile(f);
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/quicktime"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="space-y-2">
              <div className="text-2xl font-bold text-ink">{file.name}</div>
              <div className="text-[12.5px] text-ink3">
                {(file.size / 1024 / 1024).toFixed(1)} MB · ready to send
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className="text-2xl font-bold text-ink2"
                style={{ letterSpacing: "-1px" }}
              >
                Drop the tape
              </div>
              <div className="text-[12px] text-ink3">
                or click to browse · MP4 / MOV
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="bg-bg rounded-xl px-4 py-3"
            style={{ border: "1px solid var(--border-h)" }}
          >
            <div className="text-[11px] text-ink3 mb-1 uppercase tracking-eyebrow font-semibold">
              Display name
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marcus Avery"
              className="w-full bg-transparent text-[15px] text-ink outline-none"
            />
          </div>
          <div
            className="bg-bg rounded-xl px-4 py-3"
            style={{ border: "1px solid var(--border-h)" }}
          >
            <div className="text-[11px] text-ink3 mb-1 uppercase tracking-eyebrow font-semibold">
              Position
            </div>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-transparent text-[15px] text-ink outline-none"
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="bg-bg rounded-xl px-4 py-3"
          style={{ border: "1px solid var(--border-h)" }}
        >
          <div className="text-[11px] text-ink3 mb-1 uppercase tracking-eyebrow font-semibold">
            Which player are you? (helps the AI track you)
          </div>
          <input
            value={playerDescription}
            onChange={(e) => setPlayerDescription(e.target.value)}
            placeholder="e.g. wearing white #11, red jersey, ball-handler at the start"
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink3"
          />
        </div>

        <button
          type="submit"
          disabled={!file}
          className="w-full bg-ink text-white py-3.5 rounded-3xl text-[14px] font-bold disabled:bg-bg3 disabled:text-ink3 hover:bg-[#333] transition-all hover:-translate-y-px disabled:hover:translate-y-0"
        >
          Send for evaluation →
        </button>
      </form>
    </>
  );
}

function Processing({
  stage,
}: {
  stage:
    | { kind: "uploading" }
    | { kind: "indexing"; taskId: string }
    | { kind: "evaluating"; videoId: string };
}) {
  const steps: { id: string; label: string; sub: string }[] = [
    { id: "uploading", label: "Uploading film", sub: "Streaming bytes to TwelveLabs" },
    { id: "indexing", label: "AI watching tape", sub: "Frame-by-frame perception (Pegasus 1.5)" },
    { id: "evaluating", label: "Filing the report", sub: "Six-category rubric · Claude Sonnet" },
  ];
  const idx = steps.findIndex((s) => s.id === stage.kind);

  return (
    <div className="text-center fade-up">
      <h1
        className="text-ink font-black mb-3.5 leading-[0.96]"
        style={{ fontSize: "clamp(34px, 6vw, 58px)", letterSpacing: "-2.5px" }}
      >
        We&apos;re
        <br />
        <span style={{ color: "#CCCCCC" }}>watching</span>.
      </h1>
      <p className="text-base text-ink2 leading-[1.65] mb-10 max-w-[460px] mx-auto">
        A full evaluation usually takes 2–4 minutes. Don&apos;t close the tab.
      </p>

      <div
        className="bg-bg rounded-xl p-2 max-w-[460px] mx-auto"
        style={{ border: "1px solid var(--border)" }}
      >
        {steps.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <div
              key={s.id}
              className={`flex items-center gap-3.5 p-3 rounded-md transition-opacity ${
                i > idx ? "opacity-30" : ""
              }`}
              style={{
                borderBottom: i < steps.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: done ? "#1F6B3A" : active ? "#000" : "var(--bg-3)",
                }}
              >
                {done && (
                  <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth={2}>
                    <path d="M2 6l3 3 5-6" />
                  </svg>
                )}
                {active && (
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-white" style={{ animation: "blinkDot 1.2s infinite" }} />
                    <span className="w-1 h-1 rounded-full bg-white" style={{ animation: "blinkDot 1.2s 0.2s infinite" }} />
                    <span className="w-1 h-1 rounded-full bg-white" style={{ animation: "blinkDot 1.2s 0.4s infinite" }} />
                  </span>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-ink">{s.label}</div>
                <div className="text-xs text-ink2 mt-px">{s.sub}</div>
              </div>
              {done && <span className="text-[10.5px] font-semibold text-[#1F6B3A] uppercase tracking-eyebrow">Done</span>}
              {active && <span className="text-[10.5px] font-semibold text-ink uppercase tracking-eyebrow">Working</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DoneView({ playerId }: { playerId: string }) {
  return (
    <div className="text-center fade-up">
      <h1
        className="text-ink font-black mb-3.5 leading-[0.96]"
        style={{ fontSize: "clamp(34px, 6vw, 58px)", letterSpacing: "-2.5px" }}
      >
        Filed.
      </h1>
      <p className="text-base text-ink2 leading-[1.65] mb-10 max-w-[460px] mx-auto">
        Six-category grades, eight-plus tagged moments, and one honest read on
        what to fix next — all in your report.
      </p>

      <div className="flex gap-3 justify-center flex-wrap">
        <Link
          href={`/players/${playerId}`}
          className="bg-ink text-white px-7 py-3 rounded-3xl text-sm font-bold hover:bg-[#333] transition-all hover:-translate-y-px"
        >
          Open the report →
        </Link>
        <Link
          href="/leaderboard"
          className="text-sm font-semibold px-7 py-3 rounded-3xl text-ink2 hover:text-ink transition-all"
          style={{ border: "1px solid var(--border-h)" }}
        >
          See all recruits
        </Link>
      </div>
    </div>
  );
}

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center fade-up">
      <h1
        className="text-ink font-black mb-3.5 leading-[0.96]"
        style={{ fontSize: "clamp(34px, 6vw, 58px)", letterSpacing: "-2.5px" }}
      >
        Filing error.
      </h1>
      <p className="text-base text-ink2 leading-[1.65] mb-10 max-w-[460px] mx-auto">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="bg-ink text-white px-7 py-3 rounded-3xl text-sm font-bold hover:bg-[#333] transition-all hover:-translate-y-px"
      >
        Try again
      </button>
    </div>
  );
}

function stepNumber(s: Stage): number {
  switch (s.kind) {
    case "form":
      return 1;
    case "uploading":
    case "indexing":
      return 2;
    case "evaluating":
      return 3;
    case "done":
    case "error":
      return 4;
  }
}
