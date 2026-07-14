"use client";

import { FormEvent, useEffect, useState } from "react";

type EventCategory = "school" | "outside-school";
type EventItem = {
  id: string;
  title: string;
  slug: string;
  category: EventCategory;
  status: string;
  position: number;
  photoCount: number;
};
type PhotoItem = { id: string; alt: string; url: string; position: number };

export function Studio({ initialEvents, signOutPath }: { initialEvents: EventItem[]; signOutPath: string }) {
  const [events, setEvents] = useState(initialEvents);
  const [photos, setPhotos] = useState<Record<string, PhotoItem[]>>({});
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [confirmPhotoId, setConfirmPhotoId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ eventId: string; photoId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const lightboxPhotos = lightbox ? (photos[lightbox.eventId] ?? []) : [];
  const lightboxIndex = lightbox ? lightboxPhotos.findIndex((photo) => photo.id === lightbox.photoId) : -1;
  const lightboxPhoto = lightboxIndex >= 0 ? lightboxPhotos[lightboxIndex] : null;
  const lightboxEvent = lightbox ? events.find((item) => item.id === lightbox.eventId) : null;

  useEffect(() => {
    if (!lightbox) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft" && lightboxIndex > 0) {
        setLightbox({ eventId: lightbox.eventId, photoId: lightboxPhotos[lightboxIndex - 1].id });
      }
      if (event.key === "ArrowRight" && lightboxIndex < lightboxPhotos.length - 1) {
        setLightbox({ eventId: lightbox.eventId, photoId: lightboxPhotos[lightboxIndex + 1].id });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightbox, lightboxIndex, lightboxPhotos]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const formElement = event.currentTarget;
    try {
      const response = await fetch("/api/studio/events", { method: "POST", body: new FormData(formElement) });
      const data = await response.json().catch(() => ({ error: "The draft could not be created." }));
      if (response.ok) {
        setEvents((current) => [...current, data.event]);
        formElement.reset();
        setMessage("Draft created.");
      } else setMessage(data.error);
    } catch {
      setMessage("The draft could not be created.");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: string, action: "publish" | "draft" | "delete") {
    setBusy(true);
    try {
      const response = await fetch(`/api/studio/events/${id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "content-type": "application/json" },
        body: action === "delete" ? undefined : JSON.stringify({ status: action === "publish" ? "published" : "draft" }),
      });
      if (response.ok) {
        setEvents((current) => action === "delete"
          ? current.filter((item) => item.id !== id)
          : current.map((item) => item.id === id ? { ...item, status: action === "publish" ? "published" : "draft" } : item));
        setMessage(action === "delete" ? "Event deleted." : action === "publish" ? "Published." : "Moved to draft.");
      } else setMessage("The event could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  async function updateCategory(id: string, category: EventCategory) {
    setBusy(true);
    try {
      const response = await fetch(`/api/studio/events/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ category }) });
      if (response.ok) {
        setEvents((current) => current.map((item) => item.id === id ? { ...item, category } : item));
        setMessage("Category updated.");
      } else setMessage("The category could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  function startTitleEdit(item: EventItem) {
    setEditingTitleId(item.id);
    setTitleDraft(item.title);
  }

  async function saveTitle(id: string) {
    const title = titleDraft.trim();
    if (!title) return setMessage("Add an event title.");
    setBusy(true);
    try {
      const response = await fetch(`/api/studio/events/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title }) });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setEvents((current) => current.map((item) => item.id === id ? { ...item, title: data.title } : item));
        setEditingTitleId(null);
        setMessage("Title saved.");
      } else setMessage(data.error ?? "The title could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function moveEvent(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= events.length) return;
    const previous = events;
    const next = [...events];
    [next[index], next[target]] = [next[target], next[index]];
    setEvents(next);
    setBusy(true);
    try {
      const response = await fetch("/api/studio/events", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: next.map((item) => item.id) }) });
      if (response.ok) setMessage("Event order saved.");
      else {
        setEvents(previous);
        setMessage("The event order could not be saved.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function loadPhotos(eventId: string, refresh = false) {
    if (!refresh && photos[eventId]) return;
    const response = await fetch(`/api/studio/events/${eventId}/photos`);
    const data = await response.json().catch(() => ({ photos: [] }));
    if (response.ok) setPhotos((current) => ({ ...current, [eventId]: data.photos }));
    else setMessage(data.error ?? "Photos could not be loaded.");
  }

  async function togglePhotos(eventId: string) {
    if (openEventId === eventId) {
      setLightbox(null);
      return setOpenEventId(null);
    }
    setOpenEventId(eventId);
    await loadPhotos(eventId);
  }

  async function upload(eventId: string, files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const selectedFiles = Array.from(files);
    let uploadedCount = 0;
    const failedFiles: string[] = [];
    for (const [index, file] of selectedFiles.entries()) {
      setMessage(`Preparing photo ${index + 1} of ${selectedFiles.length}…`);
      try {
        const prepared = await preparePhoto(file);
        const form = new FormData();
        form.append("photos", prepared, `${file.name.replace(/\.[^.]+$/, "")}.webp`);
        setMessage(`Uploading photo ${index + 1} of ${selectedFiles.length}…`);
        const response = await fetch(`/api/studio/events/${eventId}/photos`, { method: "POST", body: form });
        const responseText = await response.text();
        const data = responseText.startsWith("{") ? JSON.parse(responseText) : { error: responseText };
        if (!response.ok) throw new Error(data.error || "Upload failed");
        uploadedCount += data.count;
      } catch {
        failedFiles.push(file.name);
      }
    }
    try {
      if (uploadedCount) {
        setEvents((current) => current.map((item) => item.id === eventId ? { ...item, photoCount: item.photoCount + uploadedCount } : item));
        await loadPhotos(eventId, true);
        setOpenEventId(eventId);
      }
      if (failedFiles.length) setMessage(`${uploadedCount} uploaded. ${failedFiles.length} failed: ${failedFiles.join(", ")}. Try exporting failed files as JPEG.`);
      else setMessage(`${uploadedCount} photo${uploadedCount === 1 ? "" : "s"} added.`);
    } finally {
      setBusy(false);
    }
  }

  async function movePhoto(eventId: string, index: number, offset: -1 | 1) {
    const list = photos[eventId] ?? [];
    const target = index + offset;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    setPhotos((current) => ({ ...current, [eventId]: next }));
    setBusy(true);
    try {
      const response = await fetch(`/api/studio/events/${eventId}/photos`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: next.map((photo) => photo.id) }) });
      if (response.ok) setMessage("Photo order saved. The first photo is the cover.");
      else {
        setPhotos((current) => ({ ...current, [eventId]: list }));
        setMessage("The photo order could not be saved.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function setCover(eventId: string, index: number) {
    const list = photos[eventId] ?? [];
    if (index <= 0 || index >= list.length) return;
    const next = [list[index], ...list.slice(0, index), ...list.slice(index + 1)];
    setPhotos((current) => ({ ...current, [eventId]: next }));
    setBusy(true);
    try {
      const response = await fetch(`/api/studio/events/${eventId}/photos`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: next.map((photo) => photo.id) }) });
      if (response.ok) setMessage("Cover selected. It is now photo 01.");
      else {
        setPhotos((current) => ({ ...current, [eventId]: list }));
        setMessage("The cover could not be changed.");
      }
    } finally {
      setBusy(false);
    }
  }

  function editPhotoAlt(eventId: string, photoId: string, alt: string) {
    setPhotos((current) => ({ ...current, [eventId]: (current[eventId] ?? []).map((photo) => photo.id === photoId ? { ...photo, alt } : photo) }));
  }

  async function savePhotoAlt(eventId: string, photo: PhotoItem) {
    setBusy(true);
    try {
      const response = await fetch(`/api/studio/events/${eventId}/photos/${photo.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ alt: photo.alt }) });
      if (response.ok) setMessage("Photo description saved.");
      else setMessage("The photo description could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePhoto(eventId: string, photoId: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/studio/events/${eventId}/photos/${photoId}`, { method: "DELETE" });
      if (response.ok) {
        setPhotos((current) => ({ ...current, [eventId]: (current[eventId] ?? []).filter((photo) => photo.id !== photoId) }));
        setEvents((current) => current.map((item) => item.id === eventId ? { ...item, photoCount: Math.max(0, item.photoCount - 1) } : item));
        if (lightbox?.photoId === photoId) setLightbox(null);
        setConfirmPhotoId(null);
        setMessage("Photo deleted.");
      } else setMessage("The photo could not be deleted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <div><p>Private studio</p><h1>Clark Lo</h1></div>
        <div><a href="/">View site ↗</a><a href={signOutPath}>Sign out</a></div>
      </header>

      <section className="studio-new">
        <h2>New event</h2>
        <form onSubmit={create}>
          <label>Event title<input name="title" required placeholder="e.g. Sports Day" /></label>
          <label>Category<select name="category" defaultValue="school"><option value="school">School activity</option><option value="outside-school">Outside-of-school activity</option></select></label>
          <button className="studio-button" disabled={busy}>Create draft <span>↗</span></button>
        </form>
      </section>

      <section className="studio-events">
        <div className="studio-section-title"><h2>Events</h2><span>{events.length}</span><p>Use the arrows to set the order shown on the site.</p></div>
        {events.length ? events.map((item, index) => (
          <article className="studio-event-block" key={item.id}>
            <div className="studio-event">
              <div className="studio-order">
                <span className="studio-index">{String(index + 1).padStart(2, "0")}</span>
                <div><button aria-label={`Move ${item.title} up`} onClick={() => moveEvent(index, -1)} disabled={busy || index === 0}>↑</button><button aria-label={`Move ${item.title} down`} onClick={() => moveEvent(index, 1)} disabled={busy || index === events.length - 1}>↓</button></div>
              </div>
              <div className="studio-event-name">
                {editingTitleId === item.id ? (
                  <div className="studio-title-editor"><input aria-label="Event title" value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} /><button onClick={() => saveTitle(item.id)} disabled={busy}>Save</button><button onClick={() => setEditingTitleId(null)} disabled={busy}>Cancel</button></div>
                ) : <div className="studio-title-line"><h3>{item.title}</h3><button onClick={() => startTitleEdit(item)}>Edit title</button></div>}
                <p>{item.photoCount} photos · {item.status}</p>
              </div>
              <select className="studio-category" aria-label={`${item.title} category`} value={item.category} onChange={(event) => updateCategory(item.id, event.target.value as EventCategory)} disabled={busy}><option value="school">School</option><option value="outside-school">Outside school</option></select>
              <button className="studio-manage" onClick={() => togglePhotos(item.id)} aria-expanded={openEventId === item.id}>{openEventId === item.id ? "Close photos" : "Manage photos"}</button>
              <label className="studio-upload">Add photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => upload(item.id, event.target.files)} /></label>
              <button onClick={() => updateStatus(item.id, item.status === "published" ? "draft" : "publish")} disabled={busy}>{item.status === "published" ? "Unpublish" : "Publish"}</button>
              <button className="studio-delete" onClick={() => updateStatus(item.id, "delete")} disabled={busy}>Delete</button>
            </div>

            {openEventId === item.id && (
              <div className="photo-manager">
                <div className="photo-manager-heading"><div><p>Contact sheet</p><h3>{item.title}</h3></div><p>Move a photo to position 01 to use it as the cover.</p></div>
                {(photos[item.id] ?? []).length ? (
                  <div className="photo-editor-grid">
                    {(photos[item.id] ?? []).map((photo, photoIndex) => (
                      <article className="photo-editor-card" key={photo.id}>
                        <button className="photo-editor-image" type="button" onClick={() => setLightbox({ eventId: item.id, photoId: photo.id })} aria-label={`Open photo ${photoIndex + 1} in full view`}>
                          <img src={photo.url} alt="" />
                          <span>{photoIndex === 0 ? "Cover" : String(photoIndex + 1).padStart(2, "0")}</span>
                          <strong>View detail</strong>
                        </button>
                        <div className={`photo-cover-action${photoIndex === 0 ? " is-cover" : ""}`}>{photoIndex === 0 ? <span>Current cover</span> : <button onClick={() => setCover(item.id, photoIndex)} disabled={busy}>Set as cover</button>}</div>
                        <div className="photo-editor-actions"><button aria-label={`Move photo ${photoIndex + 1} earlier`} onClick={() => movePhoto(item.id, photoIndex, -1)} disabled={busy || photoIndex === 0}>← Earlier</button><button aria-label={`Move photo ${photoIndex + 1} later`} onClick={() => movePhoto(item.id, photoIndex, 1)} disabled={busy || photoIndex === (photos[item.id]?.length ?? 0) - 1}>Later →</button></div>
                        <label>Description<input value={photo.alt} onChange={(event) => editPhotoAlt(item.id, photo.id, event.target.value)} placeholder="What is happening in this photograph?" /></label>
                        <div className="photo-editor-footer"><button onClick={() => savePhotoAlt(item.id, photo)} disabled={busy}>Save description</button>{confirmPhotoId === photo.id ? <span><button className="studio-delete" onClick={() => deletePhoto(item.id, photo.id)} disabled={busy}>Confirm delete</button><button onClick={() => setConfirmPhotoId(null)}>Cancel</button></span> : <button className="studio-delete" onClick={() => setConfirmPhotoId(photo.id)}>Delete photo</button>}</div>
                      </article>
                    ))}
                  </div>
                ) : <p className="photo-manager-empty">No photos yet. Choose “Add photos” to start this story.</p>}
              </div>
            )}
          </article>
        )) : <p className="studio-empty">Create your first event, then add the photographs you want to share.</p>}
      </section>
      {lightbox && lightboxPhoto && lightboxEvent && (
        <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={`Photo detail from ${lightboxEvent.title}`} onClick={() => setLightbox(null)}>
          <div className="photo-lightbox-frame" onClick={(event) => event.stopPropagation()}>
            <header>
              <div><span>Photo detail</span><h2>{lightboxEvent.title}</h2></div>
              <p>{String(lightboxIndex + 1).padStart(2, "0")} / {String(lightboxPhotos.length).padStart(2, "0")}</p>
              <button type="button" onClick={() => setLightbox(null)} aria-label="Close photo detail">Close ×</button>
            </header>
            <div className="photo-lightbox-stage">
              <button type="button" className="photo-lightbox-nav is-previous" aria-label="Previous photo" disabled={lightboxIndex === 0} onClick={() => setLightbox({ eventId: lightbox.eventId, photoId: lightboxPhotos[lightboxIndex - 1].id })}>←</button>
              <img src={lightboxPhoto.url} alt={lightboxPhoto.alt || `Photo ${lightboxIndex + 1} from ${lightboxEvent.title}`} />
              <button type="button" className="photo-lightbox-nav is-next" aria-label="Next photo" disabled={lightboxIndex === lightboxPhotos.length - 1} onClick={() => setLightbox({ eventId: lightbox.eventId, photoId: lightboxPhotos[lightboxIndex + 1].id })}>→</button>
            </div>
            <footer><p>{lightboxPhoto.alt || "No description yet."}</p><span>Use ← → keys to browse · Esc to close</span></footer>
          </div>
        </div>
      )}
      <p className="studio-status" role="status">{message}</p>
    </main>
  );
}

async function preparePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const max = 2200;
  let scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  const targetBytes = 800 * 1024;
  let quality = 0.82;
  let blob: Blob | null = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    blob = await canvasToBlob(canvas, quality);
    if (blob.size <= targetBytes) break;
    if (quality > 0.62) quality -= 0.08;
    else {
      scale *= 0.82;
      quality = 0.76;
    }
  }

  bitmap.close();
  if (!blob || blob.size > targetBytes) throw new Error("Photo could not be reduced below the upload limit");
  return blob;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Conversion failed")), "image/webp", quality));
}
