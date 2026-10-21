"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand"
    >
      <LogOut size={14} />
      <span>Terminar sessão</span>
    </button>
  );
}
