/** Pengaturan harga paket — dokumen Firestore `settings/pricing`, diatur di /admin/pricing */
export interface PricingSettings {
  bundleEnabled: boolean;
  /** harga Studio bundle dalam Rupiah */
  bundlePrice: number;
  /** jumlah license key (= jumlah place) dalam satu bundle */
  bundlePlaces: number;
}

export const DEFAULT_PRICING: PricingSettings = {
  bundleEnabled: true,
  bundlePrice: 599000,
  bundlePlaces: 3,
};

export const toPricing = (d: Partial<PricingSettings> | undefined): PricingSettings => ({
  bundleEnabled: d?.bundleEnabled ?? DEFAULT_PRICING.bundleEnabled,
  bundlePrice: d?.bundlePrice ?? DEFAULT_PRICING.bundlePrice,
  bundlePlaces: d?.bundlePlaces ?? DEFAULT_PRICING.bundlePlaces,
});
