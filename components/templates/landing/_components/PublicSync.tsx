"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store/store";

/**
 * Pasang listener realtime katalog + statistik untuk landing.
 * SDK Firestore di-load belakangan (saat browser idle) — konten awal sudah
 * lengkap dari render server, jadi pengunjung tidak menunggu apa pun.
 */
export default function PublicSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const start = () =>
      import("@/lib/realtime-public").then(({ subscribePublic }) => {
        if (!cancelled) unsubscribe = subscribePublic(dispatch);
      });

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(start, { timeout: 4000 } as IdleRequestOptions);

    return () => {
      cancelled = true;
      cancelIdle(handle);
      unsubscribe?.();
    };
  }, [dispatch]);

  return null;
}
