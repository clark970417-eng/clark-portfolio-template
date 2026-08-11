"use client";

import { useEffect } from "react";

export function SiteMotion() {
  useEffect(() => {
    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".site-header nav a[href^='#']"));
    const sections = navLinks.flatMap((link) => {
      const section = document.querySelector<HTMLElement>(link.hash);
      return section ? [{ link, section }] : [];
    });
    const hero = document.querySelector<HTMLElement>(".hero");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    function update() {
      frame = 0;
      const marker = window.scrollY + window.innerHeight * 0.32;
      let active = sections[0]?.section.id;
      for (const item of sections) if (item.section.offsetTop <= marker) active = item.section.id;
      for (const item of sections) {
        if (item.section.id === active) item.link.setAttribute("aria-current", "location");
        else item.link.removeAttribute("aria-current");
      }
    }

    function requestUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function moveHero(event: PointerEvent) {
      if (!hero || reduceMotion) return;
      const bounds = hero.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      hero.style.setProperty("--pointer-x", x.toFixed(3));
      hero.style.setProperty("--pointer-y", y.toFixed(3));
    }

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    hero?.addEventListener("pointermove", moveHero, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      hero?.removeEventListener("pointermove", moveHero);
    };
  }, []);

  return null;
}
