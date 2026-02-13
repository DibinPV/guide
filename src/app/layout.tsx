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
            <header className="grid gap-6 text-center mb-12">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-primary">
                  Путешествие
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold">
                  Оффлайн путеводитель
                </h1>
                <p className="text-sm mt-2 text-muted">
                  Современный формат тура с маршрутом по дням
                </p>
              </div>
              <TopNav />
            </header>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
