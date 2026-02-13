"use client";

import { useState } from "react";

export type FeedbackTarget = "place" | "stop" | "travel" | "day" | "tour";

export type FeedbackPayload = {
  target: FeedbackTarget;
  tour_slug?: string;
  day_number?: number;
  stop_index?: number;
  travel_index?: number;
  place_slug?: string;
  rating?: number | null;
  is_like?: boolean | null;
  comment?: string | null;
};

const TABLE_BY_TARGET: Record<FeedbackTarget, string> = {
  place: "feedback_place",
  stop: "feedback_stop",
  travel: "feedback_travel",
  day: "feedback_day",
  tour: "feedback_tour"
};

export default function FeedbackForm({
  payload,
  title
}: {
  payload: FeedbackPayload;
  title: string;
}) {
  const [rating, setRating] = useState<number | "">(payload.rating ?? "");
  const [like, setLike] = useState<boolean | null>(payload.is_like ?? null);
  const [comment, setComment] = useState(payload.comment ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function submit() {
    setStatus("saving");
    setMessage("");

    const base = {
      rating: rating === "" ? null : Number(rating),
      is_like: like,
      comment: comment.trim() ? comment.trim() : null
    };

    let row: Record<string, unknown> = { ...base };

    if (payload.target === "place") {
      row = { ...base, place_slug: payload.place_slug ?? null };
    } else if (payload.target === "tour") {
      row = { ...base, tour_slug: payload.tour_slug ?? null };
    } else if (payload.target === "day") {
      row = { ...base, tour_slug: payload.tour_slug ?? null, day_number: payload.day_number ?? null };
    } else if (payload.target === "stop") {
      row = {
        ...base,
        tour_slug: payload.tour_slug ?? null,
        day_number: payload.day_number ?? null,
        stop_index: payload.stop_index ?? null,
        place_slug: payload.place_slug ?? null
      };
    } else if (payload.target === "travel") {
      row = {
        ...base,
        tour_slug: payload.tour_slug ?? null,
        day_number: payload.day_number ?? null,
        travel_index: payload.travel_index ?? null
      };
    }

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: payload.target, ...row })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus("error");
      setMessage(data?.error || "Ошибка отправки");
      return;
    }

    setStatus("done");
    setMessage("Спасибо! Отзыв отправлен.");
  }

  return (
    <div className="card" style={{ padding: "16px" }}>
      <p className="text-xs uppercase tracking-[0.2em] text-primary">{title}</p>

      <div className="section-inner" style={{ marginTop: "12px" }}>
        <label className="text-xs text-soft">Оценка (1–5)</label>
        <div className="flex gap-2 mt-1 flex-wrap">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              className={`button-ghost ${rating === v ? "active" : ""}`}
              onClick={() => setRating(v)}
            >
              {v}
            </button>
          ))}
          <button type="button" className="button-ghost" onClick={() => setRating("")}>
            сброс
          </button>
        </div>
      </div>

      <div className="section-inner" style={{ marginTop: "12px" }}>
        <label className="text-xs text-soft">Лайк / дизлайк</label>
        <div className="flex gap-2 mt-1 flex-wrap">
          <button
            type="button"
            className={`button-ghost ${like === true ? "active" : ""}`}
            onClick={() => setLike(true)}
          >
            👍
          </button>
          <button
            type="button"
            className={`button-ghost ${like === false ? "active" : ""}`}
            onClick={() => setLike(false)}
          >
            👎
          </button>
          <button type="button" className="button-ghost" onClick={() => setLike(null)}>
            сброс
          </button>
        </div>
      </div>

      <div className="section-inner" style={{ marginTop: "12px" }}>
        <label className="text-xs text-soft">Комментарий</label>
        <textarea
          className="input"
          style={{ minHeight: 80 }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Что понравилось или что можно улучшить?"
        />
      </div>

      <div className="section-inner" style={{ marginTop: "12px" }}>
        <button className="button-primary" type="button" onClick={submit} disabled={status === "saving"}>
          {status === "saving" ? "Отправка..." : "Отправить"}
        </button>
        {message ? (
          <p className={`text-xs ${status === "error" ? "text-soft" : "text-muted"}`} style={{ marginTop: 8 }}>
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
