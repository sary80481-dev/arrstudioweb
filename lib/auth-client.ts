"use client";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { firebaseAuth } from "./firebase/client";

/** Setelah login di Firebase, tukar ID token menjadi session cookie di server */
async function startSession(user: User, displayName?: string) {
  const idToken = await user.getIdToken(true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, displayName }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Could not start your session.");
  }
  // sesi sudah di cookie server; state Firebase di browser tidak dibutuhkan lagi
  await firebaseSignOut(firebaseAuth());
}

export async function signIn(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(firebaseAuth(), email, password);
  await startSession(user);
}

export async function signUp(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(firebaseAuth(), email, password);
  await updateProfile(user, { displayName: name });
  await startSession(user, name);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(firebaseAuth(), email);
}

export async function signOut() {
  await fetch("/api/auth/session", { method: "DELETE" });
  // tutup juga koneksi realtime (custom token) di browser
  await firebaseSignOut(firebaseAuth()).catch(() => {});
}

/** Pesan error Firebase → kalimat yang bisa dibaca user */
export function authErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Email or password is incorrect.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-email":
        return "That email address doesn't look right.";
      case "auth/weak-password":
        return "Password is too weak — use at least 8 characters.";
      case "auth/too-many-requests":
        return "Too many attempts. Wait a moment and try again.";
      case "auth/network-request-failed":
        return "Network error — check your connection.";
    }
    return "Authentication failed. Please try again.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}
