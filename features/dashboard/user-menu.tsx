"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "@/lib/auth/auth-client";

export function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <User className="h-3.5 w-3.5" />
        <span className="max-w-[160px] truncate">{email}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="border-b border-border/60 px-4 py-3">
            <p className="truncate text-sm font-medium">{email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> {signingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
