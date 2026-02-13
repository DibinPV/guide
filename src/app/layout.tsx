import "./globals.css";
import type { Metadata } from "next";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Оффлайн гид",
  description: "Путеводитель с оффлайн доступом"
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
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="min-h-screen py-10">
          <div className="container">
            <header className="grid gap-4 mb-12">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                  Оффлайн путеводитель
                </h1>
                <div className="nav-pill">
                  <TopNav />
                </div>
              </div>
            </header>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
