"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DISCORD_ERRORS } from "@/lib/auth-errors";

/** Firebase SDK baru di-load saat form dikirim — halaman login terbuka lebih cepat */
const authClient = () => import("@/lib/auth-client");
import { Alert, AuthHeading, Divider, DiscordButton, Field, PasswordField, SubmitButton } from "../_components/AuthUI";

/** Error dari redirect callback Discord (?error=...) */
function DiscordError() {
  const code = useSearchParams().get("error");
  return code && DISCORD_ERRORS[code] ? <Alert>{DISCORD_ERRORS[code]}</Alert> : null;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const run = async (action: () => Promise<void>) => {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await action();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((await authClient()).authErrorMessage(err));
      setLoading(false);
    }
  };

  const onForgot = async () => {
    setError("");
    setNotice("");
    if (!email) {
      setError("Enter your email first, then tap “Forgot?”.");
      return;
    }
    try {
      await (await authClient()).resetPassword(email);
      setNotice(`If an account exists for ${email}, a reset link is on its way.`);
    } catch (err) {
      setError((await authClient()).authErrorMessage(err));
    }
  };

  return (
    <>
      <AuthHeading eyebrow="Sign in" title="Welcome" gold="back." desc="Manage your licenses and the places they're bound to." />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => (await authClient()).signIn(email, password));
        }}
        className="space-y-5"
        noValidate
      >
        <Suspense>
          <DiscordError />
        </Suspense>
        {error && <Alert>{error}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}

        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@studio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aside={
            <button
              type="button"
              onClick={onForgot}
              className="text-xs font-medium text-dim transition-colors hover:text-gold"
            >
              Forgot?
            </button>
          }
        />

        <div className="pt-2">
          <SubmitButton loading={loading}>Sign in</SubmitButton>
        </div>
      </form>

      <Divider>or</Divider>
      <DiscordButton />

      <p className="mt-8 text-center text-sm text-muted">
        New to ArrStudio?{" "}
        <Link href="/register" className="font-semibold text-gold hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
