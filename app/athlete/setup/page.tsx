"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

type Position = "PG" | "SG" | "SF" | "PF" | "C";
type Hand = "Right" | "Left" | "Both";

type FormState = {
  first: string;
  last: string;
  school: string;
  gradYear: string;
  gpa: string;
  position: Position | "";
  feet: string;
  inches: string;
  weight: string;
  wingFeet: string;
  wingInches: string;
  hand: Hand | "";
  files: File[];
  playerDescription: string;
};

const STEPS = [
  { label: "About you" },
  { label: "Physical" },
  { label: "Film" },
  { label: "Review" },
];

const POSITIONS: { code: Position; name: string }[] = [
  { code: "PG", name: "Point Guard" },
  { code: "SG", name: "Shooting Guard" },
  { code: "SF", name: "Small Forward" },
  { code: "PF", name: "Power Forward" },
  { code: "C", name: "Center" },
];

export default function AthleteSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    first: "",
    last: "",
    school: "",
    gradYear: "2026",
    gpa: "",
    position: "",
    feet: "",
    inches: "",
    weight: "",
    wingFeet: "",
    wingInches: "",
    hand: "",
    files: [],
    playerDescription: "",
  });
  const [submitting, setSubmitting] = useState<
    null | "uploading" | "indexing" | "evaluating" | "done" | "error"
  >(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const step0Valid =
    form.first.trim() &&
    form.last.trim() &&
    form.school.trim() &&
    form.gpa.trim() &&
    form.position;

  const step1Valid =
    form.feet.trim() && form.inches.trim() && form.weight.trim();

  const goStep = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    setSubmitError(null);
    setSubmitting("uploading");
    try {
      const file = form.files[0];
      if (!file) {
        throw new Error("Upload at least one clip to create a profile.");
      }

      // Step 1: upload directly from the browser to Vercel Blob.
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload-token",
      });
      const blobUrl = blob.url;

      // Step 2: hand the URL to our API → TwelveLabs URL ingest.
      const upRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: blobUrl, filename: file.name }),
      });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error ?? "upload failed");

      setSubmitting("indexing");
      let videoId: string | undefined;
      while (true) {
        await new Promise((r) => setTimeout(r, 3000));
        const sRes = await fetch(`/api/status/${upData.taskId}`);
        const sData = await sRes.json();
        if (sData.status === "ready" && sData.videoId) {
          videoId = sData.videoId;
          break;
        }
        if (sData.status === "failed") {
          throw new Error("Indexing failed at Twelve Labs");
        }
      }

      setSubmitting("evaluating");
      const evRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          videoUrl: blobUrl,
          position: form.position,
          displayName: `${form.first} ${form.last}`.trim(),
          playerDescription: form.playerDescription.trim() || undefined,
        }),
      });
      const evData = await evRes.json();
      if (!evRes.ok) throw new Error(evData.error ?? "evaluate failed");

      setSubmitting("done");
      setTimeout(() => router.push(`/players/${evData.player_id}`), 1100);
    } catch (e: any) {
      setSubmitError(e.message);
      setSubmitting("error");
    }
  };

  if (submitting && submitting !== "error") {
    return <SubmitView phase={submitting} firstName={form.first} />;
  }

  return (
    <div className="bg-bg2 min-h-screen">
      <div className="max-w-[600px] mx-auto px-5 pt-24 pb-20">
        <Steps step={step} />

        {step === 0 && (
          <Step0
            form={form}
            update={update}
            valid={!!step0Valid}
            onNext={() => goStep(1)}
          />
        )}
        {step === 1 && (
          <Step1
            form={form}
            update={update}
            valid={!!step1Valid}
            onBack={() => goStep(0)}
            onNext={() => goStep(2)}
          />
        )}
        {step === 2 && (
          <Step2
            form={form}
            update={update}
            onBack={() => goStep(1)}
            onNext={() => goStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            form={form}
            onBack={() => goStep(2)}
            onSubmit={submit}
            error={submitError}
          />
        )}
      </div>
    </div>
  );
}

