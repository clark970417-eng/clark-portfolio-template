"use client";
import { FormEvent, useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("sending");
    const response = await fetch("/api/contact", { method: "POST", body: new FormData(event.currentTarget) });
    setState(response.ok ? "sent" : "error");
    if (response.ok) event.currentTarget.reset();
  }
  return <form className="contact-form" onSubmit={submit}>
    <label>Name<input name="name" autoComplete="name" required /></label>
    <label>Email<input name="email" type="email" autoComplete="email" required /></label>
    <label>Message<textarea name="message" rows={4} required /></label>
    <div className="form-action"><button disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}<span aria-hidden="true">↗</span></button><p role="status">{state === "sent" ? "Message sent." : state === "error" ? "Message could not be sent. Email Clark directly at clark970417@gmail.com." : ""}</p></div>
  </form>;
}
