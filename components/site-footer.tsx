export function SiteFooter() {
  return (
    <footer
      className="border-t flex items-center justify-between px-8 py-6 text-[12px] text-ink3"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      <div className="text-[15px] font-black text-ink" style={{ letterSpacing: "-1px" }}>
        Sideline
      </div>
      <div>© 2026 Sideline. Built for the next generation of basketball.</div>
      <div className="flex gap-5">
        <a href="#" className="text-ink3 hover:text-ink2 no-underline">
          Privacy
        </a>
        <a href="#" className="text-ink3 hover:text-ink2 no-underline">
          Terms
        </a>
        <a href="#" className="text-ink3 hover:text-ink2 no-underline">
          Contact
        </a>
      </div>
    </footer>
  );
}
