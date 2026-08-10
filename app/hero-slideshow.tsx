"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HeroPhoto } from "./portfolio-data";

const CHANGE_INTERVAL = 5000;
const FADE_DURATION = 900;

export function HeroSlideshow({ photos }: { photos: HeroPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const activeRef = useRef(0);

  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (photos.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      const current = activeRef.current;
      const offset = 1 + Math.floor(Math.random() * (photos.length - 1));
      const next = (current + offset) % photos.length;
      setPreviousIndex(current);
      setActiveIndex(next);
      window.setTimeout(() => setPreviousIndex(null), FADE_DURATION);
    }, CHANGE_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [activeIndex, paused, photos.length]);

  const active = photos[activeIndex];
  if (!active) return null;

  return (
    <Link
      className={`hero-feature hero-slideshow${paused ? " is-paused" : ""}`}
      href={`/events/${active.slug}`}
      aria-label={`View story: ${active.title}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero-feature-image">
        {previousIndex !== null && photos[previousIndex] && <img className="hero-slide is-previous" src={photos[previousIndex].url} alt="" style={{ objectPosition: `${photos[previousIndex].x}% ${photos[previousIndex].y}%` }} decoding="async" />}
        <img key={active.id} className="hero-slide is-active" src={active.url} alt="" style={{ objectPosition: `${active.x}% ${active.y}%` }} loading={activeIndex === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={activeIndex === 0 ? "high" : "auto"} />
        {photos.length > 1 && <span key={active.id} className="hero-slide-timer" aria-hidden="true" />}
      </div>
      <div className="hero-feature-caption">
        <span>Random frame {String(activeIndex + 1).padStart(2, "0")}/{String(photos.length).padStart(2, "0")}</span>
        <strong>{active.title}</strong>
        <i aria-hidden="true">Open ↗</i>
      </div>
    </Link>
  );
}