function Steps({ step }: { step: number }) {
  return (
    <div className="flex items-center mb-9">
      {STEPS.map((s, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1.5 flex-1 relative"
          >
            {i < STEPS.length - 1 && (
              <div
                className="absolute h-[1.5px] top-3.5 transition-colors"
                style={{
                  left: "calc(50% + 14px)",
                  right: "calc(-50% + 14px)",
                  background: done ? "#000" : "var(--bg-3)",
                }}
              />
            )}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold z-10 transition-all"
              style={{
                border: active || done ? "1.5px solid #000" : "1.5px solid var(--bg-3)",
                background: active || done ? "#000" : "var(--bg)",
                color: active || done ? "#fff" : "var(--text-3)",
              }}
            >
              {done ? "✓" : i + 1}
            </div>
            <div
              className={`text-[10.5px] font-semibold uppercase tracking-eyebrow text-center whitespace-nowrap ${
                active ? "text-ink" : done ? "text-ink2" : "text-ink3"
              }`}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-bg rounded-[18px] p-8 mb-4 fade-up"
      style={{ border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}
    >
      {children}
    </div>
  );
}

function CardHead({
  step,
  title,
  sub,
}: {
  step: string;
  title: string;
  sub: string;
}) {
  return (
    <>
      <div className="text-[10.5px] font-bold text-ink3 uppercase tracking-eyebrowWide mb-1.5">
        {step}
      </div>
      <div className="text-xl font-extrabold tracking-tight mb-1">{title}</div>
      <div className="text-[13px] text-ink2 leading-[1.6] mb-7">{sub}</div>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <label className="block text-xs font-semibold text-ink2 mb-1.5">
        {label}{" "}
        {hint && <span className="font-normal text-ink3">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  [k: string]: any;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 text-sm text-ink bg-bg rounded-md outline-none transition-colors"
      style={{ border: "1.5px solid var(--bg-3)" }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#000")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--bg-3)")}
      {...rest}
    />
  );
}

function NavBtns({
  onBack,
  onNext,
  nextLabel = "Continue",
  disabled,
  primary,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  disabled?: boolean;
  primary?: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5 justify-end mt-5">
      {onBack && (
        <button
          onClick={onBack}
          className="text-[13.5px] font-semibold px-6 py-3 rounded-3xl text-ink2 transition-all hover:text-ink"
          style={{ border: "1.5px solid var(--border-h)" }}
        >
          Back
        </button>
      )}
      {primary ?? (
        <button
          onClick={onNext}
          disabled={disabled}
          className="flex items-center gap-2 text-[13.5px] font-bold px-7 py-3 rounded-3xl bg-ink text-white disabled:bg-bg3 disabled:text-ink3 transition-all hover:bg-[#333] hover:-translate-y-px disabled:hover:translate-y-0"
        >
          {nextLabel}
          <svg
            width={14}
            height={14}
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M3 7h8M7 3l4 4-4 4" />
          </svg>
        </button>
      )}
    </div>
  );
}

function Step0({
  form,
  update,
  valid,
  onNext,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  valid: boolean;
  onNext: () => void;
}) {
  return (
    <>
      <Card>
        <CardHead
          step="Step 1 of 4"
          title="Tell us about yourself"
          sub="This builds your recruiting profile and helps scouts find you."
        />
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Field label="First name">
            <Input
              value={form.first}
              onChange={(v) => update("first", v)}
              placeholder="Jordan"
            />
          </Field>
          <Field label="Last name">
            <Input
              value={form.last}
              onChange={(v) => update("last", v)}
              placeholder="Ellis"
            />
          </Field>
        </div>
        <Field label="High school / program">
          <Input
            value={form.school}
            onChange={(v) => update("school", v)}
            placeholder="Westside Prep · Chicago, IL"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Field label="Grad year">
            <select
              value={form.gradYear}
              onChange={(e) => update("gradYear", e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-ink bg-bg rounded-md outline-none cursor-pointer"
              style={{ border: "1.5px solid var(--bg-3)" }}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </Field>
          <Field label="GPA">
            <Input
              type="number"
              value={form.gpa}
              onChange={(v) => update("gpa", v)}
              placeholder="3.7"
              min="0"
              max="4.0"
              step="0.1"
            />
          </Field>
        </div>
        <Field label="Position">
          <div className="flex gap-2 flex-wrap">
            {POSITIONS.map((p) => {
              const sel = form.position === p.code;
              return (
                <button
                  key={p.code}
                  onClick={() => update("position", p.code)}
                  className={`flex-1 min-w-[68px] px-2 py-2.5 rounded-md transition-all ${
                    sel
                      ? "bg-ink text-white"
                      : "bg-bg text-ink hover:bg-bg2"
                  }`}
                  style={{
                    border: sel
                      ? "1.5px solid #000"
                      : "1.5px solid var(--bg-3)",
                  }}
                >
                  <div className="text-[15px] font-extrabold">{p.code}</div>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: sel ? "rgba(255,255,255,.6)" : "var(--text-3)" }}
                  >
                    {p.name}
                  </div>
                </button>
              );
            })}
          </div>
        </Field>
      </Card>
      <NavBtns onNext={onNext} disabled={!valid} />
    </>
  );
}

function Step1({
  form,
  update,
  valid,
  onBack,
  onNext,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  valid: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <Card>
        <CardHead
          step="Step 2 of 4"
          title="Physical attributes"
          sub="Scouts use these to evaluate fit for their program's system."
        />

        <Field label="Height">
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={form.feet}
              onChange={(v) => update("feet", v)}
              placeholder="6"
              min="4"
              max="8"
            />
            <span className="text-[12.5px] text-ink3 font-medium">ft</span>
            <Input
              type="number"
              value={form.inches}
              onChange={(v) => update("inches", v)}
              placeholder="3"
              min="0"
              max="11"
            />
            <span className="text-[12.5px] text-ink3 font-medium">in</span>
          </div>
        </Field>

        <Field label="Weight">
          <div className="flex gap-2 items-center max-w-[200px]">
            <Input
              type="number"
              value={form.weight}
              onChange={(v) => update("weight", v)}
              placeholder="185"
              min="100"
              max="400"
            />
            <span className="text-[12.5px] text-ink3 font-medium">lbs</span>
          </div>
        </Field>

        <Field label="Wingspan" hint="(optional)">
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={form.wingFeet}
              onChange={(v) => update("wingFeet", v)}
              placeholder="6"
              min="4"
              max="9"
            />
            <span className="text-[12.5px] text-ink3 font-medium">ft</span>
            <Input
              type="number"
              value={form.wingInches}
              onChange={(v) => update("wingInches", v)}
              placeholder="5"
              min="0"
              max="11"
            />
            <span className="text-[12.5px] text-ink3 font-medium">in</span>
          </div>
        </Field>

        <Field label="Dominant hand">
          <div className="flex gap-2 max-w-[300px]">
            {(["Right", "Left", "Both"] as Hand[]).map((h) => {
              const sel = form.hand === h;
              return (
                <button
                  key={h}
                  onClick={() => update("hand", h)}
                  className="flex-1 min-w-[100px] px-2 py-2.5 rounded-md transition-all"
                  style={{
                    border: sel
                      ? "1.5px solid #000"
                      : "1.5px solid var(--bg-3)",
                    background: sel ? "#000" : "var(--bg)",
                    color: sel ? "#fff" : "var(--text-1)",
                  }}
                >
                  <span className="text-[13px] font-extrabold">{h}</span>
                </button>
              );
            })}
          </div>
        </Field>
      </Card>
      <NavBtns onBack={onBack} onNext={onNext} disabled={!valid} />
    </>
  );
}

function Step2({
  form,
  update,
  onBack,
  onNext,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);

  const addFiles = (incoming: File[]) => {
    const valid = incoming.filter((f) => f.type.startsWith("video/"));
    const merged = [...form.files];
    for (const f of valid) {
      if (!merged.find((x) => x.name === f.name)) merged.push(f);
    }
    update("files", merged);
  };

  return (
    <>
      <Card>
        <CardHead
          step="Step 3 of 4"
          title="Upload your film"
          sub="Scouts watch film first. Upload your best clips to get noticed. One clip is enough to start."
        />

        <div
          className={`relative rounded-[18px] p-10 text-center cursor-pointer transition-all ${
            drag ? "bg-[#F5F5F5]" : "bg-bg2"
          }`}
          style={{
            border: drag
              ? "2px dashed #000"
              : "2px dashed var(--border-h)",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            addFiles(Array.from(e.dataTransfer.files));
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
          />
          <div
            className="w-12 h-12 rounded-[14px] bg-bg flex items-center justify-center mx-auto mb-3.5 text-[22px]"
            style={{
              border: "1px solid var(--border)",
              boxShadow: "0 2px 8px rgba(0,0,0,.06)",
            }}
          >
            🎬
          </div>
          <div className="text-sm font-bold mb-1">Drop your clips here</div>
          <div className="text-[12.5px] text-ink2 mb-4">
            Drag & drop video files, or click to browse
          </div>
          <div className="inline-flex items-center gap-1.5 text-[12.5px] font-bold px-[18px] py-2 rounded-full bg-ink text-white">
            <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
              <path
                d="M6.5 1v8M3 5l3.5-4L10 5"
                stroke="white"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 10h11"
                stroke="white"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </svg>
            Choose files
          </div>
          <div className="text-[11px] text-ink3 mt-3">
            MP4, MOV · Up to 200 MB per file
          </div>
        </div>

        {form.files.length > 0 && (
          <div className="flex flex-col gap-2 mt-3.5">
            {form.files.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-2.5 px-3.5 py-2.5 bg-bg rounded-md"
                style={{ border: "1px solid var(--border)" }}
              >
                <div className="text-lg shrink-0">🎥</div>
                <div className="text-sm font-medium flex-1 min-w-0 truncate">
                  {f.name}
                </div>
                <div className="text-[11.5px] text-ink3 shrink-0">
                  {(f.size / 1e6).toFixed(1)} MB
                </div>
                <button
                  onClick={() =>
                    update(
                      "files",
                      form.files.filter((x) => x.name !== f.name),
                    )
                  }
                  className="w-[22px] h-[22px] rounded-full bg-bg3 text-ink2 text-[11px] flex items-center justify-center hover:bg-[#ddd]"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Field
            label="Which player are you?"
            hint="(helps the AI track you in the clip)"
          >
            <Input
              value={form.playerDescription}
              onChange={(v) => update("playerDescription", v)}
              placeholder="e.g. 'wearing white #11', 'red jersey, ball-handler at the start'"
            />
          </Field>
        </div>
      </Card>
      <NavBtns onBack={onBack} onNext={onNext} />
    </>
  );
}

function Step3({
  form,
  onBack,
  onSubmit,
  error,
}: {
  form: FormState;
  onBack: () => void;
  onSubmit: () => void;
  error: string | null;
}) {
  const review = [
    { lbl: "Name", val: `${form.first} ${form.last}`.trim() || "—" },
    { lbl: "Position", val: form.position || "—" },
    { lbl: "School", val: form.school || "—" },
    { lbl: "Class", val: form.gradYear || "—" },
    {
      lbl: "Height",
      val:
        form.feet && form.inches ? `${form.feet}'${form.inches}"` : "—",
    },
    { lbl: "Weight", val: form.weight ? `${form.weight} lbs` : "—" },
    { lbl: "GPA", val: form.gpa || "—" },
    { lbl: "Hand", val: form.hand || "—" },
  ];

  return (
    <>
      <Card>
        <CardHead
          step="Step 4 of 4"
          title={`Looking good${form.first ? `, ${form.first}` : ""}.`}
          sub="Review your details. Sideline will index your film and grade it as soon as you submit."
        />

        {form.files.length > 0 ? (
          form.files.map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-2.5 px-3.5 py-3 bg-bg2 rounded-md mb-2.5"
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="text-xl">🎥</div>
              <div>
                <div className="text-sm font-medium">{f.name}</div>
                <div className="text-[11px] text-ink3 mt-px">
                  {(f.size / 1e6).toFixed(1)} MB · ready
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="flex items-center gap-2.5 px-3.5 py-3 bg-bg2 rounded-md mb-2.5"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="text-xl">📎</div>
            <div>
              <div className="text-sm font-medium">No film uploaded</div>
              <div className="text-[11px] text-ink3 mt-px">
                Go back and add at least one clip — Sideline needs film to
                grade
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 mt-1">
          {review.map((r) => (
            <div
              key={r.lbl}
              className="rounded-md px-3.5 py-3 bg-bg2"
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="text-[10.5px] text-ink3 uppercase tracking-eyebrow mb-0.5">
                {r.lbl}
              </div>
              <div className="text-[15px] font-bold text-ink">{r.val}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 text-[13px] text-[#C8102E]">{error}</div>
        )}
      </Card>

      <div className="flex gap-2.5 justify-end mt-5">
        <button
          onClick={onBack}
          className="text-[13.5px] font-semibold px-6 py-3 rounded-3xl text-ink2 transition-all hover:text-ink"
          style={{ border: "1.5px solid var(--border-h)" }}
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={form.files.length === 0}
          className="flex items-center gap-2 text-[13.5px] font-bold px-7 py-3 rounded-3xl bg-ink text-white disabled:bg-bg3 disabled:text-ink3 transition-all hover:bg-[#333] hover:-translate-y-px disabled:hover:translate-y-0"
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M2 7l4 4 6-7" />
          </svg>
          Create profile
        </button>
      </div>
    </>
  );
}

function SubmitView({
  phase,
  firstName,
}: {
  phase: "uploading" | "indexing" | "evaluating" | "done";
  firstName: string;
}) {
  const steps = [
    { id: "uploading", label: "Uploading film", sub: "Streaming bytes to TwelveLabs" },
    { id: "indexing", label: "AI watching tape", sub: "Frame-by-frame perception" },
    { id: "evaluating", label: "Filing the report", sub: "Six-category rubric · Claude Sonnet" },
  ];
  const idx = phase === "done" ? 3 : steps.findIndex((s) => s.id === phase);

  return (
    <div className="bg-bg2 min-h-screen pt-24 pb-20 px-5">
      <div className="max-w-[600px] mx-auto text-center fade-up">
        <div className="text-[10.5px] font-bold tracking-eyebrowWide uppercase text-ink3 mb-3">
          Filing your report
        </div>
        <h1
          className="text-ink font-black mb-3.5 leading-[0.96]"
          style={{ fontSize: "clamp(34px, 6vw, 58px)", letterSpacing: "-2px" }}
        >
          {phase === "done" ? (
            <>Filed{firstName ? `, ${firstName}` : ""}.</>
          ) : (
            <>
              Hang tight{firstName ? `, ${firstName}` : ""}.
              <br />
              <span style={{ color: "#CCCCCC" }}>Watching</span> your tape.
            </>
          )}
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
                {done && (
                  <span className="text-[10.5px] font-semibold text-[#1F6B3A] uppercase tracking-eyebrow">
                    Done
                  </span>
                )}
                {active && (
                  <span className="text-[10.5px] font-semibold text-ink uppercase tracking-eyebrow">
                    Working
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
