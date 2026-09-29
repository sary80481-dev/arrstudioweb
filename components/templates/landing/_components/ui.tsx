import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Reveal } from "./Motion";

/* ─── CONTAINER ─── */
export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

/* ─── SECTION ─── */
export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`relative py-24 md:py-32 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

/* ─── EYEBROW: "01 — KITS" ─── */
export function Eyebrow({ index, children, center = false }: { index?: string; children: ReactNode; center?: boolean }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted ${center ? "justify-center" : ""}`}>
      {index && <span className="text-gold">{index}</span>}
      <span className="h-[3px] w-6 bg-gold" />
      {children}
    </p>
  );
}

/* ─── SECTION HEADING ─── */
export function SectionHeading({
  index,
  eyebrow,
  title,
  desc,
  center = false,
  className = "",
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  desc?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={`mb-12 md:mb-16 ${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}>
      <Eyebrow index={index} center={center}>{eyebrow}</Eyebrow>
      <h2 className="mt-6 font-display text-[2.75rem] font-bold uppercase leading-[0.92] tracking-[-0.01em] text-fg text-balance sm:text-6xl md:text-7xl">
        {title}
      </h2>
      {desc && <p className={`mt-5 text-base leading-relaxed text-muted text-pretty md:text-lg ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>{desc}</p>}
    </Reveal>
  );
}

/* ─── GOLD WORD ─── */
export function Gold({ children }: { children: ReactNode }) {
  return <span className="text-gold-metal">{children}</span>;
}

/* ─── BUTTON (chamfer) ─── */
type Variant = "gold" | "outline";
type Size = "md" | "lg";

const sizeClass: Record<Size, string> = {
  md: "h-11 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "className" | "children">;

export function Button({ variant = "gold", size = "md", href, className = "", children, ...rest }: ButtonProps) {
  const base = `group/btn relative inline-flex items-center justify-center rounded-xl font-display font-semibold uppercase tracking-[0.14em] whitespace-nowrap transition-[filter,transform,box-shadow] duration-300 hover:-translate-y-0.5 active:translate-y-0`;

  const inner =
    variant === "gold" ? (
      <span className={`relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gold-grad text-on-gold ${sizeClass[size]}`}>
        {/* kilau lewat saat hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-white/40 blur-md group-hover/btn:animate-[shine_0.9s_ease]"
        />
        <span className="relative flex items-center gap-2.5">{children}</span>
      </span>
    ) : (
      <span
        className={`flex w-full items-center justify-center gap-2.5 rounded-xl border border-line-strong bg-surface/60 text-fg transition-colors group-hover/btn:border-gold group-hover/btn:bg-gold-soft ${sizeClass[size]}`}
      >
        {children}
      </span>
    );

  const cls = `${base} ${variant === "gold" ? "shadow-[0_10px_30px_-12px_var(--gold)] hover:brightness-105 hover:shadow-[0_16px_36px_-12px_var(--gold)]" : ""} ${className}`;

  if (href) {
    return href.startsWith("/") ? (
      <Link href={href} className={cls}>{inner}</Link>
    ) : (
      <a href={href} className={cls}>{inner}</a>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
}

/* ─── PANEL: kartu membulat dengan border 1px (emas bila highlight) ─── */
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
    <div className={`rounded-3xl p-px ${highlight ? "bg-gold-grad" : "bg-line-strong"} ${className}`}>
      <div className={`h-full overflow-hidden rounded-[calc(1.5rem-1px)] bg-surface ${innerClassName}`}>{children}</div>
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
    <Link href={href} className="flex shrink-0 items-center gap-2.5" aria-label="ArrStudio home">
      <LogoImage size={44} eager className="h-11 w-11 object-contain" />
      <span className="hidden font-display text-lg font-bold uppercase leading-none tracking-[0.18em] text-fg sm:block">
        Arr<span className="text-gold">Studio</span>
      </span>
    </Link>
  );
}
