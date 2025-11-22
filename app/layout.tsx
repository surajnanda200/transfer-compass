import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transfer Compass",
  description: "Transfer application tracker for ambitious students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <header className="p-4 border-b border-neutral-800 flex items-center gap-6">
          <a href="/" className="font-semibold text-lg">
            Transfer Compass
          </a>
          <nav className="flex gap-4 text-sm text-gray-300">
            <a href="/dashboard">Dashboard</a>
            <a href="/colleges">Colleges</a>
            <a href="/deadlines">Deadlines</a>
            <a href="/essays">Essays</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
