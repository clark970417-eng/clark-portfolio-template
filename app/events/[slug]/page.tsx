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
    <header className="event-header"><Link href="/">← All events</Link><h1>{event.title}</h1></header>
    {event.photos.length ? <div className="event-gallery">{event.photos.map((photo, index) => <figure key={photo.id}><img src={photo.url} alt={photo.alt || `${event.title} photograph`} draggable={false} loading={index === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "high" : "auto"} /></figure>)}</div> : <p className="event-empty">No photographs have been added to this event yet.</p>}
  </main>;
}
