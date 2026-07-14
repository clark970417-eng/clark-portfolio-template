import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedEvent } from "../../portfolio-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const event = await getPublishedEvent((await params).slug);
  return { title: event?.title ?? "Event" };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const event = await getPublishedEvent((await params).slug);
  if (!event) notFound();
  return <main className="event-page">
    <header className="event-header">
      <div className="event-header-nav"><Link href="/">Clark Lo</Link><Link href="/#work">← All events</Link></div>
      <div className="event-title-block">
        <p>Photo essay / {String(event.photos.length).padStart(2, "0")} photographs</p>
        <h1>{event.title}</h1>
      </div>
      <p className="event-intro">A visual record of the gestures, atmosphere, and moments between the official ones.</p>
    </header>
    {event.photos.length ? <div className="event-gallery">{event.photos.map((photo, index) => <figure key={photo.id}><img src={photo.url} alt={photo.alt || `${event.title} photograph ${index + 1}`} draggable={false} loading={index < 3 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "high" : "auto"} /><figcaption>{String(index + 1).padStart(2, "0")}</figcaption></figure>)}</div> : <p className="event-empty">No photographs have been added to this event yet.</p>}
    <footer className="event-footer"><Link href="/#work">← Selected work</Link><span>Clark Lo / Photography</span></footer>
  </main>;
}
