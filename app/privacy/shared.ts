import { DISCORD_INVITE } from "@/lib/links";
import { ORDER_WHATSAPP } from "@/components/templates/landing/_data/landing";

/* ============================================================
   Kebijakan Privasi — isi mengikuti cara kerja sistem yang sebenarnya (lihat docs/API.md).
   PENTING: ubah LEGAL di bawah dengan data badan usaha/pemilik yang sebenarnya, dan pastikan angka
   retensi di tabel sesuai praktik Anda. Ini bukan nasihat hukum — minta advokat meninjau sebelum dipakai resmi.
   ============================================================ */

export const LEGAL = {
  /** nama yang bertanggung jawab atas data (pengendali data) */
  controller: "ArrStudio",
  /** alamat email privasi — kosongkan bila belum ada; kontak lain tetap tampil */
  email: "",
  updated: "2026-10-04",
};

export const CONTACT = {
  discord: DISCORD_INVITE,
  whatsapp: `https://wa.me/${ORDER_WHATSAPP}`,
};

export type Block =
  | { p: string }
  | { ul: string[] }
  | { table: { head: string[]; rows: string[][] } }
  | { note: string };

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export interface Policy {
  title: string;
  subtitle: string;
  updatedLabel: string;
  tocLabel: string;
  backLabel: string;
  contactLabels: { discord: string; whatsapp: string; email: string };
  sections: Section[];
}

