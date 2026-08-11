"use client";

import { useState } from "react";
import type { FeatureItem } from "./site-settings";

export function AboutEditorial({ bioEn, bioJa, features }: { bioEn: string; bioJa: string; features: FeatureItem[] }) {
  const [language, setLanguage] = useState<"en" | "ja">("en");
  const paragraphs = (language === "ja" ? bioJa : bioEn).split(/\n\n+/).filter(Boolean);

  return (
    <div className="about-editorial">
      <div className="about-language-tabs" role="tablist" aria-label="Biography language">
        <button type="button" role="tab" aria-selected={language === "en"} onClick={() => setLanguage("en")}>English</button>
        {bioJa && <button type="button" role="tab" aria-selected={language === "ja"} onClick={() => setLanguage("ja")}>日本語</button>}
      </div>
      <div className="about-language-panel" role="tabpanel" lang={language === "ja" ? "ja" : "en"} key={language}>
        {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      {features.length > 0 && <div className="about-features"><div className="about-features-heading"><h3>Selected Features &amp; Official Use</h3><span>{String(features.length).padStart(2, "0")} entries</span></div><ol>{features.map((feature) => <li key={`${feature.source}-${feature.title}`}><a href={feature.url} target="_blank" rel="noreferrer"><span className="feature-source">{feature.source}</span><span className="feature-title">{feature.title}</span><span className="feature-year">{feature.year} <i aria-hidden="true">↗</i></span></a></li>)}</ol></div>}
    </div>
  );
}
