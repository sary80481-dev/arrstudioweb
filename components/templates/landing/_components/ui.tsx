import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./Motion";

/* ============================================================
   Sistem visual landing — "cartoony modern":
   - dua warna: krem (dasar + ink) & kuning (aksen)
   - satu bahasa bentuk: stiker = outline 2px ink + bayangan offset keras
   - tombol "pop": terangkat saat hover, ketekan saat ditekan
   - pemisah section = blok warna bertepi gelombang + pola titik
   - semua section memakai satu pola heading (nomor bab + judul kiri + deskripsi kanan)
   ============================================================ */

/* ─── CONTAINER ─── */
export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-8 ${className}`}>{children}</div>;
}

/* ─── TEPI GELOMBANG ─── 20 lengkung per 1200 unit; garis tetap 2px di layar mana pun */
const WAVE_LINE = `M0,12 ${"q15,-10 30,0 t30,0 ".repeat(20)}`;
const WAVE_FILL = `${WAVE_LINE} L1200,24 L0,24 Z`;

function Wave({ side, fillClass }: { side: "top" | "bottom"; fillClass: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 z-[1] h-4 w-full md:h-5 ${side === "top" ? "bottom-full -mb-px" : "top-full -mt-px rotate-180"}`}
    >
      <path d={WAVE_FILL} className={fillClass} />
      <path d={WAVE_LINE} fill="none" stroke="var(--ink)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ─── SECTION ───
   plain : latar halaman
   tile  : krem lebih tua + pola titik, tepi atas/bawah bergelombang
   dark  : selalu gelap di kedua tema (momen kontras), tepi bergelombang
   accent: blok kuning (token terang di kedua tema), tepi bergelombang */
type Tone = "plain" | "tile" | "dark" | "accent";

export function Section({
  id,
  tone = "plain",
  waves = "both",
  className = "",
  children,
}: {
  id?: string;
  tone?: Tone;
  /** tepi gelombang mana yang digambar — "top" bila section berikutnya juga berwarna (hindari gelombang ganda) */
  waves?: "both" | "top" | "bottom";
  className?: string;
  children: ReactNode;
}) {
  const fill = tone === "tile" ? "fill-surface-2" : tone === "accent" ? "fill-brand" : "fill-bg";
  return (
    <section
      id={id}
      data-theme={tone === "dark" ? "dark" : tone === "accent" ? "light" : undefined}
      className={`relative py-20 md:py-28 ${tone === "plain" ? "bg-bg" : "bg-dots"} ${tone === "tile" ? "bg-surface-2" : ""} ${tone === "dark" ? "bg-bg text-fg" : ""} ${
        // di atas kuning: stiker label & stabilo memakai krem agar tetap terlihat
        tone === "accent" ? "bg-brand text-fg [&_.eyebrow]:bg-surface [&_.marker]:bg-[linear-gradient(transparent_80%,var(--surface)_80%,var(--surface)_96%,transparent_96%)]" : ""
      } ${className}`}
    >
      {tone !== "plain" && (
        <>
          {waves !== "bottom" && <Wave side="top" fillClass={fill} />}
          {waves !== "top" && <Wave side="bottom" fillClass={fill} />}
        </>
      )}
      <Container>{children}</Container>
    </section>
  );
}

/* ─── EYEBROW: stiker kecil miring di atas judul ─── */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`eyebrow pop-sm inline-flex -rotate-2 items-center gap-1.5 rounded-full bg-brand px-3.5 py-1 font-display text-sm font-semibold text-on-brand md:text-[15px] ${className}`}
    >
      {children}
    </p>
  );
}

/** Tetap diekspor (dipakai versi lama) */
export const Label = Eyebrow;

