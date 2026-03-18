import { Gem } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Gem className="size-4 text-primary" />
          <span className="font-display font-medium text-foreground">
            docminer
          </span>
        </div>
        <p>Built with Docling + LLMs</p>
      </div>
    </footer>
  );
}
