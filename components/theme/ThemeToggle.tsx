"use client";

import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme } from "./theme";

/**
 * Ikon dipilih lewat CSS (`dark:`), bukan state —
 * jadi markup server & client selalu sama (tanpa hydration mismatch).
 */
export default function ThemeToggle({ label = "Switch theme", className = "" }: { label?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => setTheme(getTheme() === "dark" ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={`group inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg active:scale-90 ${className}`}
    >
      <Sun size={17} strokeWidth={2} className="hidden transition-transform duration-500 group-hover:rotate-90 site-dark:block" />
      <Moon size={17} strokeWidth={2} className="block transition-transform duration-500 group-hover:-rotate-12 site-dark:hidden" />
    </button>
  );
}
