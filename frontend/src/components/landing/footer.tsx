export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-10 px-6 md:px-10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-sm font-semibold tracking-tight text-foreground/70">
            docminer
          </span>
          <span className="h-3 w-px bg-white/[0.08]" />
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground/30">
            Schema-driven extraction
          </span>
        </div>
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground/25">
          Docling + litellm
        </p>
      </div>
    </footer>
  );
}
