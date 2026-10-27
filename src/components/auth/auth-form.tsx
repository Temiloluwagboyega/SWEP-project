"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { loginSchema, registerSchema } from "@/lib/validation";
import { HttpError, request } from "@/lib/http/client";
import { Button } from "@/components/ui/button";
import { ErrorSummary } from "@/components/ui/error-summary";
import { brand } from "@/config/brand";
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
      if (register)
        await request("/api/register", { method: "POST", body: parsed.data });
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (result?.error) {
        setError(
          result.code === "rate_limited"
            ? "Too many sign-in attempts. Please wait 15 minutes and try again."
            : register
              ? "Account created. Please sign in to continue."
              : "Email or password is incorrect. Check your details and try again.",
        );
        return;
      }
      window.location.assign("/reports");
    } catch (e) {
      setError(
        e instanceof HttpError
          ? e.message
          : "Unable to connect. Check your connection and try again.",
      );
      if (e instanceof HttpError) setFields(e.fields);
    } finally {
      setBusy(false);
    }
  }
  function fieldProps(name: string) {
    return {
      id: name,
      name,
      "aria-invalid": !!fields[name],
      "aria-describedby": fields[name] ? `${name}-error` : undefined,
    };
  }
  function fieldError(name: string) {
    return fields[name] ? (
      <p className="field-error" id={`${name}-error`}>
        {fields[name]}
      </p>
    ) : null;
  }
  return (
    <form className="form-stack" noValidate onSubmit={submit}>
      <ErrorSummary message={error} fields={fields} />
      {register && (
        <div className="form-field">
          <label htmlFor="name">Full name</label>
          <input
            {...fieldProps("name")}
            autoComplete="name"
            placeholder="Your full name…"
            required
            maxLength={100}
          />
          {fieldError("name")}
        </div>
      )}
      <div className="form-field">
        <label htmlFor="email">Email address</label>
        <input
          {...fieldProps("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          required
          maxLength={254}
        />
        {fieldError("email")}
      </div>
      <div className="form-field">
        <label htmlFor="password">Password</label>
        <div className="password-field">
          <input
            {...fieldProps("password")}
            type={visible ? "text" : "password"}
            autoComplete={register ? "new-password" : "current-password"}
            placeholder={
              register ? "At least 15 characters…" : "Enter your password…"
            }
            minLength={register ? 15 : 8}
            required
          />
          <button
            type="button"
            className="icon-button"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? (
              <EyeOff aria-hidden="true" size={19} />
            ) : (
              <Eye aria-hidden="true" size={19} />
            )}
          </button>
        </div>
        {fieldError("password")}
      </div>
      <Button type="submit" className="button-full" loading={busy}>
        {busy
          ? register
            ? "Creating account…"
            : "Signing in…"
          : register
            ? "Create student account"
            : "Sign in"}
        <ArrowRight aria-hidden="true" size={18} />
      </Button>
      <p className="auth-switch">
        {register ? "Already have an account?" : `New to ${brand.name}?`}{" "}
        <Link href={register ? "/login" : "/register"}>
          {register ? "Sign in" : "Create an account"}
        </Link>
      </p>
      <p className="auth-security">
        <LockKeyhole aria-hidden="true" size={15} />
        {register
          ? "Staff accounts are created by the project team."
          : "Your account gives you access to your own reports."}
      </p>
    </form>
  );
}
