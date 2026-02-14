"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/", label: "Главная" },
  { href: "/tours", label: "Туры" },
  { href: "/places", label: "Локации" },
  { href: "/map", label: "Карта" },
  { href: "/feedback-stats", label: "Статистика" }
];

export default function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="top-nav">
      {open ? <div className="nav-backdrop" onClick={() => setOpen(false)} /> : null}
      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="top-nav-list"
        onClick={() => setOpen((prev) => !prev)}
      >
        Меню
      </button>
      <div id="top-nav-list" className={`nav-list ${open ? "open" : ""}`}>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
