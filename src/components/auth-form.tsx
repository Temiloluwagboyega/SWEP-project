"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Loader2 } from "lucide-react";
import { loginSchema, registerSchema } from "@/lib/validation";
export function AuthForm({ register = false }: { register?: boolean }) {
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFields({});
    const form = new FormData(event.currentTarget);
    const values = {
      email: String(form.get("email")),
      password: String(form.get("password")),
      ...(register ? { name: String(form.get("name")) } : {}),
    };
    const parsed = (register ? registerSchema : loginSchema).safeParse(values);
    if (!parsed.success) {
      setFields(
        Object.fromEntries(
          parsed.error.issues.map((i) => [i.path.join("."), i.message]),
        ),
      );
      return;
    }
    setBusy(true);
    try {
      if (register) {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        const body = await response.json();
        if (!response.ok) {
          setError(body.error);
          setFields(body.fields ?? {});
          return;
        }
      }
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (result?.error) {
        setError(
          register
            ? "Account created. Please sign in to continue."
            : "Email or password is incorrect. Please try again.",
        );
        return;
      }
      // A server page resolves the destination from the authoritative account role.
      window.location.assign("/reports");
    } catch {
      setError("Unable to connect. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} noValidate className="form-stack">
      {error && (
        <div role="alert" className="form-error">
          {error}
        </div>
      )}
      {register && (
        <label>
          Full name
          <input
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={!!fields.name}
            aria-describedby={fields.name ? "name-error" : undefined}
            required
          />
          {fields.name && (
            <span id="name-error" className="field-error">
              {fields.name}
            </span>
          )}
        </label>
      )}
      <label>
        Email address
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          aria-invalid={!!fields.email}
          aria-describedby={fields.email ? "email-error" : undefined}
        />
        {fields.email && (
          <span id="email-error" className="field-error">
            {fields.email}
          </span>
        )}
      </label>
      <label>
        Password
        <div className="password-field">
          <input
            name="password"
            type={visible ? "text" : "password"}
            autoComplete={register ? "new-password" : "current-password"}
            placeholder={
              register ? "At least 8 characters" : "Enter your password"
            }
            required
            minLength={8}
            aria-invalid={!!fields.password}
            aria-describedby={fields.password ? "password-error" : undefined}
          />
          <button
            type="button"
            className="icon-button"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {fields.password && (
          <span id="password-error" className="field-error">
            {fields.password}
          </span>
        )}
      </label>
      <button disabled={busy} className="button button-primary button-full">
        {busy ? <Loader2 className="spin" size={18} /> : null}
        {busy
          ? "Please wait…"
          : register
            ? "Create student account"
            : "Sign in"}
        <ArrowRight size={17} />
      </button>
      <p className="auth-switch">
        {register ? "Already have an account?" : "New to CampusGuard?"}{" "}
        <Link href={register ? "/login" : "/register"}>
          {register ? "Sign in" : "Create an account"}
        </Link>
      </p>
      <div className="auth-security">
        <LockKeyhole size={14} />
        {register
          ? "Staff accounts are created by the project team."
          : "Your account gives you access to your own reports."}
      </div>
    </form>
  );
}
