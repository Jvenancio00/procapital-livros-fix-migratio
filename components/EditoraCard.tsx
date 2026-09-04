import Image from "next/image";
import Link from "next/link";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";
import type { Editora } from "@/data/editoras";

export default function EditoraCard({ editora }: { editora: Editora }) {
  const hasContact = editora.phone || editora.email || editora.address;

  return (
    <Link
      href={`/editoras/${editora.slug}`}
      className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-5 transition-colors hover:border-brand/40">
      <div className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl bg-cream-deep/60 p-3 text-center">
        {editora.logo ? (
          <Image
            src={editora.logo}
            alt={editora.name}
            width={140}
            height={48}
            className="max-h-10 w-auto object-contain"
          />
        ) : (
          <span className="flex items-center gap-2 text-foreground/40">
            <BookOpen size={18} className="shrink-0" />
            <span className="text-sm font-medium leading-snug">{editora.name}</span>
          </span>
        )}
      </div>

      {editora.country && (
        <p className="text-center text-[10px] font-medium uppercase tracking-wide text-foreground/40">
          {editora.country}
        </p>
      )}

      {hasContact && (
        <ul className="space-y-1 text-xs text-foreground/60">
          {editora.phone && (
            <li className="flex items-center gap-1.5">
              <Phone size={12} className="shrink-0" />
              {editora.phone}
            </li>
          )}
          {editora.email && (
            <li className="flex items-center gap-1.5">
              <Mail size={12} className="shrink-0" />
              {editora.email}
            </li>
          )}
          {editora.address && (
            <li className="flex items-start gap-1.5">
              <MapPin size={12} className="mt-0.5 shrink-0" />
              {editora.address}
            </li>
          )}
        </ul>
      )}
    </Link>
  );
}
