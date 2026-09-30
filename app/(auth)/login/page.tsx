"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DISCORD_ERRORS } from "@/lib/auth-errors";

/** Firebase SDK baru di-load saat form dikirim — halaman login terbuka lebih cepat */
const authClient = () => import("@/lib/auth-client");
import { Alert, AuthHeading, Divider, DiscordButton, Field, PasswordField, SubmitButton, safeNext } from "../_components/AuthUI";

/** Tujuan setelah login (?next=, mis. kembali ke kit yang mau dibeli) */
const nextPath = () => safeNext(new URLSearchParams(window.location.search).get("next")) ?? "/dashboard";

function DiscordWithNext() {
  return <DiscordButton next={safeNext(useSearchParams().get("next"))} />;
}

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
      router.push(nextPath());
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
      setError("Enter your email first, then tap “Forgot password?”.");
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
      <AuthHeading title="Welcome back" desc="Sign in to manage your licenses and the places they're bound to." />

      <Suspense fallback={<DiscordButton />}>
        <DiscordWithNext />
      </Suspense>
      <Divider>or sign in with email</Divider>

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
              className="text-[15px] text-gold transition-colors hover:underline hover:underline-offset-4"
            >
              Forgot password?
            </button>
          }
        />

        <div className="pt-1">
          <SubmitButton loading={loading}>Sign in</SubmitButton>
        </div>
      </form>

      <p className="mt-9 text-center text-[15px] text-muted">
        New to ArrStudio?{" "}
        <Link href="/register" className="font-medium text-gold hover:underline hover:underline-offset-4">
          Create an account
        </Link>
      </p>
    </>
  );
}
