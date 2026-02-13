"use client";

import { useState } from "react";

type Props = {
  images: string[];
  title: string;
};

export default function ArticleGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!images.length) return null;

  const open = (index: number) => setActiveIndex(index);
  const close = () => setActiveIndex(null);
  const next = () => setActiveIndex((prev) => (prev === null ? prev : (prev + 1) % images.length));
  const prev = () => setActiveIndex((prev) => (prev === null ? prev : (prev - 1 + images.length) % images.length));

  return (
    <div className="gallery-shell">
      <div className="gallery-strip">
        {images.slice(0, 3).map((src, idx) => (
          <button key={src} type="button" className="gallery-thumb" onClick={() => open(idx)}>
            <img src={src} alt={title} />
            {idx === 2 && images.length > 3 ? (
              <span className="gallery-count">{images.length}</span>
            ) : null}
          </button>
        ))}
      </div>

      {activeIndex !== null ? (
        <div className="gallery-modal" role="dialog" aria-modal="true">
          <button className="gallery-backdrop" onClick={close} aria-label="Закрыть" />
          <div className="gallery-modal-content">
            <button className="gallery-nav left" onClick={prev} aria-label="Предыдущее">←</button>
            <img src={images[activeIndex]} alt={title} />
            <button className="gallery-nav right" onClick={next} aria-label="Следующее">→</button>
            <button className="gallery-close" onClick={close} aria-label="Закрыть">×</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
