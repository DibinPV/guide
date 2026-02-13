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
  type: "excursion" | "travel";
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

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function slugify(input: string) {
  return input
    .toLowerCase()
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
  const [slugTouched, setSlugTouched] = useState<boolean>(false);

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
    }
  }, [mode, form.days.length]);

  const markDirty = () => setDirty(true);

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
      tour: { ...form.tour, slug: form.tour.slug.trim().toLowerCase().replace(/\s+/g, "-") },
      days: form.days.map((day) => ({
        id: day.id,
        day_number: day.day_number,
        title: day.title,
        summary: day.summary,
        events: day.events.map((event) => ({
          id: event.id,
          type: event.type,
          start_time: event.start_time,
          duration_minutes: event.duration_minutes,
          title: event.title,
          summary: event.summary,
          place_slug: event.place_slug,
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
        }))
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
    const data = await res.json();
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
    const data = await res.json();
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
      duration: formatMinutes(totalMinutes)
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
    <div className="grid gap-6">
      <div className="card sticky top-4 z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-soft">
            {dirty ? "Есть несохраненные изменения" : "Все изменения сохранены"}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="button-primary" onClick={onSubmit}>
              Сохранить
            </button>
            {mode === "edit" ? (
              <button type="button" className="button-ghost" onClick={onDelete}>
                Удалить
              </button>
            ) : null}
            <span className="text-sm text-soft">{status}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            Ссылка (slug)
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
            <span className="text-xs text-soft">Используется в ссылке: /tours/ваш-slug</span>
          </label>
          <label className="grid gap-2 text-sm">
            Title
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
          </label>
          <label className="grid gap-2 text-sm">
            City
            <input
              className="input"
              value={form.tour.city}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, tour: { ...prev.tour, city: e.target.value } }));
                markDirty();
              }}
            />
          </label>
          <label className="grid gap-2 text-sm">
            Country
            <input
              className="input"
              value={form.tour.country}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, tour: { ...prev.tour, country: e.target.value } }));
                markDirty();
              }}
            />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            Summary
            <textarea
              className="input"
              rows={3}
              value={form.tour.summary}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, tour: { ...prev.tour, summary: e.target.value } }));
                markDirty();
              }}
            />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            Cover URL
            <input
              className="input"
              value={form.tour.cover_url}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, tour: { ...prev.tour, cover_url: e.target.value } }));
                markDirty();
              }}
            />
          </label>
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
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">События дня</p>
            <p className="text-sm text-soft mt-1">Добавляйте экскурсии и перемещения в хронологии.</p>
            <p className="text-sm text-soft mt-1">Всего: {overallSummary.days} дней · {overallSummary.events} событий · {overallSummary.duration}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="button-ghost" onClick={expandAll}>
              Развернуть все
            </button>
            <button type="button" className="button-ghost" onClick={collapseAll}>
              Свернуть все
            </button>
            <button type="button" className="button-ghost" onClick={addDay}>
              Добавить день
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {form.days.map((day, dayIndex) => {
            const summary = daySummaries[dayIndex];
            const isOpen = expandedDays[day.day_number] ?? true;
            return (
              <div key={`day-${dayIndex}`} className="card border-neutral">
                <button type="button" className="flex w-full items-center justify-between" onClick={() => toggleDay(day.day_number)}>
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary">День {day.day_number}</p>
                    <h4 className="mt-1 text-h3">{day.title || "Без названия"}</h4>
                    <p className="text-sm text-soft mt-1">Событий: {summary.events} · {summary.duration}</p>
                  </div>
                  <span className="text-sm text-soft">{isOpen ? "Свернуть" : "Развернуть"}</span>
                </button>

                {isOpen ? (
                  <div className="mt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid gap-3 md:grid-cols-3 flex-1">
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
                      <div className="flex flex-col gap-2">
                        <button type="button" className="button-ghost" onClick={() => copyDay(dayIndex)}>
                          Копировать день
                        </button>
                        <button type="button" className="button-ghost" onClick={() => removeDay(dayIndex)}>
                          Удалить день
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button type="button" className="button-ghost" onClick={() => addEvent(dayIndex)}>
                        Добавить событие
                      </button>
                    </div>

                    <div className="mt-6 grid gap-4">
                      {day.events.map((event, eventIndex) => (
                        <div
                          key={`event-${eventIndex}`}
                          className={`card-compact border-neutral ${hasOverlap(day.events, eventIndex) ? "border-red-300" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="grid gap-3 md:grid-cols-4 flex-1">
                              <label className="grid gap-2 text-sm">
                                Тип события
                                <select
                                  className="input"
                                  value={event.type}
                                  onChange={(e) => updateEvent(dayIndex, eventIndex, { type: e.target.value as Event["type"] })}
                                >
                                  <option value="excursion">Экскурсия</option>
                                  <option value="travel">Перемещение</option>
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
                                  min={1}
                                  value={event.duration_minutes}
                                  onChange={(e) => updateEvent(dayIndex, eventIndex, { duration_minutes: Number(e.target.value) })}
                                />
                              </label>
                              <label className="grid gap-2 text-sm">
                                Заголовок
                                <input
                                  className="input"
                                  value={event.title}
                                  onChange={(e) => updateEvent(dayIndex, eventIndex, { title: e.target.value })}
                                />
                              </label>
                              <label className="grid gap-2 text-sm md:col-span-4">
                                Короткое описание
                                <textarea
                                  className="input"
                                  rows={2}
                                  value={event.summary}
                                  onChange={(e) => updateEvent(dayIndex, eventIndex, { summary: e.target.value })}
                                />
                              </label>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button type="button" className="button-ghost" onClick={() => moveEvent(dayIndex, eventIndex, "up")}>
                                Вверх
                              </button>
                              <button type="button" className="button-ghost" onClick={() => moveEvent(dayIndex, eventIndex, "down")}>
                                Вниз
                              </button>
                              <button type="button" className="button-ghost" onClick={() => removeEvent(dayIndex, eventIndex)}>
                                Удалить
                              </button>
                            </div>
                          </div>

                          {hasOverlap(day.events, eventIndex) ? (
                            <p className="text-xs text-red-600 mt-2">Время пересекается с другим событием.</p>
                          ) : null}

                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {event.type === "excursion" ? (
                              <label className="grid gap-2 text-sm md:col-span-2">
                                Place slug
                                <input
                                  className={`input ${event.place_slug ? "" : "border-red-300"}`}
                                  list="place-slugs"
                                  value={event.place_slug}
                                  onChange={(e) => updateEvent(dayIndex, eventIndex, { place_slug: e.target.value })}
                                  placeholder="goreme-open-air"
                                />
                              </label>
                            ) : (
                              <>
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
                              </>
                            )}
                          </div>

                          <div className="mt-4 card-compact border-neutral">
                            <p className="text-xs uppercase tracking-[0.2em] text-primary">Статья</p>
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
                              <label className="grid gap-2 text-sm md:col-span-2">
                                Картинки (URL через запятую)
                                <input
                                  className="input"
                                  value={
                                    Array.isArray(event.article.images)
                                      ? event.article.images.join(", ")
                                      : event.article.images
                                  }
                                  onChange={(e) => updateArticle(dayIndex, eventIndex, { images: e.target.value })}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <datalist id="place-slugs">
        {placeSlugHints.map((slug) => (
          <option key={slug} value={slug} />
        ))}
      </datalist>

      <div className="flex items-center gap-3">
        <button type="button" className="button-primary" onClick={onSubmit}>
          {mode === "create" ? "Создать тур" : "Сохранить изменения"}
        </button>
        {mode === "edit" ? (
          <button type="button" className="button-ghost" onClick={onDelete}>
            Удалить
          </button>
        ) : null}
        <span className="text-sm text-soft">{status}</span>
      </div>
    </div>
  );
}
