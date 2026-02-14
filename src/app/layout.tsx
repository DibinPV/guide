import "./globals.css";
import type { Metadata } from "next";
import HeaderShell from "@/components/HeaderShell";

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
            <HeaderShell />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
