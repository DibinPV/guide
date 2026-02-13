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
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">{title}</p>
        <button className="button-ghost" type="button" onClick={() => setOpen((v) => !v)}>
          {open ? "Скрыть" : buttonLabel}
        </button>
      </div>
      {open ? (
        <div className="section-inner">
          <FeedbackForm title={title} payload={payload} />
        </div>
      ) : null}
    </div>
  );
}
