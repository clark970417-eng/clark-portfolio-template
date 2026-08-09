import Link from "next/link";
import { getPublishedEvents } from "./portfolio-data";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await getPublishedEvents();
  const schoolEvents = events.filter((event) => event.category === "school");
  const outsideSchoolEvents = events.filter((event) => event.category === "outside-school");

  function EventGrid({ items }: { items: typeof events }) {
    return (
      <div className="contact-sheet">
        {items.map((event, index) => (
          <Link className={`event-card event-card-${(index % 5) + 1}`} href={`/events/${event.slug}`} key={event.id}>
            <div className="event-image">
              {event.coverUrl ? <img src={event.coverUrl} alt="" style={{ objectPosition: `${event.coverX}% ${event.coverY}%` }} loading={index === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "high" : "auto"} /> : <span className="empty-frame" />}
              <span className="frame-corner frame-corner-a" />
              <span className="frame-corner frame-corner-b" />
            </div>
            <div className="event-caption">
              <span className="event-number">{String(index + 1).padStart(2, "0")}</span>
              <h3>{event.title}</h3>
              <span className="event-open" aria-hidden="true">View ↗</span>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <main>
      <header className="site-header">
        <Link href="/" className="wordmark" aria-label="Clark Lo, home">CLARK LO</Link>
        <nav aria-label="Primary navigation">
          <a href="#academy">Academy</a>
          <a href="#cosplay">Cosplay</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-socials" aria-label="Social links">
          <a href="https://www.instagram.com/yin_0417.jpg/?hl=en" target="_blank" rel="noreferrer" aria-label="Clark Lo on Instagram">INS</a>
          <a href="https://x.com/4yuying?s=21&amp;t=h7d3UL9mlLZ0_H-FhiEjOQ" target="_blank" rel="noreferrer" aria-label="Clark Lo on X">X</a>
        </div>
      </header>

      <section className="hero" id="top" aria-labelledby="intro-title">
        <div className="hero-topline">
          <p className="hero-kicker">Taiwan — Photography</p>
          <p>School life · Performance · Community</p>
        </div>
        <h1 id="intro-title">I keep the moments<br />that usually pass.</h1>
        <div className="hero-note">
          <span className="hero-index">01</span>
          <p>I’m Clark, a Taiwan-based student photographer documenting school life, performance, and community.</p>
        </div>
        <a className="hero-scroll" href="#academy">Selected work <span aria-hidden="true">↓</span></a>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-title">
        {events.length ? (
          <div className="event-groups">
            <section className="event-group" id="academy" aria-labelledby="work-title">
              <div className="section-heading">
                <h2 id="work-title">Academy</h2>
                <div className="section-heading-meta"><p>{schoolEvents.length} {schoolEvents.length === 1 ? "story" : "stories"}</p><a className="section-back" href="/?home#top">Back ↑</a></div>
              </div>
              {schoolEvents.length ? <EventGrid items={schoolEvents} /> : <p className="group-empty">School stories will appear here.</p>}
            </section>

            <section className="event-group event-group-outside" id="cosplay" aria-labelledby="outside-work-title">
              <div className="section-heading">
                <h2 id="outside-work-title">Cosplay</h2>
                <div className="section-heading-meta"><p>{outsideSchoolEvents.length} {outsideSchoolEvents.length === 1 ? "story" : "stories"}</p><a className="section-back" href="/?home#top">Back ↑</a></div>
              </div>
              {outsideSchoolEvents.length ? <EventGrid items={outsideSchoolEvents} /> : <p className="group-empty">Outside-school stories will appear here.</p>}
            </section>
          </div>
        ) : (
          <div className="empty-archive">
            <div className="empty-frame-large"><span>Archive in progress</span></div>
            <div className="empty-copy">
              <span>01 / Selected work</span>
              <p>Your first event will appear here after you publish it from the studio.</p>
              <Link href="/studio">Open studio <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        )}
      </section>

      <section className="about-section" id="about">
        <div className="section-rail"><p className="section-label">02 / About</p><a className="section-back" href="/?home#top">Back ↑</a></div>
        <div className="about-copy">
          <p className="about-identity">Clark Lo 羅育穎 <span>— 4YUYING</span></p>
          <h2>I photograph the energy around an event—not only the moment on stage.</h2>
          <p className="about-statement">My work moves between school life, performances, trips, and cosplay gatherings. I look for gestures, expressions, and quiet transitions that reveal how a shared moment feels.</p>
          <dl className="about-facts">
            <div><dt>Photographer</dt><dd>Clark Lo</dd></div>
            <div><dt>Currently</dt><dd>Junior at Pacific American School</dd></div>
            <div><dt>Based in</dt><dd>Taiwan</dd></div>
            <div><dt>Focus</dt><dd>Academy · Cosplay · Community</dd></div>
          </dl>
          <div className="about-features">
            <div className="about-features-heading">
              <h3>Selected Features &amp; Official Use</h3>
              <span>04 entries</span>
            </div>
            <ol>
              <li>
                <a href="https://x.com/A_erukun/status/2020708829672112219?s=20" target="_blank" rel="noreferrer">
                  <span className="feature-source">eruk</span>
                  <span className="feature-title">Roxy / Mushoku Tensei at FF46</span>
                  <span className="feature-year">2026 <i aria-hidden="true">↗</i></span>
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/share/p/1JqoHXB3XR/" target="_blank" rel="noreferrer">
                  <span className="feature-source">Zakuro</span>
                  <span className="feature-title">Fuyuko at Comic Market 105</span>
                  <span className="feature-year">2024 <i aria-hidden="true">↗</i></span>
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/share/p/1CZzFs8RcV/" target="_blank" rel="noreferrer">
                  <span className="feature-source">Pacific American School</span>
                  <span className="feature-title">PASVEX Signature Event Campaign</span>
                  <span className="feature-year">2026 <i aria-hidden="true">↗</i></span>
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/share/p/1bQ8ZZocCP/" target="_blank" rel="noreferrer">
                  <span className="feature-source">Pacific American School</span>
                  <span className="feature-title">PASMUN Conference Coverage</span>
                  <span className="feature-year">2026 <i aria-hidden="true">↗</i></span>
                </a>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <div className="section-rail"><p className="section-label">03 / Contact</p><a className="section-back" href="/?home#top">Back ↑</a></div>
          <h2>Have something<br />in mind?</h2>
          <a className="social-link" href="https://x.com/4yuying" target="_blank" rel="noreferrer">X / @4yuying ↗</a>
        </div>
        <ContactForm />
      </section>

      <footer><span>© {new Date().getFullYear()} Clark Lo</span><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
