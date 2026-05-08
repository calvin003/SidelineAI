import Link from "next/link";
import { getAllPlayers } from "@/lib/players";
import { avgScore } from "@/lib/utils";
import { SiteFooter } from "@/components/site-footer";
import { LandingDemo } from "@/components/landing-demo";

export default function Home() {
  const players = getAllPlayers();
  const totalReports = players.length;

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 overflow-hidden">
        <div className="page-grid-bg" />
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 40% at 50% 65%, rgba(0,0,0,.02) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-3xl text-center">
          <div className="eyebrow-pill mb-7">
            <span className="eyebrow-dot" />
            Now in beta · Class of 2026
          </div>

          <h1
            className="font-black text-ink leading-[0.93]"
            style={{
              fontSize: "clamp(52px, 9vw, 96px)",
              letterSpacing: "-4px",
            }}
          >
            Scout smarter.
            <br />
            <span className="text-[#BBBBBB]">Perform</span> better.
          </h1>

          <p
            className="mx-auto text-ink2 mt-6 max-w-[500px]"
            style={{ fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.7 }}
          >
            Sideline turns raw game footage into annotated intelligence —
            giving scouts the edge to find talent and athletes the tools to
            get recruited.
          </p>

          <div className="flex gap-2.5 justify-center flex-wrap mt-10">
            <Link
              href="/leaderboard"
              className="flex items-center gap-2 text-[13.5px] font-bold px-[26px] py-[13px] rounded-3xl bg-ink text-white hover:bg-[#333] transition-all hover:-translate-y-px"
            >
              <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
                <circle cx={7.5} cy={7.5} r={6.5} stroke="white" strokeWidth={1.5} />
                <polygon points="5.5,4.5 11.5,7.5 5.5,10.5" fill="white" />
              </svg>
              Watch it work
            </Link>
            <Link
              href="#role-section"
              className="text-[13.5px] font-semibold px-[26px] py-[13px] rounded-3xl text-ink2 transition-all hover:text-ink hover:-translate-y-px"
              style={{ border: "1px solid var(--border-h)" }}
            >
              Choose your role →
            </Link>
          </div>

          {/* Stats strip */}
          <div
            className="flex mt-14 mx-auto w-fit rounded-xl overflow-hidden"
            style={{
              background: "rgba(0,0,0,.03)",
              border: "1px solid var(--border)",
            }}
          >
            {[
              { v: `${totalReports}`, l: "Reports filed" },
              { v: "6", l: "Skill categories" },
              { v: "98%", l: "Schema match" },
              { v: "D1", l: "Conference ready" },
            ].map((s, i) => (
              <div
                key={s.l}
                className="px-7 py-3.5 text-center"
                style={{
                  borderRight: i < 3 ? "1px solid var(--border)" : "none",
                }}
              >
                <div className="text-[22px] font-extrabold text-ink">{s.v}</div>
                <div className="text-[10.5px] text-ink3 uppercase tracking-eyebrow mt-px">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#role-section"
          className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink3 text-[10.5px] font-semibold uppercase tracking-eyebrowWide z-10 animate-bob no-underline"
        >
          <span>Scroll to explore</span>
          <span
            className="w-4 h-4"
            style={{
              borderRight: "1.5px solid var(--text-3)",
              borderBottom: "1.5px solid var(--text-3)",
              transform: "rotate(45deg)",
            }}
          />
        </a>
      </section>

      {/* LIVE DEMO */}
      <LandingDemo />

      {/* ROLE SECTION */}
      <section
        id="role-section"
        className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative"
      >
        <div className="text-center max-w-[820px] z-10">
          <div className="text-[10.5px] font-bold tracking-eyebrowWide uppercase text-ink3 mb-5">
            Get started — it&apos;s free
          </div>
          <h2
            className="font-black text-ink leading-[1.05] mb-3.5"
            style={{
              fontSize: "clamp(34px, 5vw, 54px)",
              letterSpacing: "-2px",
            }}
          >
            Who are you on the court?
          </h2>
          <p className="text-[15px] text-ink2 mb-13 max-w-[440px] mx-auto leading-[1.7]">
            Sideline adapts to your role — whether you&apos;re finding the next
            star or becoming one.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-[720px] mx-auto mt-12">
            <Link
              href="/recruit"
              className="bg-bg2 rounded-2xl p-7 text-left transition-all hover:-translate-y-1 hover:shadow-soft block group"
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="w-[46px] h-[46px] rounded-xl flex items-center justify-center text-xl mb-4"
                style={{
                  background: "var(--bg-3)",
                  border: "1px solid var(--border)",
                }}
              >
                🔍
              </div>
              <div className="text-xl font-extrabold text-ink mb-2">
                I&apos;m a Scout
              </div>
              <div className="text-[13px] text-ink2 leading-[1.65] mb-5">
                Search recruits in plain English. Composite rankings, archetype
                comparisons, and evidence-cited reports for every prospect.
              </div>
              <div className="flex flex-col gap-2 mb-7">
                {[
                  "Plain-English recruit search",
                  "Composite rankings",
                  "Evidence-cited evaluations",
                  "Tagged-moment film breakdowns",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[12.5px] text-ink2">
                    <div className="w-1 h-1 rounded-full bg-[#555]" />
                    {f}
                  </div>
                ))}
              </div>
              <div
                className="w-full py-2.5 rounded-[10px] text-[13px] font-bold text-ink flex items-center justify-center gap-2 transition-all group-hover:bg-ink group-hover:text-white"
                style={{
                  border: "1px solid rgba(0,0,0,.15)",
                  background: "var(--bg-4)",
                }}
              >
                Enter Scout Dashboard →
              </div>
            </Link>

            <Link
              href="/athlete/setup"
              className="bg-bg2 rounded-2xl p-7 text-left transition-all hover:-translate-y-1 hover:shadow-soft block group"
              style={{ border: "1px solid var(--border)" }}
            >
              <div
                className="w-[46px] h-[46px] rounded-xl flex items-center justify-center text-xl mb-4"
                style={{
                  background: "var(--bg-3)",
                  border: "1px solid var(--border)",
                }}
              >
                🏀
              </div>
              <div className="text-xl font-extrabold text-ink mb-2">
                I&apos;m an Athlete
              </div>
              <div className="text-[13px] text-ink2 leading-[1.65] mb-5">
                Upload your tape. Get an honest scouting report in minutes —
                six-category grades, comparable archetype, the one thing to
                fix next.
              </div>
              <div className="flex flex-col gap-2 mb-7">
                {[
                  "Personal film evaluation",
                  "Tagged-moment breakdown",
                  "Athlete-facing drill recs",
                  "Discoverable by recruiters",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[12.5px] text-ink2">
                    <div className="w-1 h-1 rounded-full bg-[#555]" />
                    {f}
                  </div>
                ))}
              </div>
              <div
                className="w-full py-2.5 rounded-[10px] text-[13px] font-bold text-ink flex items-center justify-center gap-2 transition-all group-hover:bg-ink group-hover:text-white"
                style={{
                  border: "1px solid rgba(0,0,0,.15)",
                  background: "var(--bg-4)",
                }}
              >
                Upload your tape →
              </div>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
