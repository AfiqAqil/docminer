import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "docminer",
  description: "Schema-driven document extraction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/* Atmospheric background layers */}
        <div className="noise-overlay" aria-hidden="true" />
        <div className="atmo-glow" aria-hidden="true" />

        <div className="relative z-10 flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto px-10 py-8 pb-24 lg:pb-8">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
        <Toaster richColors />
      </body>
    </html>
  );
}
