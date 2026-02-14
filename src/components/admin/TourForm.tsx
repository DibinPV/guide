"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const travelModes = ["walk", "bus", "car", "metro", "train", "plane"] as const;

const placeSlugHints = [
  "goreme-open-air",
  "uchisar-castle",
  "underground-city-derinkuyu",
  "ihlara-valley",
  "selime-monastery",
  "soganli-valley",
  "dark-church"
];

type Article = {
  id?: string;
  title: string;
  content_md: string;
  images: string | string[];
};

type Event = {
  id?: string;
  type: "excursion" | "travel" | "pause";
  start_time: string;
  duration_minutes: number;
  title: string;
  summary: string;
  place_slug: string;
  from_place_slug: string;
  to_place_slug: string;
  mode: string;
  order_index: number;
  article: Article;
};

type Day = {
  id?: string;
  day_number: number;
  title: string;
  summary: string;
  events: Event[];
};

type TourFormData = {
  tour: {
    slug: string;
    title: string;
    city: string;
    country: string;
    summary: string;
    cover_url: string;
    is_published: boolean;
  };
  days: Day[];
};

const emptyArticle: Article = {
  title: "",
  content_md: "",
  images: ""
};

const emptyEvent: Event = {
  type: "excursion",
  start_time: "09:00",
  duration_minutes: 60,
  title: "",
  summary: "",
  place_slug: "",
  from_place_slug: "",
  to_place_slug: "",
  mode: "walk",
  order_index: 0,
  article: { ...emptyArticle }
};

const emptyTour: TourFormData = {
  tour: {
    slug: "",
    title: "",
    city: "",
    country: "",
    summary: "",
    cover_url: "",
    is_published: true
  },
  days: []
};

type Props = {
  mode: "create" | "edit";
  tourId?: string;
};

