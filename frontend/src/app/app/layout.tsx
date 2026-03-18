import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Atmospheric background layers */}
      <div className="noise-overlay" aria-hidden="true" />
      <div className="perspective-grid" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto px-10 py-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
      <Toaster richColors />
    </>
  );
}
