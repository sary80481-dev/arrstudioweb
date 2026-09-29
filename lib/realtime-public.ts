import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { firebaseConfigured, firestore } from "./firebase/client";
import { docToKit } from "./firestore-convert";
import { toPricing } from "./pricing";
import { kitsReceived, pricingReceived } from "./store/slices";
import type { AppDispatch } from "./store/store";

/**
 * Listener realtime untuk landing (katalog kit publik + harga).
 * Modul ini di-import secara dinamis oleh PublicSync, jadi SDK Firestore
 * (~100 KB) tidak ikut bundle awal landing — halaman tetap ringan.
 */
export function subscribePublic(dispatch: AppDispatch): () => void {
  if (!firebaseConfigured) return () => {};
  const db = firestore();

  const unsubKits = onSnapshot(
    query(collection(db, "kits"), where("status", "in", ["active", "coming_soon"])),
    (snap) =>
      dispatch(
        kitsReceived(
          snap.docs
            .map((d) => docToKit(d.id, d.data()))
            .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
        )
      ),
    (err) => console.warn("[realtime] kits:", err.code)
  );

  // statistik tidak lagi ditampilkan di landing → tidak perlu listener stats/public di sini

  const unsubPricing = onSnapshot(
    doc(db, "settings", "pricing"),
    (snap) => dispatch(pricingReceived(toPricing(snap.data()))),
    (err) => console.warn("[realtime] pricing:", err.code)
  );

  return () => {
    unsubKits();
    unsubPricing();
  };
}
