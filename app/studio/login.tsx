"use client";
import { FormEvent, useState } from "react";

export function StudioLogin() {
  const [email, setEmail] = useState("clark970417@gmail.com");
  const [code, setCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/studio/auth/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessionId(data.sessionId);
        setStep("code");
        setMessage("Verification code sent to your Gmail.");
      } else {
        setError(data.error || "Failed to send code.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/studio/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, code }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Verification successful! Redirecting...");
        // Reload to update authentication state
        window.location.reload();
      } else {
        setError(data.error || "Invalid verification code.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="studio-shell">
      <div className="studio-login-container">
        <div className="studio-login-card">
          {step === "email" ? (
            <form onSubmit={handleSendCode}>
              <h2>Private Studio</h2>
              <p>Please verify your email to access the administration interface.</p>
              <label>
                Gmail Address
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. your-email@gmail.com"
                  disabled={loading}
                />
              </label>
              <button className="studio-button" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Verification Code"} <span>→</span>
              </button>
              {error && <div className="error-message">{error}</div>}
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <h2>Verify Code</h2>
              <p>Enter the 6-digit code sent to <strong>{email}</strong>.</p>
              <label>
                Verification Code
                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  disabled={loading}
                  autoFocus
                />
              </label>
              <button className="studio-button" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Login"} <span>→</span>
              </button>
              <a
                href="#"
                className="back-link"
                onClick={(e) => {
                  e.preventDefault();
                  setStep("email");
                  setCode("");
                  setError("");
                  setMessage("");
                }}
              >
                Back to Email
              </a>
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
