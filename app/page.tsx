import Link from "next/link";
import { AboutEditorial } from "./about-editorial";
import { ContactForm } from "./contact-form";
import { HeroSlideshow } from "./hero-slideshow";
import { getHeroPhotos, getPublishedEvents } from "./portfolio-data";
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
            <span className="event-open" aria-hidden="true">View photos ↗</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function Home() {
  const [events, heroPhotos, settings] = await Promise.all([getPublishedEvents(), getHeroPhotos(), getSiteSettings()]);
  const schoolEvents = events.filter((event) => event.category === "school");
  const outsideSchoolEvents = events.filter((event) => event.category === "outside-school");
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
          {settings.githubUrl && <a href={settings.githubUrl} target="_blank" rel="noreferrer" aria-label={`${settings.displayName} on GitHub`}>GH</a>}
          {settings.xUrl && <a href={settings.xUrl} target="_blank" rel="noreferrer" aria-label={`${settings.displayName} on X`}>X</a>}
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="intro-title">
        <div className="hero-copy">
          <p className="hero-kicker">{settings.heroEyebrow}</p>
          <h1 id="intro-title">{settings.heroTitle}</h1>
          <p className="hero-intro">{settings.heroIntro}</p>
        </div>
        {heroPhotos.length ? (
          <HeroSlideshow photos={heroPhotos} />
        ) : <div className="hero-feature hero-feature-empty"><span>Photographs coming soon</span></div>}
        <div className="hero-meta"><span>{String(events.length).padStart(2, "0")} published stories</span><span>{settings.location} / 2024—{new Date().getFullYear()}</span></div>
      </section>

      <section className="work-section" id="work" aria-label="Selected work">
        {events.length ? (
          <div className="event-groups">
            <section className="event-group" id="academy" aria-labelledby="academy-title">
              <div className="section-heading">
                <div><p>School life &amp; performance</p><h2 id="academy-title">{settings.academyLabel}</h2></div>
                <div className="section-heading-meta"><p>{schoolEvents.length} {schoolEvents.length === 1 ? "story" : "stories"}</p></div>
              </div>
              {schoolEvents.length ? <EventGrid items={schoolEvents} /> : <p className="group-empty">School stories will appear here.</p>}
            </section>

            <section className="event-group event-group-outside" id="cosplay" aria-labelledby="cosplay-title">
              <div className="section-heading">
                <div><p>Portraits &amp; subculture</p><h2 id="cosplay-title">{settings.cosplayLabel}</h2></div>
                <div className="section-heading-meta"><p>{outsideSchoolEvents.length} {outsideSchoolEvents.length === 1 ? "story" : "stories"}</p></div>
              </div>
              {outsideSchoolEvents.length ? <EventGrid items={outsideSchoolEvents} /> : <p className="group-empty">Cosplay stories will appear here.</p>}
            </section>
          </div>
        ) : (
          <div className="empty-archive"><div className="empty-frame-large"><span>Archive in progress</span></div><div className="empty-copy"><span>Selected work</span><p>Your first event will appear here after you publish it from the studio.</p><Link href="/studio">Open studio <span aria-hidden="true">↗</span></Link></div></div>
        )}
      </section>

      <section className="about-section" id="about" aria-label={`About ${settings.displayName}`}>
        <div className="about-heading">
          <div className="section-rail"><p className="section-label">About</p></div>
        </div>
        <div className="about-content">
          <div className="about-profile">
            {settings.profilePhotoUrl && <figure className="about-portrait"><div className="about-portrait-frame"><img src={settings.profilePhotoUrl} alt={`${settings.displayName} portrait`} loading="lazy" decoding="async" /></div></figure>}
            <dl className="about-facts">
              <div><dt>Photographer</dt><dd>{settings.displayName}</dd></div>
              <div><dt>Nickname</dt><dd>{settings.alias}</dd></div>
              <div><dt>Currently</dt><dd>{settings.role}</dd></div>
              <div><dt>School</dt><dd>{settings.school}</dd></div>
              <div><dt>Based in</dt><dd>{settings.location}</dd></div>
              <div><dt>Focus</dt><dd>{settings.focus}</dd></div>
            </dl>
          </div>
          <AboutEditorial bioEn={settings.aboutBioEn} bioJa={settings.aboutBioJa} features={features} />
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-copy">
          <div className="section-rail"><p className="section-label">Contact</p></div>
          <h2>{settings.contactHeadline}</h2>
          <div className="contact-links"><a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(settings.contactEmail)}`} target="_blank" rel="noreferrer">{settings.contactEmail}</a>{settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a>}{settings.xUrl && <a href={settings.xUrl} target="_blank" rel="noreferrer">X / {settings.alias} ↗</a>}{settings.githubUrl && <a href={settings.githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>}<a href="#top">Back to top ↑</a></div>
        </div>
        <ContactForm contactEmail={settings.contactEmail} googleClientId={process.env.GOOGLE_CLIENT_ID ?? null} />
      </section>

      <footer><span>© {new Date().getFullYear()} {settings.displayName}</span><span>{settings.alias} / Photography</span></footer>
    </main>
  );
}
