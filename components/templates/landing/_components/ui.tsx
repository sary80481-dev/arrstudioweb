import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./Motion";

/* ============================================================
   Sistem visual landing — "product page":
   - pemisah = blok warna (putih / abu tile / hitam) + ruang, TANPA garis
   - judul besar di tengah, rapat; teks pendukung besar & tenang
   - satu bahasa bentuk: tombol pill, tile rounded-[28px]
   - emas hanya untuk aksi utama & eyebrow
   ============================================================ */

/* ─── CONTAINER ─── */
export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

/* ─── SECTION ───
   plain : latar halaman
   tile  : abu terang (#f5f5f7) / abu gelap — memisahkan tanpa garis
   dark  : selalu hitam, di kedua tema (momen sinematik) */
type Tone = "plain" | "tile" | "dark";

export function Section({
  id,
  tone = "plain",
  className = "",
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-theme={tone === "dark" ? "dark" : undefined}
      className={`relative py-24 md:py-36 ${tone === "tile" ? "bg-surface-2" : "bg-bg"} ${tone === "dark" ? "text-fg" : ""} ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

/* ─── EYEBROW: kata kecil berwarna di atas judul ─── */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[15px] font-semibold text-gold md:text-[17px] ${className}`}>{children}</p>;
}

/** Tetap diekspor (dipakai versi lama) */
export const Label = Eyebrow;

/* ─── SECTION HEADING ─── */
export function SectionHeading({
  label,
  title,
  desc,
  align = "center",
  className = "",
}: {
  label?: string;
  title: ReactNode;
  desc?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal className={`mb-14 md:mb-20 ${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}>
      {label && <Eyebrow>{label}</Eyebrow>}
      <h2 className="text-display mt-3 text-[2.5rem] text-fg sm:text-6xl md:text-[4.5rem]">{title}</h2>
      {desc && (
        <p className={`mt-6 text-lg leading-relaxed text-muted text-pretty md:text-xl ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {desc}
        </p>
      )}
    </Reveal>
  );
}

/** Bagian kedua judul, diredupkan */
export function Muted({ children }: { children: ReactNode }) {
  return <span className="text-muted">{children}</span>;
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
      className={`group inline-flex items-center gap-0.5 text-[17px] text-gold hover:underline hover:underline-offset-4 ${className}`}
    >
      {children}
      <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

/* ─── BUTTON (pill) ─── */
type Variant = "gold" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-7 text-base",
};

const variantClass: Record<Variant, string> = {
  gold: "bg-brand text-on-brand hover:bg-brand-hover",
  outline: "bg-fg/[0.06] text-fg hover:bg-fg/[0.1]",
  ghost: "text-fg hover:bg-fg/[0.06]",
  // di atas video / foto
  light: "bg-white/15 text-white backdrop-blur-md hover:bg-white/25",
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "className" | "children">;

export const buttonClass = (variant: Variant = "gold", size: Size = "md", className = "") =>
  `group/btn inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,color,transform] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${sizeClass[size]} ${variantClass[variant]} ${className}`;

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

/* ─── PANEL: tile berisi (dipakai dashboard) ─── */
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
    <div
      className={`overflow-hidden rounded-[22px] bg-surface-2 ${highlight ? "shadow-[inset_0_0_0_1.5px_var(--gold)]" : ""} ${className}`}
    >
      <div className={`h-full ${innerClassName}`}>{children}</div>
    </div>
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
    <Link href={href} className="flex shrink-0 items-center gap-2" aria-label="ArrStudio home">
      <LogoImage size={28} eager className="h-7 w-7 object-contain" />
      <span className="hidden text-[15px] font-semibold tracking-[-0.01em] text-fg sm:block">ArrStudio</span>
    </Link>
  );
}
