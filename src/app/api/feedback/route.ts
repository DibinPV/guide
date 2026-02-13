import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env vars");
}

const supabase = createClient(supabaseUrl, serviceRole || supabaseAnonKey, {
  auth: { persistSession: false }
});

const TABLE_BY_TARGET: Record<string, string> = {
  place: "feedback_place",
  stop: "feedback_stop",
  travel: "feedback_travel",
  day: "feedback_day",
  tour: "feedback_tour"
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { target } = body as { target: string };

    const table = TABLE_BY_TARGET[target];
    if (!table) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }

    const base = {
      rating: body.rating ?? null,
      is_like: body.is_like ?? null,
      comment: body.comment ?? null
    };

    let row: Record<string, unknown> = { ...base };

    if (target === "place") {
      row = { ...base, place_slug: body.place_slug ?? null };
    } else if (target === "tour") {
      row = { ...base, tour_slug: body.tour_slug ?? null };
    } else if (target === "day") {
      row = { ...base, tour_slug: body.tour_slug ?? null, day_number: body.day_number ?? null };
    } else if (target === "stop") {
      row = {
        ...base,
        tour_slug: body.tour_slug ?? null,
        day_number: body.day_number ?? null,
        stop_index: body.stop_index ?? null,
        place_slug: body.place_slug ?? null
      };
    } else if (target === "travel") {
      row = {
        ...base,
        tour_slug: body.tour_slug ?? null,
        day_number: body.day_number ?? null,
        travel_index: body.travel_index ?? null
      };
    }

    const { error } = await supabase.from(table).insert(row);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
