import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Kit, PublicStats } from "@/lib/kits";
import { EMPTY_STATS } from "@/lib/kits";
import { DEFAULT_PRICING, type PricingSettings } from "@/lib/pricing";
import type { LicenseDto } from "@/lib/server/licenses";

/* ─── KATALOG KIT ─── */
export interface CatalogState {
  kits: Kit[];
  /** true setelah snapshot realtime pertama masuk */
  live: boolean;
}

export const catalogSlice = createSlice({
  name: "catalog",
  initialState: { kits: [], live: false } as CatalogState,
  reducers: {
    kitsReceived(state, action: PayloadAction<Kit[]>) {
      state.kits = action.payload;
      state.live = true;
    },
  },
});

/* ─── STATISTIK PUBLIK ─── */
export const statsSlice = createSlice({
  name: "stats",
  initialState: EMPTY_STATS as PublicStats,
  reducers: {
    statsReceived: (_state, action: PayloadAction<PublicStats>) => action.payload,
  },
});

/* ─── PENGATURAN HARGA ─── */
export const pricingSlice = createSlice({
  name: "pricing",
  initialState: DEFAULT_PRICING as PricingSettings,
  reducers: {
    pricingReceived: (_state, action: PayloadAction<PricingSettings>) => action.payload,
  },
});

/* ─── LISENSI ─── */
export interface LicensesState {
  /** null = belum ada snapshot */
  items: LicenseDto[] | null;
  error: string | null;
}

export const licensesSlice = createSlice({
  name: "licenses",
  initialState: { items: null, error: null } as LicensesState,
  reducers: {
    licensesReceived(state, action: PayloadAction<LicenseDto[]>) {
      state.items = action.payload;
      state.error = null;
    },
    licensesFailed(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

/* ─── KONEKSI REALTIME (Firebase client auth) ─── */
export interface RealtimeState {
  /** uid Firebase di browser; subscription area login baru dimulai setelah ini terisi */
  uid: string | null;
  ready: boolean;
  error: string | null;
}

export const realtimeSlice = createSlice({
  name: "realtime",
  initialState: { uid: null, ready: false, error: null } as RealtimeState,
  reducers: {
    connected(state, action: PayloadAction<string>) {
      state.uid = action.payload;
      state.ready = true;
      state.error = null;
    },
    connectionFailed(state, action: PayloadAction<string>) {
      state.uid = null;
      state.ready = true;
      state.error = action.payload;
    },
  },
});

export const { kitsReceived } = catalogSlice.actions;
export const { statsReceived } = statsSlice.actions;
export const { pricingReceived } = pricingSlice.actions;
export const { licensesReceived, licensesFailed } = licensesSlice.actions;
export const { connected, connectionFailed } = realtimeSlice.actions;
