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
import { Separator } from "@/components/ui/separator";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/extract", label: "Extract", icon: Sparkles },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/schemas", label: "Schemas", icon: Braces },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[200px] min-h-screen shrink-0 bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-4 py-4">
        <Gem className="size-5 text-primary" />
        <span className="font-semibold text-sm text-sidebar-foreground">
          docminer
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-2 flex-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="size-[18px] shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-4">
        <Separator className="mb-2" />
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-white/5 hover:text-sidebar-foreground transition-colors"
        >
          <Settings className="size-[18px] shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
