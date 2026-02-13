"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Главная" },
  { href: "/tours", label: "Туры" },
  { href: "/places", label: "Локации" },
  { href: "/map", label: "Карта" }
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap justify-center gap-3 text-sm">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
