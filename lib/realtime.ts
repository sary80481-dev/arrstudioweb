"use client";

import { useEffect } from "react";
import { onAuthStateChanged, signInWithCustomToken, signOut } from "firebase/auth";
import {
  collection, doc, limit, onSnapshot, orderBy, query, where,
} from "firebase/firestore";
import { firebaseAuth, firebaseConfigured, firestore } from "./firebase/client";
import type { Kit } from "./kits";
import { docToKit, docToLicense } from "./firestore-convert";
import { toPricing } from "./pricing";
import {
  connected, connectionFailed, kitsReceived, licensesFailed, licensesReceived, pricingReceived, statsReceived,
} from "./store/slices";
import { selectRealtime, useAppDispatch, useAppSelector } from "./store/store";

/* ============================================================
   Listener Firestore (onSnapshot) → Redux store.
   Tiap area memanggil hook sync-nya SEKALI (di komponen *Sync),
   komponen lain cukup membaca store lewat useAppSelector.
   ============================================================ */

const byOrder = (a: Kit, b: Kit) => a.order - b.order || a.name.localeCompare(b.name);

/* ─── LOGIN: sambungkan Firebase di browser dengan custom token dari sesi server ─── */
/** `requireRole`: admin harus punya klaim "admin" (baru ada setelah lulus 2FA) — klaim lama "user" diganti token baru */
export function useRealtimeAuthSync(requireRole?: string) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!firebaseConfigured) {
      dispatch(connectionFailed("Firebase is not configured."));
      return;
    }
    const auth = firebaseAuth();
    let requested = false;

    return onAuthStateChanged(auth, async (user) => {
      // custom token membawa claim `role` yang dipakai firestore.rules
      const claim = user ? (await user.getIdTokenResult()).claims.role : undefined;
      const hasRole = requireRole ? claim === requireRole : Boolean(claim);
      if (user && hasRole) return void dispatch(connected(user.uid));
      if (requested) return;
      requested = true;
      try {
        if (user) await signOut(auth);
        const res = await fetch("/api/auth/firebase-token");
        if (!res.ok) throw new Error("Session expired — please sign in again.");
        const { token } = await res.json();
        await signInWithCustomToken(auth, token);
      } catch (err) {
        dispatch(connectionFailed((err as Error).message));
      }
    });
  }, [dispatch, requireRole]);
}

/** Lisensi realtime — milik sendiri (`ownerUid`) atau semua (admin) */
export function useLicensesSync(scope: { ownerUid: string } | { all: true; max?: number }) {
  const dispatch = useAppDispatch();
  const { uid } = useAppSelector(selectRealtime);
  const owner = "ownerUid" in scope ? scope.ownerUid : null;
  const max = "all" in scope ? (scope.max ?? 200) : 0;

  useEffect(() => {
    if (!uid) return;
    const col = collection(firestore(), "licenses");
    // milik sendiri: tanpa orderBy (tidak butuh composite index) — jumlahnya kecil, urutkan di client
    const q = owner
      ? query(col, where("ownerUid", "==", owner))
      : query(col, orderBy("createdAt", "desc"), limit(max));
    const newestFirst = (a: { createdAt: string | null }, b: { createdAt: string | null }) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    return onSnapshot(
      q,
      (snap) => dispatch(licensesReceived(snap.docs.map((d) => docToLicense(d.data())).sort(newestFirst))),
      (err) => dispatch(licensesFailed(err.message))
    );
  }, [uid, owner, max, dispatch]);
}

/** Semua kit termasuk draft (admin) */
export function useAllKitsSync() {
  const dispatch = useAppDispatch();
  const { uid } = useAppSelector(selectRealtime);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      collection(firestore(), "kits"),
      (snap) => dispatch(kitsReceived(snap.docs.map((d) => docToKit(d.id, d.data())).sort(byOrder))),
      (err) => console.warn("[realtime] admin kits:", err.code)
    );
  }, [uid, dispatch]);
}

/** Pengaturan harga (admin) */
export function usePricingSync() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!firebaseConfigured) return;
    return onSnapshot(doc(firestore(), "settings", "pricing"), (snap) => dispatch(pricingReceived(toPricing(snap.data()))));
  }, [dispatch]);
}

/** Statistik publik saja (dipakai admin overview) */
export function useStatsSync() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!firebaseConfigured) return;
    return onSnapshot(doc(firestore(), "stats", "public"), (snap) => {
      const d = snap.data();
      if (d) dispatch(statsReceived({ licensesIssued: d.licensesIssued ?? 0, placesActive: d.placesActive ?? 0 }));
    });
  }, [dispatch]);
}
