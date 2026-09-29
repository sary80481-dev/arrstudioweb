import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { firebaseConfigured, firestore } from "./firebase/client";
import { docToKit } from "./firestore-convert";
import { toPricing } from "./pricing";
import { kitsReceived, pricingReceived, statsReceived } from "./store/slices";
import type { AppDispatch } from "./store/store";

/**
 * Listener realtime untuk landing (katalog kit publik + statistik).
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

  const unsubStats = onSnapshot(
    doc(db, "stats", "public"),
    (snap) => {
      const d = snap.data();
      if (d) dispatch(statsReceived({ licensesIssued: d.licensesIssued ?? 0, placesActive: d.placesActive ?? 0 }));
    },
    (err) => console.warn("[realtime] stats:", err.code)
  );

  const unsubPricing = onSnapshot(
    doc(db, "settings", "pricing"),
    (snap) => dispatch(pricingReceived(toPricing(snap.data()))),
    (err) => console.warn("[realtime] pricing:", err.code)
  );

  return () => {
    unsubKits();
    unsubStats();
    unsubPricing();
  };
}
