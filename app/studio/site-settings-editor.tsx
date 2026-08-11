"use client";

import { FormEvent, useState } from "react";
import type { EditableSiteSettings, SiteSettings } from "../site-settings";

export function SiteSettingsEditor({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function set<K extends keyof EditableSiteSettings>(key: K, value: EditableSiteSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("Saving website content…");
    try {
      const response = await fetch("/api/studio/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Website content could not be saved.");
      setSettings(data.settings);
      setMessage("Website content saved. Refresh the public site to see it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Website content could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadProfilePhoto(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage("Preparing profile photo…");
    try {
      const prepared = await prepareProfilePhoto(file);
      const form = new FormData();
      form.append("photo", prepared, "profile.webp");
      setMessage("Uploading profile photo…");
      const response = await fetch("/api/studio/settings/profile-photo", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Profile photo could not be uploaded.");
      setSettings(data.settings);
      setMessage("Profile photo updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile photo could not be uploaded.");
    } finally {
      setBusy(false);
    }
  }

  async function removeProfilePhoto() {
    if (!confirm("Remove the profile photo from the About section?")) return;
    setBusy(true);
    try {
      const response = await fetch("/api/studio/settings/profile-photo", { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Profile photo could not be removed.");
      setSettings(data.settings);
      setMessage("Profile photo removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile photo could not be removed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="studio-content-settings">
      <div className="studio-content-intro">
        <div><p>Website content</p><h2>Edit the public portfolio</h2></div>
        <p>Change your name, homepage, About text, links, contact details, feature list, and profile photo here.</p>
      </div>

      <form onSubmit={save}>
        <fieldset>
          <legend>Identity &amp; navigation</legend>
          <div className="studio-settings-grid is-three">
            <label>Name<input value={settings.displayName} onChange={(event) => set("displayName", event.target.value)} /></label>
            <label>Chinese name<input value={settings.nativeName} onChange={(event) => set("nativeName", event.target.value)} /></label>
            <label>Alias<input value={settings.alias} onChange={(event) => set("alias", event.target.value)} /></label>
            <label>School section label<input value={settings.academyLabel} onChange={(event) => set("academyLabel", event.target.value)} /></label>
            <label>Cosplay section label<input value={settings.cosplayLabel} onChange={(event) => set("cosplayLabel", event.target.value)} /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Homepage</legend>
          <div className="studio-settings-grid">
            <label>Small introduction<input value={settings.heroEyebrow} onChange={(event) => set("heroEyebrow", event.target.value)} /></label>
            <label>Opening statement<textarea rows={3} value={settings.heroTitle} onChange={(event) => set("heroTitle", event.target.value)} /></label>
            <label className="is-wide">Supporting text<textarea rows={3} value={settings.heroIntro} onChange={(event) => set("heroIntro", event.target.value)} /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>About</legend>
          <div className="studio-profile-row">
            <div className={`studio-profile-preview${settings.profilePhotoUrl ? " has-photo" : ""}`}>
              {settings.profilePhotoUrl ? <img src={settings.profilePhotoUrl} alt="Current profile" /> : <span>No profile photo</span>}
            </div>
            <div><label className="studio-upload studio-profile-upload">Choose profile photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadProfilePhoto(event.target.files)} disabled={busy} /></label>{settings.profilePhotoUrl && <button type="button" className="studio-delete" onClick={removeProfilePhoto} disabled={busy}>Remove photo</button>}<p>Used in the About section. JPEG, PNG, or WebP.</p></div>
          </div>
          <div className="studio-settings-grid">
            <label>English biography<textarea rows={12} value={settings.aboutBioEn} onChange={(event) => set("aboutBioEn", event.target.value)} /></label>
            <label>Japanese biography<textarea rows={12} value={settings.aboutBioJa} onChange={(event) => set("aboutBioJa", event.target.value)} /></label>
            <label>Role<input value={settings.role} onChange={(event) => set("role", event.target.value)} /></label>
            <label>School<input value={settings.school} onChange={(event) => set("school", event.target.value)} /></label>
            <label>Based in<input value={settings.location} onChange={(event) => set("location", event.target.value)} /></label>
            <label>Focus<input value={settings.focus} onChange={(event) => set("focus", event.target.value)} /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Contact &amp; social links</legend>
          <div className="studio-settings-grid">
            <label>Contact headline<input value={settings.contactHeadline} onChange={(event) => set("contactHeadline", event.target.value)} /></label>
            <label>Contact email<input type="email" value={settings.contactEmail} onChange={(event) => set("contactEmail", event.target.value)} /></label>
            <label>Instagram URL<input type="url" value={settings.instagramUrl} onChange={(event) => set("instagramUrl", event.target.value)} /></label>
            <label>GitHub URL<input type="url" value={settings.githubUrl} onChange={(event) => set("githubUrl", event.target.value)} /></label>
            <label>X URL<input type="url" value={settings.xUrl} onChange={(event) => set("xUrl", event.target.value)} /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Selected features &amp; official use</legend>
          <label className="studio-feature-editor">One entry per line: Source | Title | Year | URL<textarea rows={8} value={settings.featuresText} onChange={(event) => set("featuresText", event.target.value)} /></label>
        </fieldset>

        <div className="studio-settings-actions"><button className="studio-button" disabled={busy}>{busy ? "Saving…" : "Save website content"}<span aria-hidden="true">↗</span></button><p role="status">{message}</p></div>
      </form>
    </section>
  );
}

async function prepareProfilePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Photo preparation is unavailable.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Profile photo could not be prepared.")), "image/webp", 0.82));
}
