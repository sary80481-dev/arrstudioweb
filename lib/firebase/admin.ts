import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK — hanya dipakai di server (route handler / server component).
 * Kredensial service account dibaca dari env, lihat .env.example.
 */
function createApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // private key di .env biasanya berisi "\n" literal; di dashboard Vercel sering ikut
  // tertempel dengan tanda kutip pembungkus — keduanya dinormalkan di sini
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim()
    .replace(/^(['"])([\s\S]*)\1$/, "$2")
    .replace(/\\r/g, "")
    .replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin belum dikonfigurasi: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL dan FIREBASE_PRIVATE_KEY."
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

let app: App | undefined;
const getApp = () => (app ??= createApp());

export const adminAuth = () => getAuth(getApp());
export const db = () => getFirestore(getApp());
