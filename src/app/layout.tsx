import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide Offline",
  description: "Offline-friendly travel guide"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="min-h-screen px-6 py-8 md:px-12">
          <header className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-moss">Guide</p>
              <h1 className="text-3xl md:text-4xl font-semibold font-display">Offline Travel Companion</h1>
            </div>
            <nav className="flex gap-4 text-sm">
              <a className="px-3 py-2 rounded-full bg-white/60 border border-black/10" href="/">
                Home
              </a>
              <a className="px-3 py-2 rounded-full bg-white/60 border border-black/10" href="/map">
                Map
              </a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
