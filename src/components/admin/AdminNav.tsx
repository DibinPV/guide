"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/tours", label: "Туры" }
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} className={isActive ? "active" : ""}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
