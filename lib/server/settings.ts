import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { toPricing, type PricingSettings } from "@/lib/pricing";

const pricingRef = () => db().collection("settings").doc("pricing");

export async function getPricing(): Promise<PricingSettings> {
  const snap = await pricingRef().get();
  return toPricing(snap.data() as Partial<PricingSettings> | undefined);
}

export async function updatePricing(patch: Partial<PricingSettings>): Promise<PricingSettings> {
  await pricingRef().set({ ...patch, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return getPricing();
}
