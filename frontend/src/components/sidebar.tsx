"use client";

import {
  Braces,
  FileText,
  Gem,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/extract", label: "Extract", icon: Sparkles },
  { href: "/app/documents", label: "Documents", icon: FileText },
  { href: "/app/schemas", label: "Schemas", icon: Braces },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[220px] min-h-screen shrink-0 border-r border-sidebar-border bg-sidebar backdrop-blur-xl">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Gem className="size-5 text-primary logo-pulse-continuous" />
          <span className="font-display font-semibold text-sm tracking-tight text-sidebar-foreground">
            docminer
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-3 flex-1 mt-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-pill scan-line-hover flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "nav-pill-active bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary shadow-[inset_2px_0_8px_oklch(0.55_0.25_285/20%)]"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-sidebar-foreground border-l-2 border-transparent"
                }`}
              >
                <Icon
                  className={`size-[18px] shrink-0 ${isActive ? "text-primary" : ""}`}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <div className="h-px bg-sidebar-border mb-2" />
          <Link
            href="/app/settings"
            className="nav-pill flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/[0.04] hover:text-sidebar-foreground"
          >
            <Settings className="size-[18px] shrink-0" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t border-sidebar-border bg-sidebar backdrop-blur-xl px-2 py-2 safe-bottom">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
