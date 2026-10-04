/* Cicilan lisensi — nominal dicatat admin setelah bukti transfer dicek.
   Lisensi baru terbuka (unduh file, verifikasi kit) saat sudah lunas. */
export interface InstallmentPayment {
  amount: number;
  at: string | null;
  note: string | null;
}

export interface InstallmentDto {
  total: number;
  paid: number;
  remaining: number;
  payments: InstallmentPayment[];
}

/** true = masih ada sisa cicilan, lisensi terkunci */
export const isLocked = (l: { installment: InstallmentDto | null }) => !!l.installment && l.installment.remaining > 0;