function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours <= 0) return `${minutes} мин`;
  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин`;
}

function formatMinutesCompact(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours <= 0) return `${minutes}м`;
  if (minutes === 0) return `${hours}ч`;
  return `${hours}ч${String(minutes).padStart(2, "0")}м`;
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

const ruTranslitMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya"
};

function translitRu(input: string) {
  return input
    .toLowerCase()
    .split("")
    .map((char) => ruTranslitMap[char] ?? char)
    .join("");
}

function slugify(input: string) {
  return translitRu(input)
    .replace(/[ăâ]/g, "a")
    .replace(/[î]/g, "i")
    .replace(/[șş]/g, "s")
    .replace(/[țţ]/g, "t")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function TourForm({ mode, tourId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<TourFormData>(emptyTour);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(mode === "edit");
  const [dirty, setDirty] = useState<boolean>(false);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [previewEvents, setPreviewEvents] = useState<Record<string, boolean>>({});
  const [placeSlugTouched, setPlaceSlugTouched] = useState<Record<string, boolean>>({});
  const [slugTouched, setSlugTouched] = useState<boolean>(false);
  const [slugEditing, setSlugEditing] = useState<boolean>(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [activePanel, setActivePanel] = useState<"settings" | "schedule">("schedule");
  const [openDayMenu, setOpenDayMenu] = useState<number | null>(null);
  const [openEventMenu, setOpenEventMenu] = useState<string | null>(null);
  const [hiddenEvents, setHiddenEvents] = useState<Record<string, boolean>>({});
  const [showHiddenEvents, setShowHiddenEvents] = useState<boolean>(false);
  const [openAddEventMenu, setOpenAddEventMenu] = useState<boolean>(false);
  const eventKey = (dayIndex: number, eventIndex: number) => `d${dayIndex}-e${eventIndex}`;
  const coverUrlValid = !form.tour.cover_url || /^https?:\/\//i.test(form.tour.cover_url);

  useEffect(() => {
    if (mode !== "edit" || !tourId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/tours/${tourId}`);
      if (!res.ok) {
        setStatus("Не удалось загрузить тур.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!active) return;
      const days = (data.days || []).map((day: Day, dayIndex: number) => ({
        ...day,
        id: day.id,
        events: (day.events || []).map((event: Event, eventIndex: number) => ({
          ...emptyEvent,
          ...event,
          id: event.id,
          order_index: event.order_index ?? eventIndex,
          article: {
            ...emptyArticle,
            ...(event.article || {}),
            id: event.article?.id,
            images: Array.isArray(event.article?.images)
              ? event.article.images.join(", ")
              : (event.article?.images ?? "")
          }
        }))
      }));
      setForm({
        tour: {
          slug: data.tour.slug || "",
          title: data.tour.title || "",
          city: data.tour.city || "",
          country: data.tour.country || "",
          summary: data.tour.summary || "",
          cover_url: data.tour.cover_url || "",
          is_published: Boolean(data.tour.is_published)
        },
        days
      });
      const expanded: Record<number, boolean> = {};
      days.forEach((day: Day) => {
        expanded[day.day_number] = day.day_number === 1;
      });
      setExpandedDays(expanded);
      const firstEventKey = days[0]?.events[0] ? eventKey(0, 0) : null;
      setExpandedEvents(firstEventKey ? { [firstEventKey]: true } : {});
      setSelectedDayIndex(0);
      setActivePanel("schedule");
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [mode, tourId]);

  useEffect(() => {
    if (mode !== "create") return;
    if (form.days.length === 0) {
      setForm((prev) => ({
        ...prev,
        days: [
          {
            day_number: 1,
            title: "",
            summary: "",
            events: [
              {
                ...emptyEvent,
                order_index: 0
              }
            ]
          }
        ]
      }));
      setExpandedDays({ 1: true });
      setExpandedEvents({ [eventKey(0, 0)]: true });
      setSelectedDayIndex(0);
      setActivePanel("schedule");
    }
  }, [mode, form.days.length]);

  const markDirty = () => setDirty(true);

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const inlineMd = (value: string) =>
    value
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>");

  const markdownPreview = (value: string) => {
    const safe = escapeHtml(value || "");
    const lines = safe.split("\n");
    let html = "";
    let inList = false;
    lines.forEach((line) => {
      if (/^[-*]\s+/.test(line)) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += `<li>${inlineMd(line.replace(/^[-*]\s+/, ""))}</li>`;
        return;
      }
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      if (/^###\s+/.test(line)) {
        html += `<h4>${inlineMd(line.replace(/^###\s+/, ""))}</h4>`;
        return;
      }
      if (/^##\s+/.test(line)) {
        html += `<h3>${inlineMd(line.replace(/^##\s+/, ""))}</h3>`;
        return;
      }
      if (/^#\s+/.test(line)) {
        html += `<h2>${inlineMd(line.replace(/^#\s+/, ""))}</h2>`;
        return;
      }
      if (line.trim() === "") {
        html += "<br/>";
        return;
      }
      html += `<p>${inlineMd(line)}</p>`;
    });
    if (inList) html += "</ul>";
    return html;
  };

  const updateDay = (index: number, patch: Partial<Day>) => {
    setForm((prev) => {
      const days = [...prev.days];
      days[index] = { ...days[index], ...patch };
      return { ...prev, days };
    });
    markDirty();
  };

  const addDay = () => {
    setForm((prev) => {
      const dayNumber = prev.days.length + 1;
      return {
        ...prev,
        days: [
          ...prev.days,
          {
            day_number: dayNumber,
            title: "",
            summary: "",
            events: [
              {
                ...emptyEvent,
                order_index: 0
              }
            ]
          }
        ]
      };
    });
    setExpandedDays((prev) => ({ ...prev, [form.days.length + 1]: true }));
    markDirty();
  };

  const copyDay = (index: number) => {
    setForm((prev) => {
      const source = prev.days[index];
      const nextNumber = prev.days.length + 1;
      const cloned: Day = {
        ...source,
        id: undefined,
        day_number: nextNumber,
        title: source.title ? `${source.title} (копия)` : "",
        events: source.events.map((event, idx) => ({
          ...event,
          id: undefined,
          order_index: idx,
          article: { ...event.article, id: undefined }
        }))
      };
      return { ...prev, days: [...prev.days, cloned] };
    });
    setExpandedDays((prev) => ({ ...prev, [form.days.length + 1]: true }));
    markDirty();
  };

  const removeDay = (index: number) => {
    setForm((prev) => {
      const days = prev.days.filter((_, i) => i !== index).map((day, i) => ({
        ...day,
        day_number: i + 1
      }));
      return { ...prev, days };
    });
    setSelectedDayIndex((prev) => Math.max(0, Math.min(prev, form.days.length - 2)));
    markDirty();
  };

  const toggleDayActive = (index: number) => {
    setForm((prev) => {
      const days = [...prev.days];
      const day = days[index];
      const isInactive = Boolean((day as Day & { is_inactive?: boolean }).is_inactive);
      days[index] = { ...day, is_inactive: !isInactive } as Day & { is_inactive?: boolean };
      return { ...prev, days };
    });
    markDirty();
  };

  const addEvent = (dayIndex: number) => {
    setForm((prev) => {
      const days = [...prev.days];
      const day = days[dayIndex];
      const events = [...day.events, { ...emptyEvent, order_index: day.events.length }];
      days[dayIndex] = { ...day, events };
      return { ...prev, days };
    });
    setExpandedEvents((prev) => ({ ...prev, [eventKey(dayIndex, form.days[dayIndex]?.events.length || 0)]: true }));
    markDirty();
  };

  const addEventTemplate = (dayIndex: number, template: "excursion" | "travel" | "pause") => {
    const templateEvent: Event =
      template === "travel"
        ? {
            ...emptyEvent,
            type: "travel",
            title: "Переезд",
            summary: "Короткое описание маршрута",
            mode: "walk"
          }
        : template === "pause"
          ? {
              ...emptyEvent,
              type: "pause",
              title: "Перерыв",
              summary: "Свободное время или отдых",
              duration_minutes: 45
            }
          : {
              ...emptyEvent,
              type: "excursion",
              title: "Экскурсия",
              summary: "Короткое описание экскурсии"
            };
    setForm((prev) => {
      const days = [...prev.days];
      const day = days[dayIndex];
      const events = [...day.events, { ...templateEvent, order_index: day.events.length }];
      days[dayIndex] = { ...day, events };
      return { ...prev, days };
    });
    setExpandedEvents((prev) => ({ ...prev, [eventKey(dayIndex, form.days[dayIndex]?.events.length || 0)]: true }));
    markDirty();
  };

  const moveEvent = (dayIndex: number, eventIndex: number, direction: "up" | "down") => {
    setForm((prev) => {
      const days = [...prev.days];
      const day = days[dayIndex];
      const events = [...day.events];
      const targetIndex = direction === "up" ? eventIndex - 1 : eventIndex + 1;
      if (targetIndex < 0 || targetIndex >= events.length) return prev;
      const temp = events[eventIndex];
      events[eventIndex] = events[targetIndex];
      events[targetIndex] = temp;
      const normalized = events.map((event, idx) => ({ ...event, order_index: idx }));
      days[dayIndex] = { ...day, events: normalized };
      return { ...prev, days };
    });
    markDirty();
  };

  const removeEvent = (dayIndex: number, eventIndex: number) => {
    setForm((prev) => {
      const days = [...prev.days];
      const day = days[dayIndex];
      const events = day.events
        .filter((_, i) => i !== eventIndex)
        .map((event, i) => ({ ...event, order_index: i }));
      days[dayIndex] = { ...day, events };
      return { ...prev, days };
    });
    markDirty();
  };

  const copyEvent = (dayIndex: number, eventIndex: number) => {
    setForm((prev) => {
      const days = [...prev.days];
      const day = days[dayIndex];
      const events = [...day.events];
      const source = events[eventIndex];
      const clone: Event = {
        ...source,
        id: undefined,
        article: source.article ? { ...source.article, id: undefined } : source.article
      };
      events.splice(eventIndex + 1, 0, { ...clone, order_index: eventIndex + 1 });
      const normalized = events.map((event, idx) => ({ ...event, order_index: idx }));
      days[dayIndex] = { ...day, events: normalized };
      return { ...prev, days };
    });
    markDirty();
  };

  const toggleEventHidden = (dayIndex: number, eventIndex: number) => {
    const key = eventKey(dayIndex, eventIndex);
    setHiddenEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateEvent = (dayIndex: number, eventIndex: number, patch: Partial<Event>) => {
    setForm((prev) => {
      const days = [...prev.days];
      const day = days[dayIndex];
      const events = [...day.events];
      events[eventIndex] = { ...events[eventIndex], ...patch };
      days[dayIndex] = { ...day, events };
      return { ...prev, days };
    });
    markDirty();
  };

  const updateArticle = (dayIndex: number, eventIndex: number, patch: Partial<Article>) => {
    setForm((prev) => {
      const days = [...prev.days];
      const day = days[dayIndex];
      const events = [...day.events];
      const current = events[eventIndex];
      events[eventIndex] = { ...current, article: { ...current.article, ...patch } };
      days[dayIndex] = { ...day, events };
      return { ...prev, days };
    });
    markDirty();
  };

  const normalizeImages = (value: string | string[]) =>
    Array.isArray(value)
      ? value.map((item) => item.trim()).filter(Boolean)
      : value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

  const addImageChip = (dayIndex: number, eventIndex: number, url: string) => {
    if (!url.trim()) return;
    const current = normalizeImages(form.days[dayIndex]?.events[eventIndex]?.article?.images || []);
    const next = [...current, url.trim()];
    updateArticle(dayIndex, eventIndex, { images: next });
  };

  const removeImageChip = (dayIndex: number, eventIndex: number, url: string) => {
    const current = normalizeImages(form.days[dayIndex]?.events[eventIndex]?.article?.images || []);
    const next = current.filter((item) => item !== url);
    updateArticle(dayIndex, eventIndex, { images: next });
  };

  const toggleEvent = (dayIndex: number, eventIndex: number) => {
    const key = eventKey(dayIndex, eventIndex);
    setExpandedEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePreview = (dayIndex: number, eventIndex: number) => {
    const key = eventKey(dayIndex, eventIndex);
    setPreviewEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sortEventsByTime = (dayIndex: number) => {
    setForm((prev) => {
      const days = [...prev.days];
      const day = days[dayIndex];
      const events = [...day.events].sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
      const normalized = events.map((event, idx) => ({ ...event, order_index: idx }));
      days[dayIndex] = { ...day, events: normalized };
      return { ...prev, days };
    });
    markDirty();
  };

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNumber]: !prev[dayNumber] }));
  };

  const expandAll = () => {
    const expanded: Record<number, boolean> = {};
    form.days.forEach((day) => {
      expanded[day.day_number] = true;
    });
    setExpandedDays(expanded);
  };

  const collapseAll = () => {
    const collapsed: Record<number, boolean> = {};
    form.days.forEach((day) => {
      collapsed[day.day_number] = false;
    });
    setExpandedDays(collapsed);
  };

  const hasOverlap = (events: Event[], index: number) => {
    const current = events[index];
    const start = timeToMinutes(current.start_time);
    const end = start + current.duration_minutes;
    return events.some((event, idx) => {
      if (idx === index) return false;
      const s = timeToMinutes(event.start_time);
      const e = s + event.duration_minutes;
      return start < e && end > s;
    });
  };

  const onSubmit = async () => {
    if (!form.tour.slug || !form.tour.title) {
      setStatus("Заполните slug и title.");
      return;
    }
    if (form.days.length === 0) {
      setStatus("Добавьте хотя бы один день.");
      return;
    }

    const payload = {
      tour: { ...form.tour, slug: slugify(form.tour.slug || form.tour.title) },
      days: form.days.map((day, dayIndex) => ({
        id: day.id,
        day_number: day.day_number,
        title: day.title,
        summary: day.summary,
        events: day.events.map((event, eventIndex) => {
          const key = eventKey(dayIndex, eventIndex);
          const placeSlug =
            event.type === "excursion"
              ? (placeSlugTouched[key] ? event.place_slug : slugify(event.place_slug || event.title))
              : event.place_slug;
          return ({
          id: event.id,
          type: event.type,
          start_time: event.start_time,
          duration_minutes: event.duration_minutes,
          title: event.title,
          summary: event.summary,
          place_slug: placeSlug,
          from_place_slug: event.from_place_slug,
          to_place_slug: event.to_place_slug,
          mode: event.mode,
          order_index: event.order_index,
          article: {
            id: event.article.id,
            title: event.article.title,
            content_md: event.article.content_md,
            images: Array.isArray(event.article.images)
              ? event.article.images
              : event.article.images
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
          }
        });
        })
      }))
    };

    setStatus("Сохраняем...");
    const res = await fetch(
      mode === "create" ? "/api/admin/tours" : `/api/admin/tours/${tourId}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const raw = await res.text();
    const data = raw ? JSON.parse(raw) : {};
    if (!res.ok) {
      setStatus(data.error || "Ошибка сохранения.");
      return;
    }
    setStatus("Сохранено.");
    setDirty(false);
    if (mode === "create" && data.id) {
      router.push(`/admin/tours/${data.id}`);
      router.refresh();
    }
  };

  const onDelete = async () => {
    if (mode !== "edit" || !tourId) return;
    if (!confirm("Удалить тур полностью?")) return;
    setStatus("Удаляем...");
    const res = await fetch(`/api/admin/tours/${tourId}`, { method: "DELETE" });
    const raw = await res.text();
    const data = raw ? JSON.parse(raw) : {};
    if (!res.ok) {
      setStatus(data.error || "Ошибка удаления.");
      return;
    }
    router.push("/admin/tours");
    router.refresh();
  };

  const daySummaries = useMemo(() => {
    return form.days.map((day) => {
      const totalMinutes = day.events.reduce((sum, event) => sum + event.duration_minutes, 0);
      return {
        day_number: day.day_number,
        events: day.events.length,
        duration: formatMinutes(totalMinutes)
      };
    });
  }, [form.days]);

  const overallSummary = useMemo(() => {
    const totalEvents = form.days.reduce((sum, day) => sum + day.events.length, 0);
    const totalMinutes = form.days.reduce(
      (sum, day) => sum + day.events.reduce((inner, event) => inner + event.duration_minutes, 0),
      0
    );
    return {
      days: form.days.length,
      events: totalEvents,
      duration: formatMinutesCompact(totalMinutes)
    };
  }, [form.days]);

  if (loading) {
    return (
      <div className="card">
        <p className="text-sm text-muted">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="card admin-nav-card">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Навигация</p>
          <div className="admin-steps">
            <button
              type="button"
              className={`admin-step ${activePanel === "settings" ? "active" : ""}`}
              onClick={() => setActivePanel("settings")}
            >
              Настройки тура
            </button>
            <button
              type="button"
              className={`admin-step ${activePanel === "schedule" ? "active" : ""}`}
              onClick={() => setActivePanel("schedule")}
            >
              Дни и события
            </button>
          </div>
          <button type="button" className="button-ghost admin-add-day" onClick={addDay}>
            + Добавить день
          </button>
          {activePanel === "schedule" ? (
            <div className="admin-nav-days">
              {form.days.length === 0 ? (
                <div className="admin-empty">
                  <p className="text-sm text-muted">Дней пока нет.</p>
                  <button type="button" className="button-primary" onClick={addDay}>
                    Создать день
                  </button>
                </div>
              ) : null}
              {form.days.map((day, dayIndex) => (
                <div key={`nav-${day.day_number}`} className={`admin-nav-day ${dayIndex === selectedDayIndex ? "active" : ""}`}>
                  <div className="admin-nav-day-row">
                    <button
                      type="button"
                      className="admin-nav-day-title"
                      onClick={() => setSelectedDayIndex(dayIndex)}
                    >
                      День {day.day_number}
                    </button>
                    <div className="admin-day-menu">
                      <button
                        type="button"
                        className="admin-day-menu-trigger"
                        onClick={() => setOpenDayMenu((prev) => (prev === dayIndex ? null : dayIndex))}
                        aria-label="Меню дня"
                      >
                        ⋯
                      </button>
                      {openDayMenu === dayIndex ? (
                        <div className="admin-day-menu-panel">
                          <button type="button" onClick={() => { copyDay(dayIndex); setOpenDayMenu(null); }}>
                            Копировать день
                          </button>
                          <button type="button" onClick={() => { toggleDayActive(dayIndex); setOpenDayMenu(null); }}>
                            Сделать неактивным
                          </button>
                          <button type="button" onClick={() => { removeDay(dayIndex); setOpenDayMenu(null); }}>
                            Удалить день
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {dayIndex === selectedDayIndex ? (
                    <div className="admin-nav-events">
                      {day.events.map((event, eventIndex) => (
                        <a
                          key={`nav-${day.day_number}-${eventIndex}`}
                          href={`#day-${day.day_number}-event-${eventIndex}`}
                          className={`admin-nav-event ${event.type}`}
                        >
                          {event.start_time} · {event.title || "Без названия"}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          <div className="admin-side-actions">
            <div className="admin-side-stats-line">
              Дни {overallSummary.days} · Событ. {overallSummary.events} · Длит. {overallSummary.duration}
            </div>
            <div className="text-xs text-soft">
              {dirty ? "Есть несохраненные изменения" : "Все изменения сохранены"}
            </div>
            <div className="admin-side-buttons">
              <button type="button" className="button-primary" onClick={onSubmit}>
                Сохранить
              </button>
              {mode === "edit" ? (
                <button type="button" className="button-ghost" onClick={onDelete}>
                  Удалить
                </button>
              ) : null}
            </div>
            <span className="text-xs text-soft">{status}</span>
          </div>
        </div>
      </aside>

      <div className="admin-content grid gap-6">
      {activePanel === "settings" ? (
        <div className="card admin-section">
          <div className="admin-settings-group">
            <div className="admin-settings-header">
              <h3 className="text-h3">Основное</h3>
              <p className="text-sm text-soft">Главные поля, которые формируют карточку тура.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                Название тура <span className="text-warn">*</span>
                <input
                  className={`input ${form.tour.title ? "" : "border-red-300"}`}
                  value={form.tour.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      tour: {
                        ...prev.tour,
                        title,
                        slug: slugTouched ? prev.tour.slug : slugify(title)
                      }
                    }));
                    markDirty();
                  }}
                  placeholder="Каппадокия: христианские святыни"
                />
                {!form.tour.title ? (
                  <span className="text-xs text-warn">Название обязательно.</span>
                ) : null}
              </label>
              <div className="admin-slug-inline md:col-span-2">
                <p className="text-xs text-soft">Ссылка тура</p>
                {!slugEditing ? (
                  <button
                    type="button"
                    className="admin-slug-button"
                    onClick={() => {
                      setSlugTouched(true);
                      setSlugEditing(true);
                    }}
                  >
                    /tours/{form.tour.slug || "ваш-slug"}
                    <span className="admin-slug-edit">Редактировать</span>
                  </button>
                ) : (
                  <div className="admin-slug-edit-row">
                    <input
                      className={`input ${form.tour.slug ? "" : "border-red-300"}`}
                      value={form.tour.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setForm((prev) => ({ ...prev, tour: { ...prev.tour, slug: e.target.value } }));
                        markDirty();
                      }}
                      placeholder="например: cappadocia-heritage"
                    />
                    <button type="button" className="button-ghost" onClick={() => setSlugEditing(false)}>
                      Готово
                    </button>
                  </div>
                )}
                {!form.tour.slug ? (
                  <span className="text-xs text-warn">Slug обязателен.</span>
                ) : null}
              </div>
              <label className="grid gap-2 text-sm">
                Город
                <input
                  className="input"
                  value={form.tour.city}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, tour: { ...prev.tour, city: e.target.value } }));
                    markDirty();
                  }}
                  placeholder="Стамбул"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Страна
                <input
                  className="input"
                  value={form.tour.country}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, tour: { ...prev.tour, country: e.target.value } }));
                    markDirty();
                  }}
                  placeholder="Турция"
                />
              </label>
            </div>
          </div>

          <div className="admin-settings-group">
            <div className="admin-settings-header">
              <h3 className="text-h3">Описание</h3>
              <p className="text-sm text-soft">Короткий текст, который увидит пользователь.</p>
            </div>
            <label className="grid gap-2 text-sm">
              Краткое описание
              <textarea
                className="input"
                rows={3}
                value={form.tour.summary}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, tour: { ...prev.tour, summary: e.target.value } }));
                  markDirty();
                }}
                placeholder="Напишите, что будет в туре и чем он полезен."
              />
            </label>
          </div>

          <div className="admin-settings-group">
            <div className="admin-settings-header">
              <h3 className="text-h3">Обложка</h3>
              <p className="text-sm text-soft">Картинка для карточек и заголовка тура.</p>
            </div>
            <div className="admin-cover-row">
              <label className="grid gap-2 text-sm admin-cover-field">
                URL обложки
                <input
                  className={`input ${coverUrlValid ? "" : "border-red-300"}`}
                  value={form.tour.cover_url}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, tour: { ...prev.tour, cover_url: e.target.value } }));
                    markDirty();
                  }}
                  placeholder="https://example.com/cover.jpg"
                />
                <span className="text-xs text-soft">Рекомендуем формат 1200×800 или больше.</span>
                {!coverUrlValid ? (
                  <span className="text-xs text-warn">URL должен начинаться с http:// или https://</span>
                ) : null}
              </label>
              <div className="admin-cover-preview">
                {form.tour.cover_url ? (
                  <img src={form.tour.cover_url} alt="Обложка тура" loading="lazy" />
                ) : (
                  <div className="text-xs text-soft">Нет изображения</div>
                )}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.tour.is_published}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, tour: { ...prev.tour, is_published: e.target.checked } }));
                markDirty();
              }}
            />
            Опубликован
          </label>
        </div>
      ) : null}

      {activePanel === "schedule" ? (
      <div className="admin-schedule-panel">
        <div className="grid gap-4">
          {form.days[selectedDayIndex] ? (() => {
            const day = form.days[selectedDayIndex];
            const dayIndex = selectedDayIndex;
            const summary = daySummaries[dayIndex];
            const isOpen = expandedDays[day.day_number] ?? true;
            const hiddenCount = day.events.reduce((count, _, idx) => {
              const key = eventKey(dayIndex, idx);
              return hiddenEvents[key] ? count + 1 : count;
            }, 0);
            const eventEntries = day.events
              .map((event, idx) => ({ event, idx }))
              .filter(({ idx }) => showHiddenEvents || !hiddenEvents[eventKey(dayIndex, idx)]);
            return (
              <div key={`day-${dayIndex}`} className="grid gap-4">
                <div id={`day-${day.day_number}`} className="card border-neutral admin-day-settings">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between"
                    onClick={() => toggleDay(day.day_number)}
                  >
                    <div className="text-left">
                      <p className="text-xs uppercase tracking-[0.2em] text-primary">День {day.day_number}</p>
                      <h4 className="mt-1 text-h3">{day.title || "Без названия"}</h4>
                      <p className="text-sm text-soft mt-1">Событий: {summary.events} · {summary.duration}</p>
                    </div>
                    <span className="text-sm text-soft">{isOpen ? "Свернуть" : "Развернуть"}</span>
                  </button>

                  {isOpen ? (
                    <div className="mt-6">
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="grid gap-2 text-sm">
                          День
                          <input
                            className="input"
                            type="number"
                            min={1}
                            value={day.day_number}
                            onChange={(e) => updateDay(dayIndex, { day_number: Number(e.target.value) })}
                          />
                        </label>
                        <label className="grid gap-2 text-sm md:col-span-2">
                          Заголовок дня
                          <input
                            className="input"
                            value={day.title}
                            onChange={(e) => updateDay(dayIndex, { title: e.target.value })}
                          />
                        </label>
                        <label className="grid gap-2 text-sm md:col-span-3">
                          Краткое описание
                          <textarea
                            className="input"
                            rows={2}
                            value={day.summary}
                            onChange={(e) => updateDay(dayIndex, { summary: e.target.value })}
                          />
                        </label>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="admin-events-section">
                    <div className="mt-6 grid gap-4">
                      {eventEntries.map(({ event, idx: eventIndex }) => {
                        const menuKey = eventKey(dayIndex, eventIndex);
                        const isMenuOpen = openEventMenu === menuKey;
                        return (
                        <div
                          key={`event-${eventIndex}`}
                          id={`day-${day.day_number}-event-${eventIndex}`}
                            className={`card-compact border-neutral admin-event-card ${hasOverlap(day.events, eventIndex) ? "border-red-300" : ""} ${isMenuOpen ? "menu-open" : ""}`}
                          >
                          <div className={`admin-event-header ${event.type}`}>
                            <button
                              type="button"
                              className="admin-event-toggle"
                              onClick={() => toggleEvent(dayIndex, eventIndex)}
                            >
                              <div className="admin-event-meta">
                                <span className={`event-badge ${event.type}`}>
                                  {event.type === "excursion" ? "Экскурсия" : event.type === "travel" ? "Переезд" : "Перерыв"}
                                </span>
                                <div className="admin-event-text">
                                  <span className="admin-event-title">{event.title || "Без названия"}</span>
                                  <span className="admin-event-time">
                                    <span>{event.start_time}</span>
                                    <span>·</span>
                                    <span>{formatMinutes(event.duration_minutes)}</span>
                                  </span>
                                </div>
                              </div>
                            </button>
                            <div className="admin-event-status">
                              {!event.summary ? <span className="status-pill warn">нет описания</span> : null}
                              {!event.article?.content_md ? <span className="status-pill warn">нет статьи</span> : null}
                              {!event.article?.images ? <span className="status-pill warn">нет фото</span> : null}
                              <button
                                type="button"
                                className="admin-event-menu-trigger"
                                onClick={() => {
                                  setOpenEventMenu((prev) => (prev === menuKey ? null : menuKey));
                                }}
                                aria-label="Меню события"
                              >
                                ⋯
                              </button>
                              <button
                                type="button"
                                className="admin-event-chevron"
                                onClick={() => toggleEvent(dayIndex, eventIndex)}
                                aria-label="Развернуть"
                              >
                                {expandedEvents[eventKey(dayIndex, eventIndex)] ? "▾" : "▸"}
                              </button>
                              {isMenuOpen ? (
                                <div className="admin-event-menu-panel">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      copyEvent(dayIndex, eventIndex);
                                      setOpenEventMenu(null);
                                    }}
                                  >
                                    Копировать
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      toggleEventHidden(dayIndex, eventIndex);
                                      setOpenEventMenu(null);
                                    }}
                                  >
                                    {hiddenEvents[eventKey(dayIndex, eventIndex)] ? "Показать" : "Скрыть"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      removeEvent(dayIndex, eventIndex);
                                      setOpenEventMenu(null);
                                    }}
                                  >
                                    Удалить
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {expandedEvents[eventKey(dayIndex, eventIndex)] ? (
                            <>
                              <div className="admin-event-body">
                                <div className="grid gap-3 md:grid-cols-3 flex-1">
                                  <label className="grid gap-2 text-sm">
                                    Тип события
                                    <select
                                      className="input"
                                      value={event.type}
                                      onChange={(e) => updateEvent(dayIndex, eventIndex, { type: e.target.value as Event["type"] })}
                                    >
                                      <option value="excursion">Экскурсия</option>
                                      <option value="travel">Переезд</option>
                                      <option value="pause">Перерыв</option>
                                    </select>
                                  </label>
                                  <label className="grid gap-2 text-sm">
                                    Начало
                                    <input
                                      className="input"
                                      type="time"
                                      value={event.start_time}
                                      onChange={(e) => updateEvent(dayIndex, eventIndex, { start_time: e.target.value })}
                                    />
                                  </label>
                                  <label className="grid gap-2 text-sm">
                                    Длительность (мин)
                                    <input
                                      className="input"
                                      type="number"
                                      min={5}
                                      value={event.duration_minutes}
                                      onChange={(e) => updateEvent(dayIndex, eventIndex, { duration_minutes: Number(e.target.value) })}
                                    />
                                  </label>
                                  <label className="grid gap-2 text-sm md:col-span-3">
                                    Заголовок
                                    <input
                                      className="input"
                                      value={event.title}
                                      onChange={(e) => {
                                        const title = e.target.value;
                                        const key = eventKey(dayIndex, eventIndex);
                                        updateEvent(dayIndex, eventIndex, {
                                          title,
                                          place_slug:
                                            event.type === "excursion" && !placeSlugTouched[key]
                                              ? slugify(title)
                                              : event.place_slug
                                        });
                                      }}
                                    />
                                  </label>
                                  <label className="grid gap-2 text-sm md:col-span-3">
                                    Короткое описание
                                    <textarea
                                      className="input"
                                      rows={2}
                                      value={event.summary}
                                      onChange={(e) => updateEvent(dayIndex, eventIndex, { summary: e.target.value })}
                                    />
                                  </label>
                                </div>
                              </div>

                              {hasOverlap(day.events, eventIndex) ? (
                                <p className="text-xs text-red-600 mt-2">Время пересекается с другим событием.</p>
                              ) : null}

                              {event.type === "excursion" ? (
                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                  <label className="grid gap-2 text-sm md:col-span-2">
                                    Place slug
                                    <input
                                      className={`input ${event.place_slug ? "" : "border-red-300"}`}
                                      list="place-slugs"
                                      value={event.place_slug}
                                      onChange={(e) => {
                                        const key = eventKey(dayIndex, eventIndex);
                                        setPlaceSlugTouched((prev) => ({ ...prev, [key]: true }));
                                        updateEvent(dayIndex, eventIndex, { place_slug: e.target.value });
                                      }}
                                      placeholder="goreme-open-air"
                                    />
                                  </label>
                                </div>
                              ) : (
                                <div className="mt-4 text-sm text-soft">Place slug доступен только для экскурсии.</div>
                              )}
                              {event.type === "travel" ? (
                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                  <label className="grid gap-2 text-sm">
                                    Откуда (slug)
                                    <input
                                      className="input"
                                      list="place-slugs"
                                      value={event.from_place_slug}
                                      onChange={(e) => updateEvent(dayIndex, eventIndex, { from_place_slug: e.target.value })}
                                    />
                                  </label>
                                  <label className="grid gap-2 text-sm">
                                    Куда (slug)
                                    <input
                                      className="input"
                                      list="place-slugs"
                                      value={event.to_place_slug}
                                      onChange={(e) => updateEvent(dayIndex, eventIndex, { to_place_slug: e.target.value })}
                                    />
                                  </label>
                                  <label className="grid gap-2 text-sm">
                                    Транспорт
                                    <select
                                      className="input"
                                      value={event.mode}
                                      onChange={(e) => updateEvent(dayIndex, eventIndex, { mode: e.target.value })}
                                    >
                                      {travelModes.map((mode) => (
                                        <option key={mode} value={mode}>
                                          {mode}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                </div>
                              ) : null}

                              <div className="mt-4 card-compact border-neutral admin-article-card">
                                <div className="admin-article-header">
                                  <p className="text-xs uppercase tracking-[0.2em] text-primary">Статья</p>
                                  <button
                                    type="button"
                                    className="button-ghost"
                                    onClick={() => togglePreview(dayIndex, eventIndex)}
                                  >
                                    {previewEvents[eventKey(dayIndex, eventIndex)] ? "Скрыть предпросмотр" : "Предпросмотр"}
                                  </button>
                                </div>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                  <label className="grid gap-2 text-sm md:col-span-2">
                                    Заголовок статьи
                                    <input
                                      className="input"
                                      value={event.article.title}
                                      onChange={(e) => updateArticle(dayIndex, eventIndex, { title: e.target.value })}
                                    />
                                  </label>
                                  <label className="grid gap-2 text-sm md:col-span-2">
                                    Текст статьи (Markdown)
                                    <textarea
                                      className="input font-mono text-xs"
                                      rows={6}
                                      value={event.article.content_md}
                                      onChange={(e) => updateArticle(dayIndex, eventIndex, { content_md: e.target.value })}
                                    />
                                  </label>
                                  <div className="grid gap-2 text-sm md:col-span-2">
                                    Картинки
                                    <input
                                      className="input"
                                      placeholder="Вставьте URL и нажмите Enter"
                                      onKeyDown={(e) => {
                                        if (e.key !== "Enter") return;
                                        e.preventDefault();
                                        const input = e.currentTarget;
                                        addImageChip(dayIndex, eventIndex, input.value);
                                        input.value = "";
                                      }}
                                    />
                                    <div className="admin-image-chips">
                                      {normalizeImages(event.article.images || []).map((url) => (
                                        <button
                                          key={url}
                                          type="button"
                                          className="admin-image-chip"
                                          onClick={() => removeImageChip(dayIndex, eventIndex, url)}
                                          title="Удалить"
                                        >
                                          {url.replace(/^https?:\/\//, "")}
                                          <span>×</span>
                                        </button>
                                      ))}
                                      {normalizeImages(event.article.images || []).length === 0 ? (
                                        <span className="text-xs text-soft">Пока нет изображений.</span>
                                      ) : null}
                                    </div>
                                    <div className="admin-image-previews">
                                      {normalizeImages(event.article.images || []).map((url) => (
                                        <div key={`${url}-preview`} className="admin-image-preview">
                                          <img src={url} alt="preview" loading="lazy" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {previewEvents[eventKey(dayIndex, eventIndex)] ? (
                                  <div className="admin-preview">
                                    {event.article.content_md ? (
                                      <div
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: markdownPreview(event.article.content_md) }}
                                      />
                                    ) : (
                                      <p className="text-sm text-muted">Нет текста для предпросмотра.</p>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </>
                          ) : null}
                        </div>
                      )})}
                    </div>
                    <div className="admin-events-footer">
                      <div className="admin-event-add">
                        <button
                          type="button"
                          className="button-ghost"
                          onClick={() => setOpenAddEventMenu((prev) => !prev)}
                        >
                          + Добавить событие
                        </button>
                        {openAddEventMenu ? (
                          <div className="admin-event-menu-panel admin-event-add-panel">
                            <button type="button" onClick={() => { addEventTemplate(dayIndex, "excursion"); setOpenAddEventMenu(false); }}>
                              Экскурсия
                            </button>
                            <button type="button" onClick={() => { addEventTemplate(dayIndex, "travel"); setOpenAddEventMenu(false); }}>
                              Переезд
                            </button>
                            <button type="button" onClick={() => { addEventTemplate(dayIndex, "pause"); setOpenAddEventMenu(false); }}>
                              Перерыв
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <div className="admin-event-footer-actions">
                        {hiddenCount > 0 ? (
                          <button
                            type="button"
                            className="button-ghost"
                            onClick={() => setShowHiddenEvents((prev) => !prev)}
                          >
                            {showHiddenEvents ? "Скрыть скрытые" : `Показать скрытые (${hiddenCount})`}
                          </button>
                        ) : null}
                        <button type="button" className="button-ghost" onClick={() => sortEventsByTime(dayIndex)}>
                          Отсортировать по времени
                        </button>
                      </div>
                    </div>
                </div>
              </div>
            );
          })() : (
            <div className="card">
              <p className="text-sm text-muted">Добавьте день, чтобы начать.</p>
            </div>
          )}
        </div>
      </div>
      ) : null}

      <datalist id="place-slugs">
        {placeSlugHints.map((slug) => (
          <option key={slug} value={slug} />
        ))}
      </datalist>

    </div>
    </div>
  );
}
