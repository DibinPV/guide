import "server-only";
import { supabase } from "@/lib/supabaseClient";

export type TourEventArticle = {
  id?: string;
  title: string;
  lead?: string;
  content_md?: string;
  images?: string[];
};

export type TourEvent = {
  id: string;
  type: "excursion" | "travel";
  start_time: string;
  duration_minutes: number;
  title: string;
  summary?: string;
  place_slug?: string;
  from_place_slug?: string;
  to_place_slug?: string;
  mode?: string;
  order_index?: number;
  article?: TourEventArticle | null;
};

export type TourDay = {
  id: string;
  day_number: number;
  title: string;
  summary?: string;
  events: TourEvent[];
};

export type Tour = {
  id: string;
  slug: string;
  title: string;
  city?: string;
  country?: string;
  summary?: string;
  cover_url?: string;
  is_published: boolean;
};

export async function getToursDb() {
  const { data, error } = await supabase
    .from("tours")
    .select("id,slug,title,city,country,summary,cover_url,is_published")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  if (error) return [] as Tour[];
  return (data ?? []) as Tour[];
}

export async function getTourBySlugDb(slug: string) {
  const cleanSlug = slug.trim();
  const { data, error } = await supabase
    .from("tours")
    .select("id,slug,title,city,country,summary,cover_url,is_published")
    .eq("slug", cleanSlug)
    .single();

  if (error || !data) {
    const { data: fallback } = await supabase
      .from("tours")
      .select("id,slug,title,city,country,summary,cover_url,is_published")
      .ilike("slug", cleanSlug)
      .single();
    if (!fallback) return null;
    return fallback as Tour;
  }
  return data as Tour;
}

export async function getTourDaysDb(tourId: string) {
  const { data, error } = await supabase
    .from("tour_days")
    .select("id,day_number,title,summary")
    .eq("tour_id", tourId)
    .order("day_number", { ascending: true });

  if (error) return [] as TourDay[];
  return (data ?? []).map((day) => ({ ...day, events: [] })) as TourDay[];
}

export async function getTourDayWithEventsDb(tourId: string, dayNumber: number) {
  const { data: day, error: dayError } = await supabase
    .from("tour_days")
    .select("id,day_number,title,summary")
    .eq("tour_id", tourId)
    .eq("day_number", dayNumber)
    .single();

  if (dayError || !day) return null;

  const { data: events, error: eventError } = await supabase
    .from("tour_events")
    .select("*")
    .eq("day_id", day.id)
    .order("start_time", { ascending: true })
    .order("order_index", { ascending: true });

  if (eventError) return { ...day, events: [] } as TourDay;

  const articleIds = (events ?? []).map((event) => event.article_id).filter(Boolean) as string[];
  const { data: articles } = articleIds.length
    ? await supabase.from("event_articles").select("*").in("id", articleIds)
    : { data: [] };

  const articlesById = new Map<string, (typeof articles)[number]>();
  (articles ?? []).forEach((article) => {
    articlesById.set(article.id, article);
  });

  const mappedEvents: TourEvent[] = (events ?? []).map((event) => {
    const article = event.article_id ? articlesById.get(event.article_id) : null;
    return {
      id: event.id,
      type: event.type,
      start_time: event.start_time,
      duration_minutes: event.duration_minutes,
      title: event.title,
      summary: event.summary ?? undefined,
      place_slug: event.place_slug ?? undefined,
      from_place_slug: event.from_place_slug ?? undefined,
      to_place_slug: event.to_place_slug ?? undefined,
      mode: event.mode ?? undefined,
      order_index: event.order_index ?? undefined,
      article: article
        ? {
            id: article.id,
            title: article.title,
            lead: article.lead ?? undefined,
            content_md: article.content_md ?? undefined,
            images: article.images ?? undefined
          }
        : null
    };
  });

  return {
    id: day.id,
    day_number: day.day_number,
    title: day.title,
    summary: day.summary ?? undefined,
    events: mappedEvents
  } as TourDay;
}

