"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type RootState } from "./store";

/**
 * Buat store sekali per mount, diisi data dari server component (preloaded)
 * supaya render pertama sudah lengkap sebelum listener realtime tersambung.
 */
export default function StoreProvider({ preloaded, children }: { preloaded?: Partial<RootState>; children: ReactNode }) {
  const [store] = useState(() => makeStore(preloaded));
  return <Provider store={store}>{children}</Provider>;
}
