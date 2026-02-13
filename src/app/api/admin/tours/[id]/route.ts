import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const travelModes = ["walk", "bus", "car", "metro", "train", "plane"] as const;

type ArticlePayload = {
  id?: string;
  title: string;
  lead?: string;
  content_md?: string;
  images?: string[];
};

type EventPayload = {
  id?: string;
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
  article?: ArticlePayload;
};

type DayPayload = {
  id?: string;
  day_number: number;
  title: string;
  summary?: string;
  events: EventPayload[];
};

type TourPayload = {
  tour: {
    slug: string;
    title: string;
    city?: string;
    country?: string;
    summary?: string;
    cover_url?: string;
    is_published?: boolean;
  };
  days: DayPayload[];
};

async function upsertArticle(article?: ArticlePayload) {
  if (!article || (!article.title && !article.content_md && !article.lead && !(article.images || []).length)) {
    return null;
  }

  if (article.id) {
    const { error } = await supabaseAdmin
      .from("event_articles")
      .update({
        title: article.title,
        lead: article.lead ?? null,
        content_md: article.content_md ?? null,
        images: article.images ?? null,
        updated_at: new Date().toISOString()
      })
      .eq("id", article.id);

    if (error) throw new Error(error.message);
    return article.id;
  }

  const { data, error } = await supabaseAdmin
    .from("event_articles")
    .insert({
      title: article.title || "Без названия",
      lead: article.lead ?? null,
      content_md: article.content_md ?? null,
      images: article.images ?? null
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Не удалось создать статью.");
  return data.id as string;
}

async function upsertDay(day: DayPayload, tourId: string) {
  if (day.id) {
    const { error } = await supabaseAdmin
      .from("tour_days")
      .update({
        day_number: day.day_number,
        title: day.title,
        summary: day.summary ?? null
      })
      .eq("id", day.id);
    if (error) throw new Error(error.message);
    return day.id;
  }

  const { data, error } = await supabaseAdmin
    .from("tour_days")
    .insert({
      tour_id: tourId,
      day_number: day.day_number,
      title: day.title,
      summary: day.summary ?? null
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Не удалось создать день.");
  return data.id as string;
}

async function syncEvents(dayId: string, events: EventPayload[]) {
  const { data: existingEvents } = await supabaseAdmin
    .from("tour_events")
    .select("id,article_id")
    .eq("day_id", dayId);

  const existingMap = new Map((existingEvents ?? []).map((event) => [event.id, event.article_id]));
  const keepIds: string[] = [];

  for (const [index, event] of events.entries()) {
    if (!travelModes.includes((event.mode || "") as (typeof travelModes)[number]) && event.mode) {
      throw new Error("Неверный режим перемещения.");
    }

    const articleId = await upsertArticle(event.article);

    if (event.id) {
      const { error } = await supabaseAdmin
        .from("tour_events")
        .update({
          type: event.type,
          start_time: event.start_time,
          duration_minutes: event.duration_minutes,
          title: event.title,
          summary: event.summary ?? null,
          place_slug: event.place_slug ?? null,
          from_place_slug: event.from_place_slug ?? null,
          to_place_slug: event.to_place_slug ?? null,
          mode: event.mode ?? null,
          order_index: event.order_index ?? index,
          article_id: articleId
        })
        .eq("id", event.id);

      if (error) throw new Error(error.message);
      keepIds.push(event.id);
    } else {
      const { data, error } = await supabaseAdmin
        .from("tour_events")
        .insert({
          day_id: dayId,
          type: event.type,
          start_time: event.start_time,
          duration_minutes: event.duration_minutes,
          title: event.title,
          summary: event.summary ?? null,
          place_slug: event.place_slug ?? null,
          from_place_slug: event.from_place_slug ?? null,
          to_place_slug: event.to_place_slug ?? null,
          mode: event.mode ?? null,
          order_index: event.order_index ?? index,
          article_id: articleId
        })
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || "Не удалось создать событие.");
      keepIds.push(data.id as string);
    }
  }

  const deleteIds = (existingEvents ?? []).map((event) => event.id).filter((id) => !keepIds.includes(id));
  if (deleteIds.length > 0) {
    const deleteArticleIds = deleteIds
      .map((id) => existingMap.get(id))
      .filter(Boolean) as string[];

    await supabaseAdmin.from("tour_events").delete().in("id", deleteIds);
    if (deleteArticleIds.length > 0) {
      await supabaseAdmin.from("event_articles").delete().in("id", deleteArticleIds);
    }
  }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data: tour, error: tourError } = await supabaseAdmin
    .from("tours")
    .select("*")
    .eq("id", params.id)
    .single();

  if (tourError || !tour) {
    return NextResponse.json({ error: tourError?.message || "Тур не найден." }, { status: 404 });
  }

  const { data: days } = await supabaseAdmin
    .from("tour_days")
    .select("*")
    .eq("tour_id", params.id)
    .order("day_number", { ascending: true });

  const dayIds = (days ?? []).map((d) => d.id);
  const { data: events } = dayIds.length
    ? await supabaseAdmin
        .from("tour_events")
        .select("*")
        .in("day_id", dayIds)
        .order("start_time", { ascending: true })
    : { data: [] };

  type ArticleRow = {
    id: string;
    title: string;
    lead: string | null;
    content_md: string | null;
    images: string[] | null;
  };

  const articleIds = (events ?? []).map((event) => event.article_id).filter(Boolean);
  const { data: articleData } = articleIds.length
    ? await supabaseAdmin.from("event_articles").select("*").in("id", articleIds as string[])
    : ({ data: [] as ArticleRow[] } as { data: ArticleRow[] });

  const articles = (articleData ?? []) as ArticleRow[];
  const articlesById = new Map<string, ArticleRow>();
  articles.forEach((article) => articlesById.set(article.id, article));

  const eventsByDay = new Map<string, typeof events>(dayIds.map((id) => [id, []]));
  (events ?? []).forEach((event) => {
    const existing = eventsByDay.get(event.day_id) ?? [];
    existing.push(event);
    eventsByDay.set(event.day_id, existing);
  });

  const mappedDays = (days ?? []).map((day) => {
    const dayEvents = (eventsByDay.get(day.id) ?? []).map((event) => {
      const article = event.article_id ? articlesById.get(event.article_id) : null;
      return {
        id: event.id,
        type: event.type,
        start_time: event.start_time,
        duration_minutes: event.duration_minutes,
        title: event.title,
        summary: event.summary ?? "",
        place_slug: event.place_slug ?? "",
        from_place_slug: event.from_place_slug ?? "",
        to_place_slug: event.to_place_slug ?? "",
        mode: event.mode ?? "",
        order_index: event.order_index ?? 0,
        article: article
          ? {
              id: article.id,
              title: article.title,
              lead: article.lead ?? "",
              content_md: article.content_md ?? "",
              images: article.images ?? []
            }
          : {
              id: undefined,
              title: "",
              lead: "",
              content_md: "",
              images: []
            }
      };
    });

    return {
      id: day.id,
      day_number: day.day_number,
      title: day.title,
      summary: day.summary ?? "",
      events: dayEvents
    };
  });

  return NextResponse.json({
    tour: {
      slug: tour.slug,
      title: tour.title,
      city: tour.city ?? "",
      country: tour.country ?? "",
      summary: tour.summary ?? "",
      cover_url: tour.cover_url ?? "",
      is_published: tour.is_published
    },
    days: mappedDays
  });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json()) as TourPayload;
  const normalizedSlug = body.tour.slug.trim().toLowerCase().replace(/\s+/g, "-");

  const { error: updateError } = await supabaseAdmin
    .from("tours")
    .update({
      slug: normalizedSlug,
      title: body.tour.title,
      city: body.tour.city ?? null,
      country: body.tour.country ?? null,
      summary: body.tour.summary ?? null,
      cover_url: body.tour.cover_url ?? null,
      is_published: body.tour.is_published ?? true,
      updated_at: new Date().toISOString()
    })
    .eq("id", params.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: existingDays } = await supabaseAdmin
    .from("tour_days")
    .select("id")
    .eq("tour_id", params.id);

  const existingDayIds = new Set((existingDays ?? []).map((day) => day.id));
  const incomingDayIds = new Set(body.days.map((day) => day.id).filter(Boolean) as string[]);

  for (const day of body.days) {
    const dayId = await upsertDay(day, params.id);
    await syncEvents(dayId, day.events || []);
  }

  const deleteDayIds = Array.from(existingDayIds).filter((id) => !incomingDayIds.has(id));
  if (deleteDayIds.length > 0) {
    const { data: eventsToDelete } = await supabaseAdmin
      .from("tour_events")
      .select("article_id")
      .in("day_id", deleteDayIds);

    const articleIds = (eventsToDelete ?? [])
      .map((event) => event.article_id)
      .filter(Boolean) as string[];

    await supabaseAdmin.from("tour_days").delete().in("id", deleteDayIds);
    if (articleIds.length > 0) {
      await supabaseAdmin.from("event_articles").delete().in("id", articleIds);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { data: dayIds } = await supabaseAdmin
    .from("tour_days")
    .select("id")
    .eq("tour_id", params.id);

  const dayIdList = (dayIds ?? []).map((d) => d.id);
  const { data: existingEvents } = dayIdList.length
    ? await supabaseAdmin.from("tour_events").select("article_id").in("day_id", dayIdList)
    : { data: [] };

  const articleIds = (existingEvents ?? [])
    .map((event) => event.article_id)
    .filter(Boolean) as string[];

  const { error } = await supabaseAdmin.from("tours").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (articleIds.length > 0) {
    await supabaseAdmin.from("event_articles").delete().in("id", articleIds);
  }

  return NextResponse.json({ ok: true });
}
