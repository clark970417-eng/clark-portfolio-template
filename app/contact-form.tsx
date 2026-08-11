"use client";

import { FormEvent, useState } from "react";

type ContactUser = {
  displayName: string;
  email: string;
};

export function ContactForm({
  contactEmail,
  signInPath,
  user,
}: {
  contactEmail: string;
  signInPath: string;
  user: ContactUser | null;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!user) {
    return (
      <div className="contact-form contact-auth-panel">
        <p className="contact-auth-label">Verified messages only</p>
        <h3>Sign in before sending a message.</h3>
        <p>Your account email is verified automatically and is never entered manually.</p>
        <a className="contact-sign-in" href={signInPath}>Sign in with ChatGPT <span aria-hidden="true">↗</span></a>
      </div>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    try {
      const response = await fetch("/api/contact", { method: "POST", body: new FormData(event.currentTarget) });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (response.ok) {
        setState("sent");
        setMessage("Message sent.");
        event.currentTarget.reset();
      } else {
        setState("error");
        setMessage(data.error ?? `Message could not be sent. Email Clark directly at ${contactEmail}.`);
      }
    } catch {
      setState("error");
      setMessage(`Message could not be sent. Email Clark directly at ${contactEmail}.`);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-identity">
        <span>Signed in as</span>
        <strong>{user.displayName}</strong>
        <small>{user.email}</small>
      </div>
      <label>Message<textarea name="message" rows={4} minLength={2} maxLength={5000} required /></label>
      <div className="form-action">
        <button disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}<span aria-hidden="true">↗</span></button>
        <p className={state === "error" ? "is-error" : ""} role="status">{message}</p>
      </div>
    </form>
  );
}
