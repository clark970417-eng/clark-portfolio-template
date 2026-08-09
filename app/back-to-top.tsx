"use client";

export function BackToTop() {
  function goBack() {
    const target = document.getElementById("top");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (target) target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  return <button className="section-back" type="button" onClick={goBack}>Back ↑</button>;
}
