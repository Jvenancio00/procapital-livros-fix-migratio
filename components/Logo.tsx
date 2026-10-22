import Image from "next/image";
import Link from "next/link";

export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative overflow-hidden rounded-lg bg-white p-0.5 shadow-2xs"
    >
      <Image
        src="/procapital/logo.jpg"
        alt="Logótipo Pro Capital — Distribuidora Editorial"
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority
      />
    </div>
  );
}

export default function Logo({
  tagline = true,
  variant = "default",
}: {
  tagline?: boolean;
  variant?: "default" | "light";
}) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <LogoMark />
      {tagline && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-serif text-base font-bold tracking-tight ${
              variant === "light" ? "text-white" : "text-ink"
            }`}
          >
            Pro<span className={variant === "light" ? "text-accent" : "text-brand"}>Capital</span>
          </span>
          <span
            className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] ${
              variant === "light" ? "text-white/65" : "text-ink/55"
            }`}
          >
            Distribuidora Editorial
          </span>
        </span>
      )}
    </Link>
  );
}
