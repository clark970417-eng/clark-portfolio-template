"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HeroPhoto } from "./portfolio-data";

const CHANGE_INTERVAL = 3000;
const FADE_DURATION = 900;

function HeroSlide({ photo, state, eager = false }: { photo: HeroPhoto; state: "is-active" | "is-previous"; eager?: boolean }) {
  const [fit, setFit] = useState<"unknown" | "contain" | "cover">("unknown");

  return (
    <div className={`hero-slide ${state} is-${fit}`}>
      <img className="hero-slide-backdrop" src={photo.url} alt="" style={{ objectPosition: `${photo.x}% ${photo.y}%` }} decoding="async" aria-hidden="true" />
      <img
        className="hero-slide-foreground"
        src={photo.url}
        alt=""
        style={{ objectPosition: `${photo.x}% ${photo.y}%` }}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        onLoad={(event) => {
          const image = event.currentTarget;
          const isNarrowerThanFrame = image.naturalWidth * 2 < image.naturalHeight * 3;
          setFit(isNarrowerThanFrame ? "contain" : "cover");
        }}
      />
    </div>
  );
}

export function HeroSlideshow({ photos }: { photos: HeroPhoto[] }) {
  const [widePhotos, setWidePhotos] = useState<HeroPhoto[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const activeRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const candidates = [...photos];
    for (let index = candidates.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
    }

    const checkPhoto = (photo: HeroPhoto) => new Promise<HeroPhoto | null>((resolve) => {
      const image = new window.Image();
      image.decoding = "async";
      image.onload = () => resolve(image.naturalWidth * 20 >= image.naturalHeight * 29 ? photo : null);
      image.onerror = () => resolve(null);
      image.src = photo.url;
    });

    async function findWidePhotos() {
      const found: HeroPhoto[] = [];
      for (let start = 0; start < candidates.length && found.length < 24; start += 6) {
        const batch = await Promise.all(candidates.slice(start, start + 6).map(checkPhoto));
        if (cancelled) return;
        found.push(...batch.filter((photo): photo is HeroPhoto => photo !== null));
        if (found.length) setWidePhotos(found.slice(0, 24));
      }
    }

    void findWidePhotos();
    return () => { cancelled = true; };
  }, [photos]);

  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (widePhotos.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      const current = activeRef.current;
      const offset = 1 + Math.floor(Math.random() * (widePhotos.length - 1));
      const next = (current + offset) % widePhotos.length;
      setPreviousIndex(current);
      setActiveIndex(next);
      window.setTimeout(() => setPreviousIndex(null), FADE_DURATION);
    }, CHANGE_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [activeIndex, paused, widePhotos.length]);

  const active = widePhotos[activeIndex];
  if (!active) return <div className="hero-feature hero-feature-empty"><span>Choosing a landscape photograph…</span></div>;
  const previous = previousIndex !== null ? widePhotos[previousIndex] : null;

  return (
    <Link
      className="hero-feature hero-slideshow"
      href={`/events/${active.slug}`}
      aria-label={`View photos from ${active.title}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero-feature-image">
        {previous && <HeroSlide key={`previous-${previous.id}`} photo={previous} state="is-previous" />}
        <HeroSlide key={active.id} photo={active} state="is-active" eager={activeIndex === 0} />
      </div>
      <div className="hero-feature-caption">
        <strong>{active.title}</strong>
        <i aria-hidden="true">Open ↗</i>
      </div>
    </Link>
  );
}
