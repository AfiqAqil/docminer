"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/extract", label: "Extract" },
  { href: "/documents", label: "Documents" },
  { href: "/schemas", label: "Schemas" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 p-4 border-r w-48 min-h-screen shrink-0">
      <span className="font-semibold text-sm mb-4 px-2">docminer</span>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-2 py-1.5 rounded text-sm transition-colors ${
            pathname === href
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
