import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="container flex flex-col items-center justify-between gap-6 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2 font-display font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Portfolio AI
        </div>
        <p>&copy; {new Date().getFullYear()} Portfolio AI. Built to ship, not to demo.</p>
        <div className="flex items-center gap-6">
          <Link href="/generator" className="hover:text-foreground">Generator</Link>
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </div>
      </div>
    </footer>
  );
}
