import { createElement } from "react";
import type { LucideProps } from "lucide-react";
import { kitIcon } from "@/lib/kits";

/** Ikon kit berdasarkan key yang disimpan di Firestore (mis. "mountain") */
export function KitIcon({ icon, ...props }: { icon: string } & LucideProps) {
  return createElement(kitIcon(icon), props);
}
