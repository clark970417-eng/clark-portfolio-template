"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type GoogleUser = {
  email: string;
};

type GoogleIdentityApi = {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
      renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
      disableAutoSelect: () => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

export function ContactForm({ contactEmail, googleClientId }: { contactEmail: string; googleClientId: string | null }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [credential, setCredential] = useState("");
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [authError, setAuthError] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!googleClientId || !buttonRef.current || user) return;
    let cancelled = false;

    async function initializeGoogle() {
      try {
        await loadGoogleIdentity();
        if (cancelled || !window.google || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential: nextCredential }) => {
            setAuthError("");
            const response = await fetch("/api/contact/identity", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ credential: nextCredential }),
            });
            const data = await response.json().catch(() => ({})) as GoogleUser & { error?: string };
            if (!response.ok) {
              setAuthError(data.error ?? "Google sign-in could not be verified.");
              return;
            }
            setCredential(nextCredential);
            setUser({ email: data.email });
          },
        });
        buttonRef.current.replaceChildren();
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 360,
        });
      } catch {
        setAuthError("Google sign-in could not be loaded.");
      }
    }

    void initializeGoogle();
    return () => { cancelled = true; };
  }, [googleClientId, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!credential) return;
    setState("sending");
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      form.set("googleCredential", credential);
      const response = await fetch("/api/contact", { method: "POST", body: form });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (response.ok) {
        setState("sent");
        setMessage("Message sent.");
        event.currentTarget.reset();
      } else {
        setState("error");
        setMessage(data.error ?? `Message could not be sent. Email Clark directly at ${contactEmail}.`);
        if (response.status === 401) {
          setCredential("");
          setUser(null);
        }
      }
    } catch {
      setState("error");
      setMessage(`Message could not be sent. Email Clark directly at ${contactEmail}.`);
    }
  }

  function signOut() {
    window.google?.accounts.id.disableAutoSelect();
    setCredential("");
    setUser(null);
    setMessage("");
    setState("idle");
  }

  if (!googleClientId) {
    return (
      <div className="contact-form contact-auth-panel">
        <p className="contact-auth-label">Verified messages only</p>
        <h3>Google sign-in is not configured yet.</h3>
        <p>Please email Clark directly at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="contact-form contact-auth-panel">
        <p className="contact-auth-label">Verified messages only</p>
        <h3>Sign in with Google before sending a message.</h3>
        <p>Your Google Account email is verified automatically and cannot be entered manually.</p>
        <div className="google-sign-in" ref={buttonRef} />
        {authError && <p className="contact-auth-error" role="status">{authError}</p>}
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-identity">
        <span>Verified Gmail</span>
        <strong>{user.email}</strong>
        <button type="button" onClick={signOut}>Use another Gmail account</button>
      </div>
      <label>Name<input name="name" type="text" minLength={1} maxLength={80} autoComplete="name" required /></label>
      <label>Message<textarea name="message" rows={4} minLength={2} maxLength={5000} required /></label>
      <div className="form-action">
        <button disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}<span aria-hidden="true">↗</span></button>
        <p className={state === "error" ? "is-error" : ""} role="status">{message}</p>
      </div>
    </form>
  );
}

function loadGoogleIdentity(): Promise<void> {
  if (window.google) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Identity failed to load")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.dataset.googleIdentity = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Identity failed to load"));
    document.head.appendChild(script);
  });
}
