import Link from "next/link";
import { ContactForm } from "./contact-form";
import { getPublishedEvents } from "./portfolio-data";
import type { PortfolioEvent } from "./portfolio-data";
import { getSiteSettings, parseFeatures } from "./site-settings";
import { SiteMotion } from "./site-motion";

export const dynamic = "force-dynamic";

function EventGrid({ items }: { items: PortfolioEvent[] }) {
  return (
    <div className="contact-sheet">
      {items.map((event, index) => (
        <Link className={`event-card event-card-${(index % 5) + 1}`} href={`/events/${event.slug}`} key={event.id}>
          <div className="event-image">
            {event.coverUrl ? <img src={event.coverUrl} alt="" style={{ objectPosition: `${event.coverX}% ${event.coverY}%` }} loading="lazy" decoding="async" /> : <span className="empty-frame" />}
            <span className="frame-corner frame-corner-a" />
            <span className="frame-corner frame-corner-b" />
          </div>
          <div className="event-caption">
            <span className="event-number">{String(index + 1).padStart(2, "0")}</span>
            <h3>{event.title}</h3>
            <span className="event-open" aria-hidden="true">View story ↗</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function Home() {
  const [events, settings] = await Promise.all([getPublishedEvents(), getSiteSettings()]);
  const schoolEvents = events.filter((event) => event.category === "school");
  const outsideSchoolEvents = events.filter((event) => event.category === "outside-school");
  const featured = events.find((event) => event.coverUrl);
  const features = parseFeatures(settings.featuresText);

  return (
    <main className="home-page">
      <SiteMotion />
      <header className="site-header">
        <Link href="/" className="wordmark" aria-label={`${settings.displayName}, home`}>{settings.displayName}</Link>
        <nav aria-label="Primary navigation">
          <a href="#academy">{settings.academyLabel}</a>
          <a href="#cosplay">{settings.cosplayLabel}</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <nav className="header-socials" aria-label="Social links">
          {settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label={`${settings.displayName} on Instagram`}>INS</a>}
          {settings.xUrl && <a href={settings.xUrl} target="_blank" rel="noreferrer" aria-label={`${settings.displayName} on X`}>X</a>}
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="intro-title">
        <div className="hero-copy">
          <p className="hero-kicker">{settings.heroEyebrow}</p>
          <h1 id="intro-title">{settings.heroTitle}</h1>
          <p className="hero-intro">{settings.heroIntro}</p>
          <a className="hero-scroll" href="#academy">Selected work <span aria-hidden="true">↓</span></a>
        </div>
        {featured ? (
          <Link className="hero-feature" href={`/events/${featured.slug}`} aria-label={`View featured story: ${featured.title}`}>
            <div className="hero-feature-image"><img src={featured.coverUrl!} alt="" style={{ objectPosition: `${featured.coverX}% ${featured.coverY}%` }} loading="eager" decoding="async" fetchPriority="high" /></div>
            <div className="hero-feature-caption"><span>Featured story</span><strong>{featured.title}</strong><i aria-hidden="true">Open ↗</i></div>
          </Link>
        ) : <div className="hero-feature hero-feature-empty"><span>Photographs coming soon</span></div>}
        <div className="hero-meta"><span>{String(events.length).padStart(2, "0")} published stories</span><span>{settings.location} / 2024—{new Date().getFullYear()}</span></div>
      </section>

      <section className="work-section" id="work" aria-label="Selected work">
        {events.length ? (
          <div className="event-groups">
            <section className="event-group" id="academy" aria-labelledby="academy-title">
              <div className="section-heading">
                <div><p>School life &amp; performance</p><h2 id="academy-title">{settings.academyLabel}</h2></div>
                <div className="section-heading-meta"><p>{schoolEvents.length} {schoolEvents.length === 1 ? "story" : "stories"}</p><a className="section-back" href="#top">Back ↑</a></div>
              </div>
              {schoolEvents.length ? <EventGrid items={schoolEvents} /> : <p className="group-empty">School stories will appear here.</p>}
            </section>

            <section className="event-group event-group-outside" id="cosplay" aria-labelledby="cosplay-title">
              <div className="section-heading">
                <div><p>Portraits &amp; subculture</p><h2 id="cosplay-title">{settings.cosplayLabel}</h2></div>
                <div className="section-heading-meta"><p>{outsideSchoolEvents.length} {outsideSchoolEvents.length === 1 ? "story" : "stories"}</p><a className="section-back" href="#top">Back ↑</a></div>
              </div>
              {outsideSchoolEvents.length ? <EventGrid items={outsideSchoolEvents} /> : <p className="group-empty">Cosplay stories will appear here.</p>}
            </section>
          </div>
        ) : (
          <div className="empty-archive"><div className="empty-frame-large"><span>Archive in progress</span></div><div className="empty-copy"><span>Selected work</span><p>Your first event will appear here after you publish it from the studio.</p><Link href="/studio">Open studio <span aria-hidden="true">↗</span></Link></div></div>
        )}
      </section>

      <section className="about-section" id="about">
        <div className="about-heading">
          <div className="section-rail"><p className="section-label">About</p><a className="section-back" href="#top">Back ↑</a></div>
          <p className="about-identity">{settings.displayName} {settings.nativeName} <span>— {settings.alias}</span></p>
          <h2>{settings.aboutHeadline}</h2>
        </div>
        <div className="about-content">
          {settings.profilePhotoUrl && <figure className="about-portrait"><img src={settings.profilePhotoUrl} alt={`${settings.displayName} portrait`} loading="lazy" decoding="async" /></figure>}
          <div className="about-biographies">
            <div className="about-language"><span>English</span>{settings.aboutBioEn.split(/\n\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            {settings.aboutBioJa && <details className="about-japanese"><summary>日本語で読む <span aria-hidden="true">＋</span></summary><div>{settings.aboutBioJa.split(/\n\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></details>}
          </div>
          <dl className="about-facts">
            <div><dt>Photographer</dt><dd>{settings.displayName}</dd></div>
            <div><dt>Currently</dt><dd>{settings.role}</dd></div>
            <div><dt>School</dt><dd>{settings.school}</dd></div>
            <div><dt>Based in</dt><dd>{settings.location}</dd></div>
            <div><dt>Focus</dt><dd>{settings.focus}</dd></div>
          </dl>
          {features.length > 0 && <div className="about-features"><div className="about-features-heading"><h3>Selected Features &amp; Official Use</h3><span>{String(features.length).padStart(2, "0")} entries</span></div><ol>{features.map((feature) => <li key={`${feature.source}-${feature.title}`}><a href={feature.url} target="_blank" rel="noreferrer"><span className="feature-source">{feature.source}</span><span className="feature-title">{feature.title}</span><span className="feature-year">{feature.year} <i aria-hidden="true">↗</i></span></a></li>)}</ol></div>}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-copy">
          <div className="section-rail"><p className="section-label">Contact</p><a className="section-back" href="#top">Back ↑</a></div>
          <h2>{settings.contactHeadline}</h2>
          <div className="contact-links"><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>{settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a>}{settings.xUrl && <a href={settings.xUrl} target="_blank" rel="noreferrer">X / {settings.alias} ↗</a>}</div>
        </div>
        <ContactForm contactEmail={settings.contactEmail} />
      </section>

      <footer><span>© {new Date().getFullYear()} {settings.displayName}</span><span>{settings.alias} / Photography</span><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
