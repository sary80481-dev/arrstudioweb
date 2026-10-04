/* Persetujuan cookie. Cookie "penting" (sesi login, keamanan) selalu aktif.
   "Preferensi" (mengingat bahasa pilihan) hanya disimpan bila pengunjung menerima.
   Tidak ada cookie iklan / pelacak di situs ini. */

export type Consent = "all" | "necessary";

export const CONSENT_KEY = "arr_consent";
/** dikirim juga sebagai cookie agar server tahu pilihannya (1 tahun) */
export const CONSENT_EVENT = "arr:cookie-settings";

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "all" || v === "necessary" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {}
  document.cookie = `${CONSENT_KEY}=${value}; path=/; max-age=31536000; SameSite=Lax`;
  // menolak → cookie preferensi yang sudah ada ikut dihapus
  if (value === "necessary") document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
}

export const preferencesAllowed = () => readConsent() === "all";

export const consentStrings = {
  en: { title: "Cookies", text: "We use essential cookies to keep you signed in and secure. With your OK we also remember your language. No ads, no tracking.", all: "Accept all", necessary: "Necessary only", settings: "Cookie settings" },
  id: { title: "Cookie", text: "Kami memakai cookie penting agar kamu tetap masuk dan aman. Dengan izinmu, kami juga mengingat bahasa pilihanmu. Tanpa iklan, tanpa pelacakan.", all: "Terima semua", necessary: "Hanya yang penting", settings: "Pengaturan cookie" },
  ms: { title: "Kuki", text: "Kami menggunakan kuki penting untuk memastikan anda kekal log masuk dan selamat. Dengan kebenaran anda, kami juga mengingati bahasa pilihan anda. Tiada iklan, tiada penjejakan.", all: "Terima semua", necessary: "Yang perlu sahaja", settings: "Tetapan kuki" },
  fil: { title: "Cookies", text: "Gumagamit kami ng mahahalagang cookie para manatili kang naka-sign in at ligtas. Sa pahintulot mo, naaalala rin namin ang wika mo. Walang ads, walang tracking.", all: "Tanggapin lahat", necessary: "Mahahalaga lang", settings: "Mga setting ng cookie" },
  vi: { title: "Cookie", text: "Chúng tôi dùng cookie cần thiết để giữ bạn đăng nhập và an toàn. Nếu bạn đồng ý, chúng tôi cũng nhớ ngôn ngữ của bạn. Không quảng cáo, không theo dõi.", all: "Chấp nhận tất cả", necessary: "Chỉ cần thiết", settings: "Cài đặt cookie" },
  th: { title: "คุกกี้", text: "เราใช้คุกกี้ที่จำเป็นเพื่อให้คุณล็อกอินอยู่และปลอดภัย หากคุณอนุญาต เราจะจำภาษาของคุณด้วย ไม่มีโฆษณา ไม่มีการติดตาม", all: "ยอมรับทั้งหมด", necessary: "เฉพาะที่จำเป็น", settings: "การตั้งค่าคุกกี้" },
} as const;

export type ConsentLang = keyof typeof consentStrings;
export const consentLang = (l: string): ConsentLang => (l in consentStrings ? (l as ConsentLang) : "en");
