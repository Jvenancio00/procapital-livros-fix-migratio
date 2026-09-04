import Image from "next/image";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Image
        src="/procapital/logo.jpg"
        alt="Pro Capital"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}

export default function Logo({ tagline = false }: { tagline?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      {tagline && (
        <span className="flex flex-col leading-none">
          <span className="text-[13px] font-medium text-ink">pro<span className="text-brand">capital</span></span>
          <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-foreground/50">
            Distribuidora de livros
          </span>
        </span>
      )}
    </span>
  );
}
