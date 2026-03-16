import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Building2 } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SiteFlow",
  description: "Job management for fit-out contractors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-slate-700" />
                <span className="text-xl font-bold tracking-tight text-slate-800">
                  SiteFlow
                </span>
              </Link>

              <nav className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/"
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/subbies"
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Subbies
                </Link>
                <Link
                  href="/settings"
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <Toaster />
      </body>
    </html>
  );
}
