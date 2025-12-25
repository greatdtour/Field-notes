"use client";

import { useEffect, useState } from "react";

type LightboxImageProps = {
  itemId?: string;
  src: string;
  alt: string;
  caption?: string | null;
  className?: string;
  wrapperClassName?: string;
  imageStyle?: React.CSSProperties;
  items?: { id: string; src: string; alt: string; caption?: string | null }[];
};

export function LightboxImage({
  itemId,
  src,
  alt,
  caption,
  className,
  wrapperClassName,
  imageStyle,
  items,
}: LightboxImageProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const galleryItems = items && items.length > 0 ? items : null;
  const gallerySignature = galleryItems ? galleryItems.map((item) => item.id).join("|") : "";
  const initialIndex = galleryItems
    ? Math.max(
        0,
        galleryItems.findIndex((item) => (itemId ? item.id === itemId : item.src === src))
      )
    : 0;

  const activeItem = galleryItems ? galleryItems[activeIndex] : { src, alt, caption };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (!galleryItems || galleryItems.length < 2) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % galleryItems.length);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + galleryItems.length) % galleryItems.length);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, gallerySignature]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    setAnimating(true);
    const timer = window.setTimeout(() => setAnimating(false), 520);
    return () => window.clearTimeout(timer);
  }, [activeIndex, open]);

  return (
    <>
      <button
        type="button"
        className={`lightbox-trigger ${wrapperClassName ?? ""}`}
        onClick={() => setOpen(true)}
        aria-label="Open image"
      >
        <img src={src} alt={alt} className={className} style={imageStyle} />
      </button>
      {open ? (
        <div className="lightbox-backdrop" onClick={() => setOpen(false)}>
          <div className="lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12" />
                <path d="M18 6l-12 12" />
              </svg>
            </button>
            <img
              src={activeItem.src}
              alt={activeItem.alt}
              className={`lightbox-image ${animating ? "lightbox-swap" : ""}`}
            />
            {galleryItems && galleryItems.length > 1 ? (
              <div className="lightbox-thumbs">
                {galleryItems.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`lightbox-thumb ${index === activeIndex ? "is-active" : ""}`}
                    onClick={() => setActiveIndex(index)}
                  >
                    <img src={item.src} alt={item.alt} />
                  </button>
                ))}
              </div>
            ) : null}
            {activeItem.caption ? <p className="lightbox-caption">{activeItem.caption}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