/* ─── PENANDA BAB: stiker label · garis putus-putus · nomor ─── */
export function ChapterMark({ label, index, className = "" }: { label?: string; index?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {label && <Eyebrow>{label}</Eyebrow>}
      <span aria-hidden className="h-0.5 flex-1 rounded-full bg-line" />
      {index != null && (
        <span aria-hidden className="font-display text-sm font-bold text-dim tabular-nums">
          {String(index).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}

/* ─── SECTION HEADING ───
   satu pola untuk semua section: penanda bab di atas, judul kiri, deskripsi kanan (≥ lg) */
export function SectionHeading({
  label,
  index,
  title,
  desc,
  aside,
  className = "",
}: {
  label?: string;
  /** nomor bab (1–8) */
  index?: number;
  title: ReactNode;
  desc?: ReactNode;
  /** elemen tambahan di kolom kanan (mis. tombol navigasi) */
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={`mb-12 md:mb-16 ${className}`}>
      <ChapterMark label={label} index={index} />
      <div className={`mt-6 grid gap-5 ${desc || aside ? "lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-14" : ""}`}>
        <h2 className="t-section max-w-3xl text-fg">{title}</h2>
        {(desc || aside) && (
          <div className="lg:pb-1.5">
            {desc && <p className="max-w-xl text-base leading-relaxed text-muted text-pretty sm:text-lg">{desc}</p>}
            {aside}
          </div>
        )}
      </div>
    </Reveal>
  );
}

/** Bagian kedua judul — diberi stabilo kuning */
export function Muted({ children }: { children: ReactNode }) {
  return <span className="marker text-fg">{children}</span>;
}

export function Gold({ children }: { children: ReactNode }) {
  return <span className="text-gold">{children}</span>;
}

/* ─── LINK "Learn more ›" ─── */
export function MoreLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`group inline-flex items-center gap-1 font-display text-[17px] font-semibold text-fg underline decoration-brand decoration-[3px] underline-offset-[6px] transition-colors hover:decoration-ink ${className}`}
    >
      {children}
      <ChevronRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
    </a>
  );
}

/* ─── BUTTON (pill stiker) ─── */
type Variant = "gold" | "outline" | "ghost" | "light" | "ink";
type Size = "sm" | "md" | "lg";

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

const variantClass: Record<Variant, string> = {
  gold: "btn-pop bg-brand text-on-brand hover:bg-brand-hover",
  outline: "btn-pop bg-surface text-fg",
  ghost: "text-fg hover:bg-fg/[0.07] active:scale-[0.96]",
  // di atas video / foto — tetap stiker krem terang
  light: "btn-pop bg-[#fffdf7] text-[#241a0b]",
  // tombol gelap di atas blok kuning
  ink: "border-2 border-ink bg-ink text-[#fff6e3] shadow-[2px_2px_0_0_var(--brand)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5",
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "className" | "children">;

export const buttonClass = (variant: Variant = "gold", size: Size = "md", className = "") =>
  `group/btn inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold tracking-[0.01em] whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 ${sizeClass[size]} ${variantClass[variant]} ${className}`;

export function Button({ variant = "gold", size = "md", href, className = "", children, ...rest }: ButtonProps) {
  const cls = buttonClass(variant, size, className);
  if (href) {
    return href.startsWith("/") ? (
      <Link href={href} className={cls}>{children}</Link>
    ) : (
      <a href={href} className={cls}>{children}</a>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ─── PANEL: kartu stiker (dipakai dashboard) ─── */
export function Panel({
  className = "",
  innerClassName = "",
  highlight = false,
  children,
}: {
  className?: string;
  innerClassName?: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`pop overflow-hidden rounded-card ${highlight ? "bg-gold-soft" : "bg-surface"} ${className}`}>
      <div className={`h-full ${innerClassName}`}>{children}</div>
    </div>
  );
}

/* ─── HIASAN: bintang kartun (SVG garis, bukan emoji) ─── */
export function Sparkle({ className = "", size = 22 }: { className?: string; size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z"
        fill="var(--brand)"
        stroke="var(--ink)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── LOGO ─── */
export function LogoImage({ size, className = "", eager = false }: { size: number; className?: string; eager?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt="ArrStudio"
      width={size}
      height={size}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className={className}
    />
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group flex shrink-0 items-center gap-2" aria-label="ArrStudio home">
      <span className="pop-sm flex h-9 w-9 items-center justify-center rounded-xl bg-[#241a0b] transition-transform group-hover:-rotate-6">
        <LogoImage size={26} eager className="h-6.5 w-6.5 object-contain" />
      </span>
      <span className="hidden font-display text-lg font-semibold tracking-[-0.01em] text-fg sm:block">ArrStudio</span>
    </Link>
  );
}
