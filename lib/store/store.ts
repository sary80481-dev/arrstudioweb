import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { catalogSlice, licensesSlice, pricingSlice, realtimeSlice, statsSlice } from "./slices";

const rootReducer = combineReducers({
  catalog: catalogSlice.reducer,
  stats: statsSlice.reducer,
  pricing: pricingSlice.reducer,
  licenses: licensesSlice.reducer,
  realtime: realtimeSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Store dibuat per request / per halaman (bukan global) — pola yang disarankan untuk
 * App Router agar data satu user tidak bocor ke user lain saat render server.
 */
export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({ reducer: rootReducer, preloadedState });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

/* ─── selector ─── */
export const selectKits = (s: RootState) => s.catalog.kits;
export const selectStats = (s: RootState) => s.stats;
export const selectPricing = (s: RootState) => s.pricing;
export const selectLicenses = (s: RootState) => s.licenses;
export const selectRealtime = (s: RootState) => s.realtime;
