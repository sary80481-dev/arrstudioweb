"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/* Konfigurasi web app Firebase — nilai publik, aman untuk browser */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | undefined;

function firebaseApp(): FirebaseApp {
  if (!firebaseConfigured) {
    throw new Error("Firebase belum dikonfigurasi: set NEXT_PUBLIC_FIREBASE_* di .env.");
  }
  return (app ??= getApps().length ? getApp() : initializeApp(config));
}

export const firebaseAuth = (): Auth => getAuth(firebaseApp());

/** Firestore di browser — hanya untuk membaca realtime (onSnapshot); semua penulisan lewat API */
export const firestore = (): Firestore => getFirestore(firebaseApp());
