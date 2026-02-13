"use client";

import { useEffect, useMemo, useState } from "react";

type DayLink = {
  id: string;
  day_number: number;
  title: string;
};

type Props = {
  days: DayLink[];
  firstDayHref?: string;
};

export default function TourAside({ days, firstDayHref }: Props) {
  const [activeDay, setActiveDay] = useState<number | null>(days[0]?.day_number ?? null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  useEffect(() => {
    if (!days.length) return;
    const targets = days
      .map((day) => document.getElementById(`day-${day.day_number}`))
      .filter(Boolean) as HTMLElement[];

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.id;
          const match = id.match(/day-(\d+)/);
          if (match) setActiveDay(Number(match[1]));
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0.25, 0.5, 0.75] }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [days]);

  const onInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const items = useMemo(() => days, [days]);

  return (
    <div className="card">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">Навигация</p>
      <div className="tour-progress mt-4">
        {items.map((day) => {
          const isActive = activeDay === day.day_number;
          return (
            <a
              key={day.id}
              href={`#day-${day.day_number}`}
              className={`tour-progress-item ${isActive ? "active" : ""}`}
            >
              <span className="tour-progress-dot" />
              День {day.day_number}
            </a>
          );
        })}
      </div>
      <div className="mt-6 grid gap-2">
        {firstDayHref ? (
          <a href={firstDayHref} className="tour-cta">
            Начать с дня 1
          </a>
        ) : null}
        {installPrompt ? (
          <button type="button" className="tour-cta-secondary" onClick={onInstall}>
            Скачать оффлайн
          </button>
        ) : null}
      </div>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
