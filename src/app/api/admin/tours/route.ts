import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const travelModes = ["walk", "bus", "car", "metro", "train", "plane"] as const;

type ArticlePayload = {
  title: string;
  lead?: string;
  content_md?: string;
  images?: string[];
};

type EventPayload = {
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
  days: Array<{
    day_number: number;
    title: string;
    summary?: string;
    events: EventPayload[];
  }>;
};

async function insertDays(tourId: string, days: TourPayload["days"]) {
  for (const day of days) {
    const { data: dayRow, error: dayError } = await supabaseAdmin
      .from("tour_days")
      .insert({
        tour_id: tourId,
        day_number: day.day_number,
        title: day.title,
        summary: day.summary ?? null
      })
      .select()
      .single();

    if (dayError || !dayRow) {
      throw new Error(dayError?.message || "Не удалось сохранить день.");
    }

    if (day.events && day.events.length > 0) {
      for (const [index, event] of day.events.entries()) {
        if (!travelModes.includes((event.mode || "") as (typeof travelModes)[number]) && event.mode) {
          throw new Error("Неверный режим перемещения.");
        }

        let articleId: string | null = null;
        if (event.article && event.article.title) {
          const { data: articleRow, error: articleError } = await supabaseAdmin
            .from("event_articles")
            .insert({
              title: event.article.title,
              lead: event.article.lead ?? null,
              content_md: event.article.content_md ?? null,
              images: event.article.images ?? null
            })
            .select()
            .single();

          if (articleError || !articleRow) {
            throw new Error(articleError?.message || "Не удалось сохранить статью.");
          }
          articleId = articleRow.id;
        }

        const { error: eventError } = await supabaseAdmin.from("tour_events").insert({
          day_id: dayRow.id,
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
        });

        if (eventError) {
          throw new Error(eventError.message);
        }
      }
    }
  }
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("tours")
    .select("id,slug,title,city,country,is_published,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tours: data ?? [] });
}

export async function POST(request: Request) {
  const body = (await request.json()) as TourPayload;
  if (!body?.tour?.slug || !body?.tour?.title) {
    return NextResponse.json({ error: "Нужны slug и title." }, { status: 400 });
  }

  const normalizedSlug = body.tour.slug.trim().toLowerCase().replace(/\s+/g, "-");

  const { data: tourRow, error: tourError } = await supabaseAdmin
    .from("tours")
    .insert({
      slug: normalizedSlug,
      title: body.tour.title,
      city: body.tour.city ?? null,
      country: body.tour.country ?? null,
      summary: body.tour.summary ?? null,
      cover_url: body.tour.cover_url ?? null,
      is_published: body.tour.is_published ?? true
    })
    .select()
    .single();

  if (tourError || !tourRow) {
    return NextResponse.json({ error: tourError?.message || "Не удалось создать тур." }, { status: 500 });
  }

  try {
    await insertDays(tourRow.id, body.days || []);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  return NextResponse.json({ id: tourRow.id });
}
