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
        <p>Selected archive / 2025—2026</p>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="intro-title">
        <div className="hero-topline">
          <p className="hero-kicker">Taiwan — Photography</p>
          <p>School life · Performance · Community</p>
        </div>
        <h1 id="intro-title">I keep the moments<br />that usually pass.</h1>
        <div className="hero-note">
          <span className="hero-index">01</span>
          <p>I’m Clark, a Taiwan-based student photographer documenting school life, performance, and community.</p>
        </div>
        <a className="hero-scroll" href="#work">Selected work <span aria-hidden="true">↓</span></a>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-title">
        {events.length ? (
          <div className="event-groups">
            <section className="event-group" aria-labelledby="work-title">
              <div className="section-heading">
                <h2 id="work-title">School activities</h2>
                <p>{schoolEvents.length} {schoolEvents.length === 1 ? "story" : "stories"}</p>
              </div>
              {schoolEvents.length ? <EventGrid items={schoolEvents} /> : <p className="group-empty">School stories will appear here.</p>}
            </section>

            <section className="event-group event-group-outside" aria-labelledby="outside-work-title">
              <div className="section-heading">
                <h2 id="outside-work-title">Outside-of-school activities</h2>
                <p>{outsideSchoolEvents.length} {outsideSchoolEvents.length === 1 ? "story" : "stories"}</p>
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
        <p className="section-label">02 / About</p>
        <div>
          <h2>I photograph the energy around an event—not only the moment on stage.</h2>
          <p>My work moves between school life, performances, trips, and cosplay gatherings. I look for gestures, expressions, and quiet transitions that reveal how a shared moment feels.</p>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <p className="section-label">03 / Contact</p>
          <h2>Have something<br />in mind?</h2>
          <a className="social-link" href="https://x.com/4yuying" target="_blank" rel="noreferrer">X / @4yuying ↗</a>
        </div>
        <ContactForm />
      </section>

      <footer><span>© {new Date().getFullYear()} Clark Lo</span><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
