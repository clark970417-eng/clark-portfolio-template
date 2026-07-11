import Link from "next/link";
import { getPublishedEvents } from "./portfolio-data";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await getPublishedEvents();

  return (
    <main>
      <header className="site-header">
        <Link href="/" className="wordmark" aria-label="Clark Lo, home">CLARK LO</Link>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="intro-title">
        <p className="hero-kicker">Taiwan — Photography</p>
        <h1 id="intro-title">I keep the moments<br />that usually pass.</h1>
        <div className="hero-note">
          <span className="focus-mark" aria-hidden="true" />
          <p>I’m Clark, a Taiwan-based high school student and photography enthusiast.</p>
        </div>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-title">
        <div className="section-heading">
          <h2 id="work-title">Selected events</h2>
          <p>{events.length ? `${events.length} stories` : "The archive begins here"}</p>
        </div>

        {events.length ? (
          <div className="contact-sheet">
            {events.map((event, index) => (
              <Link className={`event-card event-card-${(index % 5) + 1}`} href={`/events/${event.slug}`} key={event.id}>
                <div className="event-image">
                  {event.coverUrl ? <img src={event.coverUrl} alt="" /> : <span className="empty-frame" />}
                  <span className="frame-corner frame-corner-a" />
                  <span className="frame-corner frame-corner-b" />
                </div>
                <div className="event-caption">
                  <h3>{event.title}</h3>
                  <span aria-hidden="true">↗</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-archive">
            <div className="empty-frame-large"><span>FRAME 001</span></div>
            <p>Your first event will appear here after you publish it from the studio.</p>
            <Link href="/studio">Open studio <span aria-hidden="true">↗</span></Link>
          </div>
        )}
      </section>

      <section className="about-section" id="about">
        <p className="section-label">About</p>
        <div>
          <h2>Photography helps me notice what a busy day leaves behind.</h2>
          <p>I photograph events, ordinary places, and the small gestures between people. This is a growing record of how I see.</p>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <p className="section-label">Contact</p>
          <h2>Have something<br />in mind?</h2>
          <a className="social-link" href="https://x.com/4yuying" target="_blank" rel="noreferrer">X / @4yuying ↗</a>
        </div>
        <ContactForm />
      </section>

      <footer><span>© {new Date().getFullYear()} Clark Lo</span><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