export async function getEventByIdDb(eventId: string) {
  const { data: event, error } = await supabase
    .from("tour_events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error || !event) return null;

  let article: TourEventArticle | null = null;
  if (event.article_id) {
    const { data: articleRow } = await supabase
      .from("event_articles")
      .select("*")
      .eq("id", event.article_id)
      .single();
    if (articleRow) {
      article = {
        id: articleRow.id,
        title: articleRow.title,
        lead: articleRow.lead ?? undefined,
        content_md: articleRow.content_md ?? undefined,
        images: articleRow.images ?? undefined
      };
    }
  }

  return {
    id: event.id,
    type: event.type,
    start_time: event.start_time,
    duration_minutes: event.duration_minutes,
    title: event.title,
    summary: event.summary ?? undefined,
    place_slug: event.place_slug ?? undefined,
    from_place_slug: event.from_place_slug ?? undefined,
    to_place_slug: event.to_place_slug ?? undefined,
    mode: event.mode ?? undefined,
    order_index: event.order_index ?? undefined,
    article
  } as TourEvent;
}

export async function getTourDayCounts(tourIds: string[]) {
  if (tourIds.length === 0) return new Map<string, number>();
  const { data, error } = await supabase
    .from("tour_days")
    .select("tour_id")
    .in("tour_id", tourIds);

  if (error) return new Map<string, number>();
  const counts = new Map<string, number>();
  (data ?? []).forEach((row) => {
    counts.set(row.tour_id, (counts.get(row.tour_id) ?? 0) + 1);
  });
  return counts;
}

export async function getDayEventCountsDb(dayIds: string[]) {
  if (dayIds.length === 0) return new Map<string, number>();
  const { data, error } = await supabase
    .from("tour_events")
    .select("day_id")
    .in("day_id", dayIds);

  if (error) return new Map<string, number>();
  const counts = new Map<string, number>();
  (data ?? []).forEach((row) => {
    counts.set(row.day_id, (counts.get(row.day_id) ?? 0) + 1);
  });
  return counts;
}

export async function getDayEventPreviews(dayIds: string[], limit = 3) {
  if (dayIds.length === 0) return new Map<string, TourEvent[]>();
  const { data, error } = await supabase
    .from("tour_events")
    .select("id,day_id,title,start_time,type")
    .in("day_id", dayIds)
    .order("start_time", { ascending: true })
    .order("order_index", { ascending: true });

  if (error) return new Map<string, TourEvent[]>();
  const grouped = new Map<string, TourEvent[]>();
  (data ?? []).forEach((event) => {
    const list = grouped.get(event.day_id) ?? [];
    if (list.length < limit) {
      list.push({
        id: event.id,
        type: event.type,
        start_time: event.start_time,
        duration_minutes: 0,
        title: event.title
      } as TourEvent);
    }
    grouped.set(event.day_id, list);
  });
  return grouped;
}

export async function getTourEventSummary(tourId: string) {
  const { data: days, error: dayError } = await supabase
    .from("tour_days")
    .select("id")
    .eq("tour_id", tourId);

  if (dayError) return { totalEvents: 0, totalMinutes: 0 };
  const dayIds = (days ?? []).map((d) => d.id);
  if (dayIds.length === 0) return { totalEvents: 0, totalMinutes: 0 };

  const { data: events, error: eventError } = await supabase
    .from("tour_events")
    .select("duration_minutes")
    .in("day_id", dayIds);

  if (eventError) return { totalEvents: 0, totalMinutes: 0 };
  const totalEvents = (events ?? []).length;
  const totalMinutes = (events ?? []).reduce((sum, event) => sum + (event.duration_minutes || 0), 0);
  return { totalEvents, totalMinutes };
}

export async function getTourSummaries(tourIds: string[]) {
  const summaries = new Map<string, { days: number; events: number; minutes: number }>();
  if (tourIds.length === 0) return summaries;

  const { data: days } = await supabase
    .from("tour_days")
    .select("id,tour_id")
    .in("tour_id", tourIds);

  const dayMap = new Map<string, string>();
  (days ?? []).forEach((day) => {
    dayMap.set(day.id, day.tour_id);
    const current = summaries.get(day.tour_id) ?? { days: 0, events: 0, minutes: 0 };
    current.days += 1;
    summaries.set(day.tour_id, current);
  });

  const dayIds = (days ?? []).map((day) => day.id);
  if (dayIds.length === 0) return summaries;

  const { data: events } = await supabase
    .from("tour_events")
    .select("day_id,duration_minutes")
    .in("day_id", dayIds);

  (events ?? []).forEach((event) => {
    const tourId = dayMap.get(event.day_id);
    if (!tourId) return;
    const current = summaries.get(tourId) ?? { days: 0, events: 0, minutes: 0 };
    current.events += 1;
    current.minutes += event.duration_minutes || 0;
    summaries.set(tourId, current);
  });

  return summaries;
}

export async function getTourFirstEventTitles(tourIds: string[]) {
  const result = new Map<string, string>();
  if (tourIds.length === 0) return result;

  const { data: days } = await supabase
    .from("tour_days")
    .select("id,tour_id,day_number")
    .in("tour_id", tourIds)
    .order("day_number", { ascending: true });

  if (!days || days.length === 0) return result;

  const firstDayByTour = new Map<string, string>();
  days.forEach((day) => {
    if (!firstDayByTour.has(day.tour_id)) {
      firstDayByTour.set(day.tour_id, day.id);
    }
  });

  const firstDayIds = Array.from(firstDayByTour.values());
  const { data: events } = await supabase
    .from("tour_events")
    .select("day_id,title,start_time")
    .in("day_id", firstDayIds)
    .order("start_time", { ascending: true });

  const firstEventByDay = new Map<string, string>();
  (events ?? []).forEach((event) => {
    if (!firstEventByDay.has(event.day_id)) {
      firstEventByDay.set(event.day_id, `${event.start_time} · ${event.title}`);
    }
  });

  firstDayByTour.forEach((dayId, tourId) => {
    const title = firstEventByDay.get(dayId);
    if (title) result.set(tourId, title);
  });

  return result;
}
