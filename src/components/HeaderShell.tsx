"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TopNav from "@/components/TopNav";

export default function HeaderShell() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return (
    <header className="grid gap-4 mb-12">
      <div className="flex items-center justify-between">
        <Link href="/" className={`brand ${isAdmin ? "admin-brand" : ""}`}>
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="img">
              <defs>
                <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5f7763" />
                  <stop offset="100%" stopColor="#2f5e50" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="22" fill="none" stroke="url(#brandGradient)" strokeWidth="2.6" />
              <path
                d="M24 10c-4 0-7.2 3.2-7.2 7.2 0 5.2 7.2 15.6 7.2 15.6s7.2-10.4 7.2-15.6C31.2 13.2 28 10 24 10z"
                fill="url(#brandGradient)"
              />
              <circle cx="24" cy="17.2" r="3.4" fill="#f7f2ee" />
              <path
                d="M12 34c4.2-3 8.8-4.6 12-4.6S31.8 31 36 34"
                fill="none"
                stroke="#1f3d34"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="brand-text">Маршруты</span>
        </Link>
        {isAdmin ? null : (
          <div className="nav-pill">
            <TopNav />
          </div>
        )}
      </div>
    </header>
  );
}
