"use client";

export function BackToTop() {
  function goBack() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  return <button className="section-back" type="button" onClick={goBack}>Back ↑</button>;
}
