"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { FeedbackPayload } from "./FeedbackForm";

const FeedbackForm = dynamic(() => import("./FeedbackForm"), {
  ssr: false,
  loading: () => <p className="text-xs text-soft">Загрузка формы…</p>
});

export default function FeedbackSection({
  title,
  buttonLabel,
  payload
}: {
  title: string;
  buttonLabel: string;
  payload: FeedbackPayload;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card feedback-card">
      <div className="feedback-header">
        <div>
          <p className="feedback-kicker">Отзыв</p>
          <h3 className="feedback-title">{title}</h3>
          <p className="feedback-subtitle">Это займет минуту и помогает улучшать маршруты.</p>
        </div>
        <button className="button-primary" type="button" onClick={() => setOpen((v) => !v)}>
          {open ? "Скрыть форму" : buttonLabel}
        </button>
      </div>
      {!open ? (
        <div className="feedback-hints">
          <span className="chip">Лайк / дизлайк</span>
          <span className="chip">Оценка 1–5</span>
          <span className="chip">Комментарий</span>
        </div>
      ) : null}
      {open ? (
        <div className="feedback-body">
          <FeedbackForm title={title} payload={payload} />
        </div>
      ) : null}
    </div>
  );
}
