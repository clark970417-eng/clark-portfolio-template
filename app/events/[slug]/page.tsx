import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getPublishedEvent } from "../../portfolio-data";

export const dynamic = "force-dynamic";
const getEvent = cache((slug: string) => getPublishedEvent(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  return { title: event?.title ?? "Event" };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const event = await getEvent((await params).slug);
  if (!event) notFound();
  const [leadPhoto, ...galleryPhotos] = event.photos;
  return <main className="event-page">
    <header className="event-header">
      <div className="event-header-nav"><Link href="/">Clark Lo</Link><Link href="/#work">← All events</Link></div>
      <div className="event-title-block">
        <p>Photo essay / {String(event.photos.length).padStart(2, "0")} photographs</p>
        <h1>{event.title}</h1>
      </div>
    </header>
    {leadPhoto ? <>
      <div className="event-lead"><figure><img src={leadPhoto.url} alt={leadPhoto.alt || `${event.title} photograph 1`} width={leadPhoto.width ?? undefined} height={leadPhoto.height ?? undefined} draggable={false} loading="eager" decoding="async" fetchPriority="high" /></figure></div>
      {galleryPhotos.length > 0 && <div className="event-gallery">{galleryPhotos.map((photo, index) => <figure key={photo.id}><img src={photo.url} alt={photo.alt || `${event.title} photograph ${index + 2}`} width={photo.width ?? undefined} height={photo.height ?? undefined} draggable={false} loading="lazy" decoding="async" /><figcaption>{String(index + 2).padStart(2, "0")}</figcaption></figure>)}</div>}
    </> : <p className="event-empty">No photographs have been added to this event yet.</p>}
    <footer className="event-footer"><Link href="/#work">← Selected work</Link><span>Clark Lo / Photography</span></footer>
  </main>;
}
