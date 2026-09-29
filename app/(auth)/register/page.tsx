"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
/** Firebase SDK baru di-load saat form dikirim */
const authClient = () => import("@/lib/auth-client");
import MathCaptcha, { type MathCaptchaHandle } from "../_components/MathCaptcha";
import {
  Alert, AuthHeading, Divider, DiscordButton, Field, PasswordField, StrengthMeter, SubmitButton, passwordScore,
} from "../_components/AuthUI";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [captchaOk, setCaptchaOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const captchaRef = useRef<MathCaptchaHandle>(null);

  const validate = () => {
    if (name.trim().length < 2) return "Display name must be at least 2 characters.";
    if (passwordScore(password) < 1) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords don't match.";
    if (!captchaOk) return "Solve the verification first.";
    if (!agree) return "Please accept the Terms and Privacy Policy.";
    return "";
  };

  const run = async (action: () => Promise<void>) => {
    setError("");
    setLoading(true);
    try {
      await action();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((await authClient()).authErrorMessage(err));
      captchaRef.current?.reset();
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeading
        eyebrow="Create account"
        title="Join the"
        gold="studio."
        desc="Your license keys and place bindings live in one account."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const problem = validate();
          if (problem) return setError(problem);
          run(async () => (await authClient()).signUp(name.trim(), email, password));
        }}
        className="space-y-5"
        noValidate
      >
        {error && <Alert>{error}</Alert>}

        <Field
          id="name"
          label="Display name"
          autoComplete="nickname"
          placeholder="kyzo_dev"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          required
        />
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

        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            placeholder="8+ characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordField
            id="confirm"
            label="Confirm"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <StrengthMeter password={password} />

        <MathCaptcha ref={captchaRef} onChange={setCaptchaOk} />

        <label className="flex cursor-pointer select-none items-start gap-3 text-sm text-muted">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="peer sr-only" />
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-line-strong text-transparent transition-colors peer-checked:border-gold peer-checked:bg-gold peer-checked:text-on-gold peer-focus-visible:ring-2 peer-focus-visible:ring-gold">
            <Check size={13} strokeWidth={3} />
          </span>
          <span>
            I agree to the{" "}
            <a href="#" className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-gold">Terms</a> and{" "}
            <a href="#" className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-gold">Privacy Policy</a>.
          </span>
        </label>

        <div className="pt-1">
          <SubmitButton loading={loading}>Create account</SubmitButton>
        </div>
      </form>

      <Divider>or</Divider>
      <DiscordButton label="Sign up with Discord" />

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
