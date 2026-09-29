"use client";

import { ChevronRight } from "lucide-react";
import { fmt } from "@/lib/i18n/config";
import { KitIcon } from "@/components/common/KitIcon";
import { selectKits, selectStats, useAppSelector } from "@/lib/store/store";
import { Container } from "./ui";

/** Menu pilih kit di hero — ikut berubah realtime saat admin menambah / mengubah kit */
export function LiveKitMenu({ liveIn, comingSoon }: { liveIn: string; comingSoon: string }) {
  const kits = useAppSelector(selectKits);
  if (kits.length === 0) return null;

  return (
    <ul
      className={`grid gap-px overflow-hidden border border-line bg-line ${
        kits.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : kits.length === 2 ? "sm:grid-cols-2" : ""
      }`}
    >
      {kits.map((k, i) => {
        const soon = k.status === "coming_soon";
        return (
          <li key={k.id}>
            <a
              href={`#kit-${k.id}`}
              className="group relative flex h-full items-center gap-4 bg-bg/80 px-5 py-4 text-left backdrop-blur transition-colors hover:bg-surface-2"
            >
              <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gold-grad transition-transform duration-300 group-hover:scale-x-100" />
              <span className="font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-line-strong text-gold transition-colors group-hover:border-gold">
                <KitIcon icon={k.icon} size={18} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="truncate font-display text-lg font-bold uppercase leading-tight tracking-wide text-fg">{k.name}</span>
                  <span className="shrink-0 font-mono text-[11px] text-dim">v{k.version}</span>
                </span>
                <span className="block truncate text-xs text-dim">
                  {k.tag} · {soon ? comingSoon : fmt(liveIn, { n: k.stats.activePlaces })}
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-dim transition-all group-hover:translate-x-0.5 group-hover:text-gold" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Angka statistik — realtime dari dokumen stats/public */
export function LiveStatsBand({ labels }: { labels: { places: string; licenses: string; check: string; rating: string } }) {
  const stats = useAppSelector(selectStats);
  const kits = useAppSelector(selectKits);

  const rated = kits.filter((k) => k.rating != null);
  const rating = rated.length ? (rated.reduce((s, k) => s + (k.rating ?? 0), 0) / rated.length).toFixed(1) : "—";

  const items = [
    { label: labels.places, value: stats.placesActive.toLocaleString(), live: true },
    { label: labels.licenses, value: stats.licensesIssued.toLocaleString(), live: true },
    { label: labels.check, value: "0.8s" },
    { label: labels.rating, value: rating },
  ];

  return (
    <div id="stats" className="relative border-y border-line bg-surface/60 backdrop-blur">
      <Container>
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col-reverse py-8 text-center ${i % 2 === 1 ? "border-l border-line" : ""} ${
                i >= 2 ? "border-t border-line lg:border-t-0" : ""
              } ${i === 2 ? "lg:border-l" : ""}`}
            >
              <dt className="mt-2 flex items-center justify-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                {s.live && (
                  <span className="relative flex h-1.5 w-1.5" aria-hidden>
                    <span className="absolute inset-0 animate-ping rounded-full bg-green opacity-70" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-green" />
                  </span>
                )}
                {s.label}
              </dt>
              <dd className="font-display text-5xl font-bold tabular-nums tracking-tight text-gold-metal">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
